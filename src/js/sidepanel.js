import {
  buildTranslationCacheKey,
  getLeetCodeProblemSlug,
  isLeetCodeProblemTabUrl,
  isLeetCodeUrl,
} from '../core/translation/translation-utils.js';
import { translateDescriptionHtml } from '../features/sidepanel/description/description-translation.js';
import { renderStructuredDescriptionHtml } from '../features/sidepanel/description/description-section-utils.js';
import {
  applyLeetHubSubview,
  createActivityGridItems,
  createDifficultyDonutStyle,
  createDifficultyStatItems,
  createTopTagItems,
} from '../features/sidepanel/leethub/leethub-view-state.js';
import {
  getTopicCodeLanguageForPath,
  highlightTopicCodeBlocks,
} from '../features/sidepanel/topics/topic-code-highlight.js';

const $ = window.$;
const oAuth2 = window.oAuth2;
const topicPanelUtils = globalThis.LeetHubTopicPanelUtils;
const topicTemplateUtils = globalThis.LeetHubTopicTemplateUtils;
const topicTemplateCatalog = globalThis.LeetHubTopicTemplateCatalog;
const translationLanguageUtils = globalThis.LeetHubTranslationLanguageUtils;
const repositoryFiles = globalThis.LeetHubRepositoryFiles;
const LEETHUB_CONTENT_SCRIPT_FILES = [
  'src/core/config/repository-files.js',
  'src/core/config/leetcode-languages.js',
  'src/core/scratchpad/scratchpad-comment.js',
  'src/core/templates/root-readme-template.js',
  'src/core/templates/topic-readme-template.js',
  'src/js/topic-index-utils.js',
  'src/js/leetcode-account-utils.js',
  'src/js/leetcode.js',
];

let action = false;
let activeProblem = null;
let topicPanelState = {
  problem: null,
  topics: [],
  selectedTopicSlug: '',
  selectedSubtab: 'notes',
};
let shouldRefreshTopicOnFocus = false;
const githubDefaultBranchCache = new Map();

function normalizeTranslationLanguage(language) {
  return (
    translationLanguageUtils?.normalizeTranslationLanguage(language) ??
    translationLanguageUtils?.DEFAULT_TRANSLATION_LANGUAGE ??
    'ko'
  );
}

function getTranslationLanguageName(language) {
  return translationLanguageUtils?.getTranslationLanguageName(language) ?? 'Korean';
}

async function getSelectedTranslationLanguage() {
  const storageKey =
    translationLanguageUtils?.TRANSLATION_LANGUAGE_STORAGE_KEY ?? 'translationLanguage';
  const data = await chrome.storage.local.get(storageKey);
  return normalizeTranslationLanguage(data[storageKey]);
}

function updateDisplayedStats(stats) {
  const safeStats = stats ?? {};

  $('#p_solved').text(safeStats.solved ?? 0);
  $('#leethub_current_streak').text(safeStats.currentStreak ?? 0);
  $('#leethub_best_streak').text(safeStats.bestStreak ?? 0);
  $('#leethub_difficulty_donut').css('background', createDifficultyDonutStyle(safeStats));

  const difficultyStats = $('#leethub_difficulty_stats');
  difficultyStats.empty();

  for (const item of createDifficultyStatItems(safeStats)) {
    const pill = $('<span>', {
      class: `leethub-difficulty-pill ${item.key}`,
    });
    pill.append(
      $('<span>', {
        class: 'leethub-difficulty-label',
        text: item.label,
      }),
      document.createTextNode(' '),
      $('<span>', {
        class: 'leethub-difficulty-value',
        text: item.value,
      }),
    );
    difficultyStats.append(pill);
  }

  const activityGrid = $('#leethub_activity_grid');
  activityGrid.empty();

  for (const item of createActivityGridItems(safeStats.activityByDate ?? {})) {
    activityGrid.append(
      $('<span>', {
        class: `leethub-activity-cell level-${item.level}`,
        title: `${item.date}: ${item.count}`,
        'aria-label': `${item.date}: ${item.count} solved`,
      }),
    );
  }

  const topTags = $('#leethub_top_tags');
  topTags.empty();

  for (const tag of createTopTagItems(safeStats)) {
    const row = $('<div>', {
      class: 'leethub-tag-row',
    });
    row.append(
      $('<span>', {
        class: 'leethub-tag-name',
        text: tag.name,
        title: tag.name,
      }),
      $('<span>', {
        class: 'leethub-tag-count',
        text: tag.count,
      }),
      $('<div>', {
        class: 'leethub-tag-meter',
      }).append(
        $('<span>', {
          css: { width: `${tag.percentage}%` },
        }),
      ),
    );
    topTags.append(row);
  }
}

function initializeStatsRefresh() {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local' || !changes.stats?.newValue) {
      return;
    }

    updateDisplayedStats(changes.stats.newValue);
  });
}

function sendSyncPreviousMessage(tabId, syncButton, syncStatus) {
  chrome.tabs.sendMessage(tabId, { action: 'syncPreviousAcceptedSubmissions' }, response => {
    syncButton.prop('disabled', false);

    if (chrome.runtime.lastError) {
      syncStatus.text('Could not connect to the LeetCode page. Refresh it, then try again.');
      return;
    }

    if (!response?.ok) {
      syncStatus.text(response?.error || 'Sync failed.');
      return;
    }

    const { counts, totalProblems } = response.result;
    syncStatus.text(`Full sync complete. Solved problems: ${counts?.solved ?? totalProblems}.`);
    updateDisplayedStats(counts);
  });
}

function sendMigrateRepositoryStructureMessage(tabId, migrateButton, migrateStatus) {
  chrome.tabs.sendMessage(tabId, { action: 'migrateRepositoryStructure' }, response => {
    migrateButton.prop('disabled', false);

    if (chrome.runtime.lastError) {
      migrateStatus.text('Could not connect to the LeetCode page. Refresh it, then try again.');
      return;
    }

    if (!response?.ok) {
      migrateStatus.text(response?.error || 'Migration failed.');
      return;
    }

    const { moved, updatedTopicIndexes, conflicts } = response.result;
    const conflictText = conflicts?.length ? ` ${conflicts.length} conflicts skipped.` : '';
    migrateStatus.text(
      `Migration complete. Moved ${moved} files and updated ${updatedTopicIndexes} topic indexes.${conflictText}`,
    );
  });
}

function initializeLeetHubControls() {
  $('#authenticate').on('click', () => {
    if (action) {
      oAuth2.begin();
    }
  });

  $('#welcome_URL').attr('href', chrome.runtime.getURL('src/html/welcome.html'));
  $('#hook_URL').attr('href', chrome.runtime.getURL('src/html/welcome.html'));

  $('#open-leethub-settings-btn').on('click', () => applyLeetHubSubview($, 'settings'));
  $('#back-leethub-home-btn').on('click', () => applyLeetHubSubview($, 'home'));

  $('#collapsible-commit-message-icon').click(() => {
    $('#collapsible-commit-message-icon').toggleClass('open');
    $('#collapsible-commit-message-container').toggle();
    chrome.storage.local.get(['custom_commit_message'], data => {
      const commitMessage = data.custom_commit_message;
      if (!commitMessage) {
        $('#custom-commit-msg').attr('placeholder', 'Time: {time}, Space: {space} - LeetHub-Neo');
      } else {
        $('#custom-commit-msg').attr('placeholder', commitMessage);
        $('#custom-commit-msg').val(commitMessage);
      }
    });
  });

  $('#collapsible-difficulty-icon').click(() => {
    $('#collapsible-difficulty-icon').toggleClass('open');
    $('#collapsible-difficulty-container').toggle();
    chrome.storage.local.get({ useDifficultyFolder: false }, data => {
      $('#use-difficulty-folder').prop('checked', data.useDifficultyFolder);
    });
  });

  $('#use-difficulty-folder').change(function () {
    chrome.storage.local.set({ useDifficultyFolder: $(this).is(':checked') });
  });

  $('#collapsible-language-icon').click(() => {
    $('#collapsible-language-icon').toggleClass('open');
    $('#collapsible-language-container').toggle();
    chrome.storage.local.get({ useLanguageFolder: false }, data => {
      $('#use-language-folder').prop('checked', data.useLanguageFolder);
    });
  });

  $('#use-language-folder').change(function () {
    chrome.storage.local.set({ useLanguageFolder: $(this).is(':checked') });
  });

  $('#collapsible-timestamp-icon').click(() => {
    $('#collapsible-timestamp-icon').toggleClass('open');
    $('#collapsible-timestamp-container').toggle();
    chrome.storage.local.get({ useTimestampFilename: false }, data => {
      $('#use-timestamp-filename').prop('checked', data.useTimestampFilename);
    });
  });

  $('#use-timestamp-filename').change(function () {
    chrome.storage.local.set({ useTimestampFilename: $(this).is(':checked') });
  });

  $('#collapsible-solution-post-icon').click(() => {
    $('#collapsible-solution-post-icon').toggleClass('open');
    $('#collapsible-solution-post-container').toggle();
    chrome.storage.local.get({ autoCommitSolutionPost: true }, data => {
      $('#auto-commit-solution-post').prop('checked', data.autoCommitSolutionPost);
    });
  });

  $('#auto-commit-solution-post').change(function () {
    chrome.storage.local.set({ autoCommitSolutionPost: $(this).is(':checked') });
  });

  globalThis.LeetHubTopicTemplateSettings?.initializeTopicTemplateSettingsPanel();
  globalThis.LeetHubTranslationLanguageSettings?.initializeTranslationLanguageSettingsPanel();

  $('#msg-save-btn').click(() => {
    chrome.runtime.sendMessage({
      action: 'customCommitMessageUpdated',
      message: $('#custom-commit-msg').val().trim(),
    });

    const successMessage = $('#success-message');
    successMessage.show();
    setTimeout(() => successMessage.hide(), 3000);
  });

  $('#msg-reset-btn').click(() => {
    $('#custom-commit-msg').val('');
    $('#custom-commit-msg').attr('placeholder', 'Time: {time}, Space: {space} - LeetHub-Neo');
    chrome.runtime.sendMessage({ action: 'customCommitMessageUpdated', message: null });
  });

  $('#sync-previous-btn').click(() => {
    const syncButton = $('#sync-previous-btn');
    const syncStatus = $('#sync-previous-status');

    syncButton.prop('disabled', true);
    syncStatus.text('Open https://leetcode.com/ and keep it active while syncing...');

    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const activeTab = tabs?.[0];

      if (!activeTab?.id || !isLeetCodeUrl(activeTab.url)) {
        syncStatus.text(
          'Open https://leetcode.com/ or https://leetcode.cn/, sign in, then try again.',
        );
        syncButton.prop('disabled', false);
        return;
      }

      chrome.tabs.sendMessage(activeTab.id, { action: 'pingLeetHubNeoContentScript' }, response => {
        if (!chrome.runtime.lastError && response?.ok) {
          sendSyncPreviousMessage(activeTab.id, syncButton, syncStatus);
          return;
        }

        syncStatus.text('Preparing LeetHub-Neo on this LeetCode tab...');
        chrome.scripting.executeScript(
          {
            target: { tabId: activeTab.id },
            files: LEETHUB_CONTENT_SCRIPT_FILES,
          },
          () => {
            if (chrome.runtime.lastError) {
              syncStatus.text('Refresh the LeetCode page, then try again.');
              syncButton.prop('disabled', false);
              return;
            }

            sendSyncPreviousMessage(activeTab.id, syncButton, syncStatus);
          },
        );
      });
    });
  });

  $('#migrate-repository-structure-btn').click(() => {
    const migrateButton = $('#migrate-repository-structure-btn');
    const migrateStatus = $('#migrate-repository-structure-status');
    const shouldContinue = window.confirm(
      'Move existing synced files in GitHub to match the current folder settings?',
    );

    if (!shouldContinue) {
      return;
    }

    migrateButton.prop('disabled', true);
    migrateStatus.text('Open https://leetcode.com/ and keep it active while migrating...');

    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const activeTab = tabs?.[0];

      if (!activeTab?.id || !isLeetCodeUrl(activeTab.url)) {
        migrateStatus.text(
          'Open https://leetcode.com/ or https://leetcode.cn/, sign in, then try again.',
        );
        migrateButton.prop('disabled', false);
        return;
      }

      chrome.tabs.sendMessage(activeTab.id, { action: 'pingLeetHubNeoContentScript' }, response => {
        if (!chrome.runtime.lastError && response?.ok) {
          sendMigrateRepositoryStructureMessage(activeTab.id, migrateButton, migrateStatus);
          return;
        }

        migrateStatus.text('Preparing LeetHub-Neo on this LeetCode tab...');
        chrome.scripting.executeScript(
          {
            target: { tabId: activeTab.id },
            files: LEETHUB_CONTENT_SCRIPT_FILES,
          },
          () => {
            if (chrome.runtime.lastError) {
              migrateStatus.text('Refresh the LeetCode page, then try again.');
              migrateButton.prop('disabled', false);
              return;
            }

            sendMigrateRepositoryStructureMessage(activeTab.id, migrateButton, migrateStatus);
          },
        );
      });
    });
  });

  $('.commit-variable').on('click', function () {
    const variableName = $(this).attr('id');
    $('#custom-commit-msg').val((index, currentValue) => `${currentValue}{${variableName}} `);
  });
}

function initializeLeetHubMode() {
  chrome.storage.local.get('leethub_token', data => {
    const token = data.leethub_token;
    if (token === null || token === undefined) {
      action = true;
      $('#auth_mode').show();
      return;
    }

    const xhr = new XMLHttpRequest();
    xhr.addEventListener('readystatechange', function () {
      if (xhr.readyState !== 4) {
        return;
      }

      if (xhr.status === 200) {
        chrome.storage.local.get('mode_type', data2 => {
          if (data2 && data2.mode_type === 'commit') {
            $('#commit_mode').show();
            chrome.storage.local.get(['stats', 'leethub_hook'], data3 => {
              updateDisplayedStats(data3.stats);
              if (data3.leethub_hook) {
                $('#repo_url').html(
                  `<a target="blank" style="color: cadetblue !important; font-size:0.8em;" href="https://github.com/${data3.leethub_hook}">${data3.leethub_hook}</a>`,
                );
              }
            });
          } else {
            $('#hook_mode').show();
          }
        });
        return;
      }

      if (xhr.status === 401) {
        chrome.storage.local.set({ leethub_token: null }, () => {
          action = true;
          $('#auth_mode').show();
        });
      }
    });
    xhr.open('GET', 'https://api.github.com/user', true);
    xhr.setRequestHeader('Authorization', `token ${token}`);
    xhr.send();
  });
}

function setTranslationStatus(message) {
  $('#translation-status').text(message);
}

function setTranslationActionsVisible(isVisible) {
  $('#translation-actions').prop('hidden', !isVisible);
}

function setActiveView(viewName) {
  $('#problem_translation_mode').prop('hidden', viewName !== 'description');
  $('#scratchpad_mode').prop('hidden', viewName !== 'scratchpad');
  $('#topic_mode').prop('hidden', viewName !== 'topics');
  $('#leethub_mode').prop('hidden', viewName !== 'leethub');
  $('#description-tab').toggleClass('active', viewName === 'description');
  $('#scratchpad-tab').toggleClass('active', viewName === 'scratchpad');
  $('#topics-tab').toggleClass('active', viewName === 'topics');
  $('#leethub-tab').toggleClass('active', viewName === 'leethub');
}

function setProblemTabsVisible(isVisible) {
  $('#sidepanel_tabs').prop('hidden', !isVisible);
  $('#description-tab').prop('disabled', !isVisible);
  $('#scratchpad-tab').prop('disabled', !isVisible);
  $('#topics-tab').prop('disabled', !isVisible);
  $('#leethub-tab').prop('disabled', !isVisible);
}

function showLeetHubOnly() {
  activeProblem = null;
  setProblemTabsVisible(false);
  setTranslationActionsVisible(false);
  setTranslationStatus('');
  setTopicPanelStatus('');
  setActiveView('leethub');
  applyLeetHubSubview($, 'home');
}

function renderProblemHeader(problem) {
  $('#problem-title').text(
    problem.frontendId ? `${problem.frontendId}. ${problem.title}` : problem.title,
  );

  const meta = $('#problem-meta');
  meta.empty();

  if (problem.difficulty) {
    meta.append(
      $('<span>', {
        class: `problem-difficulty-chip ${problem.difficulty.toLowerCase()}`,
        text: problem.difficulty,
      }),
    );
  }

  for (const tag of problem.topicTags ?? []) {
    if (tag.name) {
      meta.append($('<span>', { class: 'problem-topic-chip', text: tag.name }));
    }
  }
}

function setTopicPanelStatus(message) {
  $('#topic-panel-status').text(message);
}

function decodeGitHubContent(content) {
  return decodeURIComponent(escape(atob(content)));
}

function encodeGitHubContent(content) {
  return btoa(unescape(encodeURIComponent(content)));
}

function encodeGitHubPath(path) {
  return String(path)
    .split('/')
    .map(segment => encodeURIComponent(segment))
    .join('/');
}

async function getGitHubTextFile(token, hook, path) {
  const data = await getGitHubTextFileData(token, hook, path);
  return data?.content ?? null;
}

async function getGitHubTextFileData(token, hook, path) {
  const response = await fetch(
    `https://api.github.com/repos/${hook}/contents/${encodeGitHubPath(path)}`,
    {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    },
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`GitHub request failed for ${path}: ${response.status}`);
  }

  const data = await response.json();

  if (!data?.content) {
    return null;
  }

  return {
    content: decodeGitHubContent(data.content),
    sha: data.sha,
  };
}

async function createGitHubTextFile(token, hook, { path, content, message }) {
  return putGitHubTextFile(token, hook, { path, content, message, ignoreExisting: true });
}

async function putGitHubTextFile(token, hook, { path, content, message, sha, ignoreExisting }) {
  const response = await fetch(
    `https://api.github.com/repos/${hook}/contents/${encodeGitHubPath(path)}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        content: encodeGitHubContent(content),
        ...(sha ? { sha } : {}),
      }),
    },
  );

  if (ignoreExisting && (response.status === 409 || response.status === 422)) {
    const existingContent = await getGitHubTextFile(token, hook, path);
    if (existingContent !== null) {
      return;
    }
  }

  if (!response.ok) {
    throw new Error(`Could not save ${path}: ${response.status}`);
  }
}

async function getGitHubDefaultBranch(token, hook) {
  if (githubDefaultBranchCache.has(hook)) {
    return githubDefaultBranchCache.get(hook);
  }

  const response = await fetch(`https://api.github.com/repos/${hook}`, {
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    throw new Error(`Could not load GitHub repository: ${response.status}`);
  }

  const repository = await response.json();
  const branch = repository.default_branch || 'main';
  githubDefaultBranchCache.set(hook, branch);
  return branch;
}

async function getBundledTemplateText(sourcePath) {
  if (!sourcePath) {
    return null;
  }

  const response = await fetch(chrome.runtime.getURL(sourcePath));

  if (!response.ok) {
    return null;
  }

  return response.text();
}

function parseJsonDocument(content) {
  if (!content) {
    return null;
  }

  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function getCatalogTopic(topicSlug) {
  return topicTemplateCatalog?.topics?.find(topic => topic.slug === topicSlug) ?? null;
}

function getTopicSeedSource(topic) {
  return (
    getCatalogTopic(topic.slug) ?? {
      slug: topic.slug,
      name: topic.name || topic.slug,
      templates: [],
    }
  );
}

function getCatalogTemplateFile(topicSlug, templateId, language) {
  const catalogTopic = getCatalogTopic(topicSlug);
  const template = catalogTopic?.templates?.find(item => item.id === templateId);

  return template?.files?.[language] ?? null;
}

async function resolveSeedEntryContent(entry) {
  if (entry.content !== undefined) {
    return entry.content;
  }

  const bundledContent = await getBundledTemplateText(entry.sourcePath);
  if (bundledContent === null) {
    throw new Error(`Bundled template is missing: ${entry.sourcePath}`);
  }

  return bundledContent;
}

async function ensureGitHubTopicEntry(token, hook, entry) {
  const existingContent = await getGitHubTextFile(token, hook, entry.path);

  if (existingContent !== null) {
    return existingContent;
  }

  const content = await resolveSeedEntryContent(entry);
  await createGitHubTextFile(token, hook, {
    path: entry.path,
    content,
    message: entry.message,
  });
  return content;
}

async function ensureGitHubTopicFiles(token, hook, topic, existingFiles) {
  const seedEntries = topicTemplateUtils.createTopicSeedFileEntries(getTopicSeedSource(topic));
  const entriesByPath = new Map(seedEntries.map(entry => [entry.path, entry]));
  const nextFiles = { ...existingFiles };

  const fileMap = {
    readme: existingFiles.paths.readme,
    problems: existingFiles.paths.problems,
    templates: existingFiles.paths.templates,
  };

  for (const [key, path] of Object.entries(fileMap)) {
    if (nextFiles[key] !== null) {
      continue;
    }

    const entry = entriesByPath.get(path);
    if (!entry) {
      continue;
    }

    setTopicPanelStatus(`Creating ${topic.name} topic files...`);
    nextFiles[key] = await ensureGitHubTopicEntry(token, hook, entry);
  }

  return { files: nextFiles, entriesByPath };
}

function createGitHubEditUrl(hook, branch, path) {
  return `https://github.com/${hook}/edit/${encodeURIComponent(branch)}/${encodeGitHubPath(path)}`;
}

function renderTopicSelector() {
  const selector = $('#topic-selector');
  selector.empty();

  for (const topic of topicPanelState.topics) {
    const button = $('<button>', {
      type: 'button',
      class: `topic-chip${topic.slug === topicPanelState.selectedTopicSlug ? ' active' : ''}`,
      text: topic.name,
    });
    button.on('click', () => {
      topicPanelState.selectedTopicSlug = topic.slug;
      renderTopicSelector();
      loadSelectedTopic();
    });
    selector.append(button);
  }
}

async function openSelectedTopicReadmeInGitHub() {
  const topic = topicPanelState.topics.find(
    item => item.slug === topicPanelState.selectedTopicSlug,
  );

  if (!topic) {
    return;
  }

  try {
    const { leethub_token: token, leethub_hook: hook } = await chrome.storage.local.get([
      'leethub_token',
      'leethub_hook',
    ]);

    if (!token || !hook) {
      setTopicPanelStatus('Connect GitHub before editing topic notes.');
      return;
    }

    const branch = await getGitHubDefaultBranch(token, hook);
    const paths = topicPanelUtils.createTopicGithubPaths(topic.slug);
    chrome.tabs.create({
      url: createGitHubEditUrl(hook, branch, paths.readme),
    });
  } catch (error) {
    setTopicPanelStatus(error.message);
  }
}

async function openTopicTemplateInGitHub(entry) {
  const topic = topicPanelState.topics.find(
    item => item.slug === topicPanelState.selectedTopicSlug,
  );

  if (!topic || !entry?.path) {
    return;
  }

  try {
    const { leethub_token: token, leethub_hook: hook } = await chrome.storage.local.get([
      'leethub_token',
      'leethub_hook',
    ]);

    if (!token || !hook) {
      setTopicPanelStatus('Connect GitHub before editing topic templates.');
      return;
    }

    const branch = await getGitHubDefaultBranch(token, hook);
    const path = `${repositoryFiles.TOPICS_BASE_PATH}/${topic.slug}/${entry.path}`;
    shouldRefreshTopicOnFocus = true;
    chrome.tabs.create({
      url: createGitHubEditUrl(hook, branch, path),
    });
  } catch (error) {
    setTopicPanelStatus(error.message);
  }
}

function renderRelatedProblems(problems, solutionContents) {
  const container = $('#topic-related-problems');
  container.empty();

  container.append($('<h3>', { text: 'Related Problems' }));

  if (!problems.length) {
    container.append(
      $('<p>', { class: 'topic-empty', text: 'No synced problems for this topic.' }),
    );
    return;
  }

  const list = $('<div>', { class: 'related-problem-list' });
  for (const problem of problems) {
    const label = `${problem.frontendId ? `${problem.frontendId}. ` : ''}${problem.title}`;
    const item = $('<details>', { class: 'related-problem-item' });
    const summary = $('<summary>');
    summary.append($('<span>', { class: 'related-problem-title', text: label }));
    if (problem.difficulty) {
      summary.append(
        $('<span>', {
          class: `problem-difficulty-chip ${problem.difficulty.toLowerCase()}`,
          text: problem.difficulty,
        }),
      );
    }

    const details = $('<div>', { class: 'related-problem-details' });

    for (const solution of problem.solutions) {
      const content = solutionContents.get(solution.path);
      const language = getTopicCodeLanguageForPath(solution.path, solution.language);
      const block = $('<section>', { class: 'related-solution-block' });
      const solutionHeader = $('<div>', { class: 'related-solution-header' });
      solutionHeader.append($('<h4>', { text: solution.language || 'Solution' }));
      solutionHeader.append(
        $('<a>', {
          href: problem.leetcodeUrl,
          target: '_blank',
          text: 'Open on LeetCode',
        }),
      );
      block.append(solutionHeader);
      block.append(
        $('<pre>').append(
          $('<code>', {
            class: language ? `language-${language}` : '',
            text: content || `Solution file not found: ${solution.path}`,
          }),
        ),
      );
      details.append(block);
    }

    if (!problem.solutions.length) {
      details.append(
        $('<div>', { class: 'related-solution-header related-solution-header-empty' }).append(
          $('<span>', { class: 'topic-empty', text: 'No synced solution path yet.' }),
          $('<a>', {
            href: problem.leetcodeUrl,
            target: '_blank',
            text: 'Open on LeetCode',
          }),
        ),
      );
    }

    item.append(summary, details);
    list.append(item);
  }
  container.append(list);
}

function renderCustomTemplateCreateForm(container) {
  const controls = $('<div>', { class: 'topic-template-create-controls' });
  const toolbar = $('<div>', { class: 'topic-template-create-toolbar' });
  const showFormButton = $('<button>', {
    type: 'button',
    class: 'topic-template-create-btn',
    text: 'New template',
  });
  const form = $('<form>', { class: 'topic-template-create-form', hidden: true });
  const input = $('<input>', {
    type: 'text',
    class: 'topic-template-name-input',
    placeholder: 'Template name',
    'aria-label': 'Template name',
  });
  const createButton = $('<button>', {
    type: 'submit',
    class: 'topic-template-create-submit',
    text: 'Create',
  });
  const cancelButton = $('<button>', {
    type: 'button',
    class: 'topic-template-create-cancel',
    text: 'Cancel',
  });
  const actions = $('<div>', { class: 'topic-template-create-actions' });

  showFormButton.on('click', () => {
    showFormButton.prop('hidden', true);
    form.prop('hidden', false);
    input.trigger('focus');
  });
  cancelButton.on('click', () => {
    form.prop('hidden', true);
    showFormButton.prop('hidden', false);
    input.val('');
  });
  form.on('submit', async event => {
    event.preventDefault();
    await createCustomTopicTemplate(input.val());
  });

  actions.append(createButton, cancelButton);
  form.append(input, actions);
  toolbar.append(showFormButton);
  controls.append(toolbar, form);
  container.append(controls);
}

function createUniqueTemplateEntry(entry, templatesDocument, language) {
  const templates = Array.isArray(templatesDocument?.templates) ? templatesDocument.templates : [];
  const usedIds = new Set(templates.map(template => template.id).filter(Boolean));
  const usedPaths = new Set(templates.map(template => template.files?.[language]).filter(Boolean));

  if (!usedIds.has(entry.id) && !usedPaths.has(entry.path)) {
    return entry;
  }

  const pathMatch = entry.path.match(/^(.*?)(\.[^.]+)$/);
  const pathBase = pathMatch ? pathMatch[1] : entry.path;
  const extension = pathMatch ? pathMatch[2] : '';
  let suffix = 2;

  while (
    usedIds.has(`${entry.id}-${suffix}`) ||
    usedPaths.has(`${pathBase}_${suffix}${extension}`)
  ) {
    suffix += 1;
  }

  return {
    ...entry,
    id: `${entry.id}-${suffix}`,
    path: `${pathBase}_${suffix}${extension}`,
  };
}

function appendTemplateEntryToDocument(document, topic, entry, language) {
  const templates = Array.isArray(document?.templates) ? document.templates : [];

  return {
    version: document?.version || 1,
    topic: {
      slug: topic.slug,
      name: topic.name || topic.slug,
    },
    source: document?.source || 'custom',
    updatedAt: new Date().toISOString(),
    templates: [
      ...templates,
      {
        id: entry.id,
        title: entry.title,
        files: {
          [language]: entry.path,
        },
      },
    ],
  };
}

async function createCustomTopicTemplate(templateName) {
  const topic = topicPanelState.topics.find(
    item => item.slug === topicPanelState.selectedTopicSlug,
  );

  if (!topic) {
    return;
  }

  const { leethub_token: token, leethub_hook: hook } = await chrome.storage.local.get([
    'leethub_token',
    'leethub_hook',
  ]);
  const settingsValues = await chrome.storage.local.get([
    topicTemplateUtils.TEMPLATE_LANGUAGE_STORAGE_KEY,
    topicTemplateUtils.SHOW_TEMPLATES_STORAGE_KEY,
  ]);
  const settings = topicTemplateUtils.createTemplateSettings(settingsValues, topicTemplateCatalog);
  const baseEntry = topicTemplateUtils.createCustomTemplateEntry(
    templateName,
    settings.topicTemplateLanguage,
    topicTemplateCatalog,
  );

  if (!baseEntry) {
    setTopicPanelStatus('Enter a template name.');
    return;
  }

  if (!token || !hook) {
    setTopicPanelStatus('Connect GitHub before creating topic templates.');
    return;
  }

  try {
    setTopicPanelStatus(`Creating ${baseEntry.title} template...`);
    const paths = topicPanelUtils.createTopicGithubPaths(topic.slug);
    const templateFile = await getGitHubTextFileData(token, hook, paths.templates);
    const templatesDocument = parseJsonDocument(templateFile?.content) || {
      version: 1,
      topic: {
        slug: topic.slug,
        name: topic.name || topic.slug,
      },
      source: 'custom',
      templates: [],
    };
    const entry = createUniqueTemplateEntry(
      baseEntry,
      templatesDocument,
      settings.topicTemplateLanguage,
    );
    const templatePath = `${repositoryFiles.TOPICS_BASE_PATH}/${topic.slug}/${entry.path}`;
    const templateContent = topicTemplateUtils.createCustomTemplateContent(
      entry.title,
      settings.topicTemplateLanguage,
    );
    const nextTemplatesDocument = appendTemplateEntryToDocument(
      templatesDocument,
      topic,
      entry,
      settings.topicTemplateLanguage,
    );

    await createGitHubTextFile(token, hook, {
      path: templatePath,
      content: templateContent,
      message: `Create ${topic.name} template ${entry.path}`,
    });
    await putGitHubTextFile(token, hook, {
      path: paths.templates,
      content: `${JSON.stringify(nextTemplatesDocument, null, 2)}\n`,
      message: `Update ${topic.name} topic templates`,
      sha: templateFile?.sha,
    });
    await loadSelectedTopic();
    await openTopicTemplateInGitHub(entry);
  } catch (error) {
    setTopicPanelStatus(error.message);
  }
}

function renderTemplateEntries(entries, templateTexts) {
  const container = $('#topic-templates-content');
  container.empty();
  renderCustomTemplateCreateForm(container);

  if (!entries.length) {
    container.append($('<p>', { class: 'topic-empty', text: 'No custom templates yet.' }));
    return;
  }

  for (const entry of entries) {
    const content = templateTexts.get(entry.id) ?? '';
    const language = getTopicCodeLanguageForPath(entry.path);
    const section = $('<section>', { class: 'topic-template-block' });
    const header = $('<div>', { class: 'topic-template-header' });
    header.append($('<h3>', { text: entry.title }));
    header.append(
      $('<button>', {
        type: 'button',
        class: 'topic-template-edit-btn',
        'aria-label': `Edit ${entry.title} template on GitHub`,
        title: 'Edit template on GitHub',
      })
        .append($('<i>', { class: 'icon pencil alternate' }))
        .on('click', () => openTopicTemplateInGitHub(entry)),
    );
    section.append(header);
    section.append(
      $('<pre>').append(
        $('<code>', {
          class: language ? `language-${language}` : '',
          text: content || `Template file not found: ${entry.path}`,
        }),
      ),
    );
    container.append(section);
  }
}

function setTopicSubtab(subtab) {
  topicPanelState.selectedSubtab = subtab;
  $('#topic-notes-tab').toggleClass('active', subtab === 'notes');
  $('#topic-templates-tab').toggleClass('active', subtab === 'templates');
  $('#topic-notes-panel').prop('hidden', subtab !== 'notes');
  $('#topic-templates-panel').prop('hidden', subtab !== 'templates');
}

async function loadSelectedTopic() {
  if (!topicPanelState.selectedTopicSlug) {
    return;
  }

  $('#topic-readme-edit-btn').prop('hidden', true);

  const topic = topicPanelState.topics.find(
    item => item.slug === topicPanelState.selectedTopicSlug,
  );
  const paths = topicPanelUtils.createTopicGithubPaths(topic.slug);
  const { leethub_token: token, leethub_hook: hook } = await chrome.storage.local.get([
    'leethub_token',
    'leethub_hook',
  ]);

  if (!token || !hook) {
    setTopicPanelStatus('Connect GitHub to load topic notes and templates.');
    return;
  }

  setTopicPanelStatus(`Loading ${topic.name}...`);

  try {
    const [readmeContent, problemsContent, templatesContent, settingsValues] = await Promise.all([
      getGitHubTextFile(token, hook, paths.readme),
      getGitHubTextFile(token, hook, paths.problems),
      getGitHubTextFile(token, hook, paths.templates),
      chrome.storage.local.get([
        topicTemplateUtils.TEMPLATE_LANGUAGE_STORAGE_KEY,
        topicTemplateUtils.SHOW_TEMPLATES_STORAGE_KEY,
      ]),
    ]);
    const ensuredTopic = await ensureGitHubTopicFiles(token, hook, topic, {
      paths,
      readme: readmeContent,
      problems: problemsContent,
      templates: templatesContent,
    });
    const topicFiles = ensuredTopic.files;
    const settings = topicTemplateUtils.createTemplateSettings(
      settingsValues,
      topicTemplateCatalog,
    );
    const notesMarkdown = topicFiles.readme;
    const problems = topicPanelUtils.normalizePanelProblems(
      parseJsonDocument(topicFiles.problems),
      undefined,
      {
        currentSlug: topicPanelState.problem?.slug,
      },
    );
    const templatesDocument =
      parseJsonDocument(topicFiles.templates) ||
      (getCatalogTopic(topic.slug)
        ? topicTemplateUtils.createTemplatesJson(getCatalogTopic(topic.slug))
        : null);
    const templateEntries = topicPanelUtils.getTemplateEntriesForLanguage(
      templatesDocument,
      settings.topicTemplateLanguage,
    );
    const solutionContents = new Map();
    const templateTexts = new Map();

    for (const problem of problems) {
      for (const solution of problem.solutions) {
        if (solutionContents.has(solution.path)) {
          continue;
        }

        solutionContents.set(solution.path, await getGitHubTextFile(token, hook, solution.path));
      }
    }

    if (settings.showTopicTemplates) {
      for (const entry of templateEntries) {
        const catalogFile = getCatalogTemplateFile(
          topic.slug,
          entry.id,
          settings.topicTemplateLanguage,
        );
        const githubContent = await getGitHubTextFile(
          token,
          hook,
          `${repositoryFiles.TOPICS_BASE_PATH}/${topic.slug}/${entry.path}`,
        );
        if (githubContent !== null) {
          templateTexts.set(entry.id, githubContent);
          continue;
        }

        const seedEntry = ensuredTopic.entriesByPath.get(
          `${repositoryFiles.TOPICS_BASE_PATH}/${topic.slug}/${entry.path}`,
        ) ?? {
          path: `${repositoryFiles.TOPICS_BASE_PATH}/${topic.slug}/${entry.path}`,
          sourcePath: catalogFile?.sourcePath,
          message: `Create ${topic.name} template ${entry.path}`,
        };
        templateTexts.set(entry.id, await ensureGitHubTopicEntry(token, hook, seedEntry));
      }
    }

    $('#topic-notes-content').html(topicPanelUtils.renderMarkdownToHtml(notesMarkdown));
    $('#topic-readme-edit-btn').prop('hidden', false);
    renderRelatedProblems(problems, solutionContents);

    if (!settings.showTopicTemplates) {
      $('#topic-templates-content')
        .empty()
        .append($('<p>', { class: 'topic-empty', text: 'Templates are hidden in settings.' }));
    } else {
      renderTemplateEntries(templateEntries, templateTexts);
    }

    await highlightTopicCodeBlocks(document.getElementById('topic_mode'));
    setTopicPanelStatus('');
  } catch (error) {
    $('#topic-readme-edit-btn').prop('hidden', true);
    setTopicPanelStatus(error.message);
  }
}

function refreshTopicOnFocus() {
  if (!shouldRefreshTopicOnFocus || !topicPanelState.selectedTopicSlug) {
    return;
  }

  shouldRefreshTopicOnFocus = false;
  loadSelectedTopic().catch(error => setTopicPanelStatus(error.message));
}

function renderTopicPanel(problem) {
  const topics = topicPanelUtils.normalizePanelTopics(
    problem.topicTags ?? [],
    topicTemplateCatalog?.topics ?? [],
  );

  topicPanelState = {
    ...topicPanelState,
    problem,
    topics,
    selectedTopicSlug: topics[0]?.slug ?? '',
  };

  $('#topics-tab').prop('disabled', topics.length === 0);

  if (!topics.length) {
    $('#topic-selector').empty();
    $('#topic-notes-content').empty();
    $('#topic-readme-edit-btn').prop('hidden', true);
    $('#topic-related-problems').empty();
    $('#topic-templates-content').empty();
    setTopicPanelStatus('No topics found for this problem.');
    return;
  }

  renderTopicSelector();
  loadSelectedTopic();
}

async function getCachedTranslation(cacheKey) {
  const data = await chrome.storage.local.get(cacheKey);
  return data[cacheKey] ?? null;
}

async function setCachedTranslation(cacheKey, translatedHtml) {
  await chrome.storage.local.set({
    [cacheKey]: {
      translatedHtml,
      translatedAt: new Date().toISOString(),
    },
  });
}

async function createEnglishTranslator(targetLanguage) {
  if (!('Translator' in globalThis)) {
    throw new Error('Chrome Translator API is not available. Use Chrome 138+ desktop.');
  }

  const availability = await globalThis.Translator.availability({
    sourceLanguage: 'en',
    targetLanguage,
  });

  if (availability === 'unavailable') {
    throw new Error(
      `English to ${getTranslationLanguageName(
        targetLanguage,
      )} translation is unavailable in this Chrome profile.`,
    );
  }

  return globalThis.Translator.create({
    sourceLanguage: 'en',
    targetLanguage,
    monitor(monitor) {
      monitor.addEventListener('downloadprogress', event => {
        const percent = Math.round(event.loaded * 100);
        setTranslationStatus(`Downloading translation model... ${percent}%`);
      });
    },
  });
}

async function translateProblemDescription(problem, { forceRefresh = false } = {}) {
  activeProblem = problem;
  const targetLanguage = await getSelectedTranslationLanguage();
  const targetLanguageName = getTranslationLanguageName(targetLanguage);
  const cacheKey = await buildTranslationCacheKey(
    problem.slug,
    problem.descriptionHtml,
    targetLanguage,
  );

  renderProblemHeader(problem);
  $('#problem_translation_mode').prop('hidden', false);
  setTranslationActionsVisible(true);

  if (!forceRefresh) {
    const cachedTranslation = await getCachedTranslation(cacheKey);
    if (cachedTranslation?.translatedHtml) {
      $('#translated-description').html(
        renderStructuredDescriptionHtml(cachedTranslation.translatedHtml),
      );
      setTranslationStatus('');
      return;
    }
  }

  if (!problem.descriptionHtml) {
    throw new Error('This problem does not have a description to translate.');
  }

  if (targetLanguage === 'en') {
    $('#translated-description').html(renderStructuredDescriptionHtml(problem.descriptionHtml));
    await setCachedTranslation(cacheKey, problem.descriptionHtml);
    setTranslationStatus('');
    return;
  }

  setTranslationStatus(`Preparing ${targetLanguageName} translation...`);
  const translator = await createEnglishTranslator(targetLanguage);

  setTranslationStatus('Translating description...');
  const translatedHtml = await translateDescriptionHtml(
    problem.descriptionHtml,
    text => translator.translate(text),
    { targetLanguage },
  );
  $('#translated-description').html(renderStructuredDescriptionHtml(translatedHtml));
  await setCachedTranslation(cacheKey, translatedHtml);
  setTranslationStatus('');
}

function requestProblemFromTab(tab) {
  if (!isLeetCodeProblemTabUrl(tab.url)) {
    showLeetHubOnly();
    return;
  }

  const slug = getLeetCodeProblemSlug(tab.url);
  if (!slug) {
    showLeetHubOnly();
    return;
  }

  setProblemTabsVisible(true);
  setActiveView('description');
  setTranslationStatus('Loading LeetCode problem description...');

  chrome.tabs.sendMessage(tab.id, { action: 'getCurrentLeetCodeProblem' }, response => {
    if (chrome.runtime.lastError) {
      setTranslationStatus('Refresh the LeetCode page, then reopen the side panel.');
      return;
    }

    if (!response?.ok) {
      setTranslationStatus(response?.error || 'Could not load the LeetCode problem.');
      return;
    }

    translateProblemDescription(response.problem).catch(error => {
      setTranslationStatus(error.message);
      setTranslationActionsVisible(true);
    });
    renderTopicPanel(response.problem);
  });
}

function queryActiveTab(callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const tab = tabs?.[0];
    if (tab?.id && tab?.url) {
      callback(tab);
      return;
    }

    showLeetHubOnly();
  });
}

function initializeTranslationPanel() {
  chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request?.action !== 'getScratchpadContentForUpload') {
      return false;
    }

    sendResponse({
      ok: true,
      content: String($('#scratchpad-input').val() ?? ''),
    });
    return false;
  });

  $('#description-tab').on('click', () => setActiveView('description'));
  $('#scratchpad-tab').on('click', () => setActiveView('scratchpad'));
  $('#topics-tab').on('click', () => setActiveView('topics'));
  $('#leethub-tab').on('click', () => setActiveView('leethub'));
  $('#topic-notes-tab').on('click', () => setTopicSubtab('notes'));
  $('#topic-templates-tab').on('click', () => setTopicSubtab('templates'));
  $('#topic-readme-edit-btn').on('click', openSelectedTopicReadmeInGitHub);
  window.addEventListener('focus', refreshTopicOnFocus);

  $('#translate-refresh-btn').on('click', () => {
    if (activeProblem) {
      translateProblemDescription(activeProblem, { forceRefresh: true }).catch(error =>
        setTranslationStatus(error.message),
      );
    }
  });

  queryActiveTab(requestProblemFromTab);

  chrome.tabs.onActivated.addListener(() => {
    queryActiveTab(requestProblemFromTab);
  });

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.active && tab.url) {
      requestProblemFromTab({ id: tabId, url: tab.url });
    }
  });
}

initializeLeetHubControls();
initializeLeetHubMode();
initializeTranslationPanel();
initializeStatsRefresh();
