import { buildTranslationCacheKey, getLeetCodeProblemSlug } from './translation-utils.js';
import { translateDescriptionHtml } from './description-translation.js';

const $ = window.$;
const oAuth2 = window.oAuth2;

let action = false;
let activeProblem = null;

function updateDisplayedStats(stats) {
  if (!stats) {
    return;
  }

  $('#p_solved').text(stats.solved ?? 0);
  $('#p_solved_easy').text(stats.easy ?? 0);
  $('#p_solved_medium').text(stats.medium ?? 0);
  $('#p_solved_hard').text(stats.hard ?? 0);
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
    syncStatus.text(`Solved problems: ${counts?.solved ?? totalProblems}.`);
    updateDisplayedStats(counts);
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

  $('#collapsible-commit-message-icon').click(() => {
    $('#collapsible-commit-message-icon').toggleClass('open');
    $('#collapsible-commit-message-container').toggle();
    chrome.storage.local.get(['custom_commit_message'], data => {
      const commitMessage = data.custom_commit_message;
      if (!commitMessage) {
        $('#custom-commit-msg').attr('placeholder', 'Time: {time}, Space: {space} - LeetHub-KR');
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
    $('#custom-commit-msg').attr('placeholder', 'Time: {time}, Space: {space} - LeetHub-KR');
    chrome.runtime.sendMessage({ action: 'customCommitMessageUpdated', message: null });
  });

  $('#sync-previous-btn').click(() => {
    const syncButton = $('#sync-previous-btn');
    const syncStatus = $('#sync-previous-status');

    syncButton.prop('disabled', true);
    syncStatus.text('Open a LeetCode tab and keep it active while syncing...');

    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const activeTab = tabs?.[0];

      if (!activeTab?.id || !activeTab.url?.includes('leetcode.')) {
        syncStatus.text('Please open a LeetCode problem page, then click Sync Previous again.');
        syncButton.prop('disabled', false);
        return;
      }

      chrome.tabs.sendMessage(activeTab.id, { action: 'pingLeetHubKRContentScript' }, response => {
        if (!chrome.runtime.lastError && response?.ok) {
          sendSyncPreviousMessage(activeTab.id, syncButton, syncStatus);
          return;
        }

        syncStatus.text('Preparing LeetHub-KR on this LeetCode tab...');
        chrome.scripting.executeScript(
          {
            target: { tabId: activeTab.id },
            files: ['src/js/leetcode.js'],
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
  $('#leethub_mode').prop('hidden', viewName !== 'leethub');
  $('#description-tab').toggleClass('active', viewName === 'description');
  $('#leethub-tab').toggleClass('active', viewName === 'leethub');
}

function setProblemTabsVisible(isVisible) {
  $('#sidepanel_tabs').prop('hidden', !isVisible);
}

function renderProblemHeader(problem) {
  const tagNames = (problem.topicTags ?? []).map(tag => tag.name).filter(Boolean);
  const metaParts = [problem.difficulty, ...tagNames].filter(Boolean);
  $('#problem-title').text(
    problem.frontendId ? `${problem.frontendId}. ${problem.title}` : problem.title,
  );
  $('#problem-meta').text(metaParts.join(' · '));
}

function renderSource(problem) {
  $('#source-description').html(problem.descriptionHtml);
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

async function createEnglishToKoreanTranslator() {
  if (!('Translator' in globalThis)) {
    throw new Error('Chrome Translator API is not available. Use Chrome 138+ desktop.');
  }

  const availability = await globalThis.Translator.availability({
    sourceLanguage: 'en',
    targetLanguage: 'ko',
  });

  if (availability === 'unavailable') {
    throw new Error('English to Korean translation is unavailable in this Chrome profile.');
  }

  return globalThis.Translator.create({
    sourceLanguage: 'en',
    targetLanguage: 'ko',
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
  const cacheKey = await buildTranslationCacheKey(problem.slug, problem.descriptionHtml);

  renderProblemHeader(problem);
  renderSource(problem);
  $('#problem_translation_mode').prop('hidden', false);
  setTranslationActionsVisible(true);

  if (!forceRefresh) {
    const cachedTranslation = await getCachedTranslation(cacheKey);
    if (cachedTranslation?.translatedHtml) {
      $('#translated-description').html(cachedTranslation.translatedHtml);
      setTranslationStatus(
        `Using cached Korean translation from ${cachedTranslation.translatedAt}.`,
      );
      return;
    }
  }

  setTranslationStatus('Preparing Korean translation...');
  const translator = await createEnglishToKoreanTranslator();

  if (!problem.descriptionHtml) {
    throw new Error('This problem does not have a description to translate.');
  }

  setTranslationStatus('Translating description...');
  const translatedHtml = await translateDescriptionHtml(problem.descriptionHtml, text =>
    translator.translate(text),
  );
  $('#translated-description').html(translatedHtml);
  await setCachedTranslation(cacheKey, translatedHtml);
  setTranslationStatus('Korean translation ready.');
}

function requestProblemFromTab(tab) {
  const slug = getLeetCodeProblemSlug(tab.url);
  if (!slug) {
    setProblemTabsVisible(false);
    setActiveView('leethub');
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
  });
}

function queryActiveTab(callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const tab = tabs?.[0];
    if (tab?.id && tab?.url) {
      callback(tab);
    }
  });
}

function initializeTranslationPanel() {
  $('#description-tab').on('click', () => setActiveView('description'));
  $('#leethub-tab').on('click', () => setActiveView('leethub'));

  $('#translate-retry-btn').on('click', () => {
    if (activeProblem) {
      translateProblemDescription(activeProblem).catch(error =>
        setTranslationStatus(error.message),
      );
    }
  });

  $('#translate-refresh-btn').on('click', () => {
    if (activeProblem) {
      translateProblemDescription(activeProblem, { forceRefresh: true }).catch(error =>
        setTranslationStatus(error.message),
      );
    }
  });

  $('#show-source-toggle').on('change', function () {
    $('#source-description').prop('hidden', !$(this).is(':checked'));
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
