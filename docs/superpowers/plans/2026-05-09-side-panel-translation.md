# Side Panel Translation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert LeetHub-KR from a dismissible popup to a persistent Chrome side panel and add a first stable Korean translation view for LeetCode problem descriptions.

**Architecture:** Use a global side panel as the extension UI. Keep existing LeetHub controls centered in the panel, add a small problem translation section, and use a focused LeetCode content script to provide problem data. The side panel owns Chrome Translator API calls, cache lookup, cache writes, and user-facing translation states.

**Tech Stack:** Chrome Extension Manifest V3, Chrome `sidePanel` API, Chrome Translator API, content scripts, `chrome.storage.local`, jQuery/Semantic UI compatibility for existing LeetHub UI, Node built-in `assert` for utility tests, ESLint/Prettier.

---

## Scope Check

This plan implements the first version only: side panel conversion, existing UI centered in the side panel, LeetCode description detection, Korean translation, cache, and clear error states. It intentionally does not implement editorial translation, language settings, visual redesign, or a separate settings page.

## File Structure

- Modify `manifest.json`: remove popup default, add side panel declaration and permission, add focused LeetCode problem provider content script.
- Modify `src/js/background.js`: configure the extension action to open the side panel.
- Create `src/html/sidepanel.html`: extension side panel page, based on current `popup.html`, with one additional translation section.
- Create `src/css/sidepanel.css`: side-panel layout and translation UI styles. Keep existing popup styling untouched for reference.
- Create `src/js/sidepanel.js`: side panel controller. It ports current popup behavior, queries the active tab, requests LeetCode problem data, translates the description, and renders state.
- Create `src/js/leetcode-problem.js`: focused LeetCode content script that returns current problem metadata and description.
- Create `src/js/translation-utils.js`: small module of testable helpers for URL slug detection, cache keys, text normalization, and translation chunking.
- Create `tests/translation-utils.test.mjs`: unit tests for translation helper behavior.
- Modify `package.json`: add `test:unit` script for helper tests.

## Task 1: Add Translation Utility Tests

**Files:**
- Modify: `package.json`
- Create: `src/js/translation-utils.js`
- Create: `tests/translation-utils.test.mjs`

- [ ] **Step 1: Add the unit test script**

In `package.json`, add `test:unit` to the existing `scripts` object:

```json
{
  "scripts": {
    "setup": "npm i",
    "format": "prettier --write **/*.{js,jsx,ts,tsx,css,html}",
    "format-test": "prettier --check **/*.{js,jsx,ts,tsx,css,html}",
    "lint": "eslint . --fix --ignore-pattern 'src/js/static/jquery-3.3.1.min.js' --ignore-pattern 'src/js/static/semantic-2.4.1.min.js'",
    "lint-test": "eslint . --color --ignore-pattern 'src/js/static/jquery-3.3.1.min.js' --ignore-pattern 'src/js/static/semantic-2.4.1.min.js'",
    "test:unit": "node tests/translation-utils.test.mjs"
  }
}
```

- [ ] **Step 2: Write failing tests for URL and translation helpers**

Create `tests/translation-utils.test.mjs`:

```js
import assert from 'node:assert/strict';

import {
  buildTranslationCacheKey,
  chunkTextForTranslation,
  getLeetCodeProblemSlug,
  normalizeTranslationText,
} from '../src/js/translation-utils.js';

assert.equal(
  getLeetCodeProblemSlug('https://leetcode.com/problems/two-sum/'),
  'two-sum',
);
assert.equal(
  getLeetCodeProblemSlug('https://leetcode.com/problems/two-sum/description/'),
  'two-sum',
);
assert.equal(
  getLeetCodeProblemSlug('https://leetcode.com/problems/two-sum/submissions/123/'),
  'two-sum',
);
assert.equal(getLeetCodeProblemSlug('https://leetcode.com/problemset/'), null);
assert.equal(getLeetCodeProblemSlug('https://github.com/legojeon/LeetHub-KR'), null);

assert.equal(
  normalizeTranslationText('  Given   an array\\n\\nof integers,  return indices. '),
  'Given an array\\nof integers, return indices.',
);

assert.deepEqual(chunkTextForTranslation('a\\n\\nb\\n\\nc', 4), ['a\\nb', 'c']);
assert.deepEqual(chunkTextForTranslation('abcdef', 3), ['abcdef']);

const firstKey = await buildTranslationCacheKey('two-sum', '<p>Given nums.</p>');
const secondKey = await buildTranslationCacheKey('two-sum', '<p>Given nums.</p>');
const changedKey = await buildTranslationCacheKey('two-sum', '<p>Changed.</p>');

assert.equal(firstKey, secondKey);
assert.notEqual(firstKey, changedKey);
assert.match(firstKey, /^translation:en-ko:two-sum:[a-f0-9]{16}$/);

console.log('translation-utils tests passed');
```

- [ ] **Step 3: Run the test and confirm it fails because the module does not exist**

Run:

```bash
npm run test:unit
```

Expected:

```text
Error [ERR_MODULE_NOT_FOUND]: Cannot find module
```

- [ ] **Step 4: Implement the helper module**

Create `src/js/translation-utils.js`:

```js
export function getLeetCodeProblemSlug(url) {
  try {
    const parsedUrl = new URL(url);
    if (!/leetcode\.(com|cn)$/.test(parsedUrl.hostname)) {
      return null;
    }

    const match = parsedUrl.pathname.match(/^\/problems\/([^/]+)(?:\/|$)/);
    return match?.[1] ?? null;
  } catch (_error) {
    return null;
  }
}

export function normalizeTranslationText(text) {
  return String(text ?? '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    .trim();
}

export function chunkTextForTranslation(text, maxChunkLength = 3500) {
  const normalizedText = normalizeTranslationText(text);
  if (!normalizedText) {
    return [];
  }

  const paragraphs = normalizedText.split(/\n{2,}/);
  const chunks = [];
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    const nextChunk = currentChunk ? `${currentChunk}\n\n${paragraph}` : paragraph;
    if (currentChunk && nextChunk.length > maxChunkLength) {
      chunks.push(currentChunk);
      currentChunk = paragraph;
    } else {
      currentChunk = nextChunk;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

export async function buildTranslationCacheKey(slug, sourceHtml) {
  const source = `${slug}:${sourceHtml}`;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(source));
  const hash = [...new Uint8Array(digest)]
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 16);

  return `translation:en-ko:${slug}:${hash}`;
}
```

- [ ] **Step 5: Run the unit test and confirm it passes**

Run:

```bash
npm run test:unit
```

Expected:

```text
translation-utils tests passed
```

- [ ] **Step 6: Commit Task 1**

Run:

```bash
git add package.json src/js/translation-utils.js tests/translation-utils.test.mjs
git commit -m "test: add translation utility coverage"
```

## Task 2: Convert Extension Action To Side Panel

**Files:**
- Modify: `manifest.json`
- Modify: `src/js/background.js`

- [ ] **Step 1: Update the manifest for side panel support**

Change the `action`, `permissions`, `content_scripts`, and side panel sections in `manifest.json` so they include this shape:

```json
{
  "action": {
    "default_icon": "assets/thumbnail.png",
    "default_title": "Open LeetHub-KR"
  },
  "side_panel": {
    "default_path": "src/html/sidepanel.html"
  },
  "permissions": [
    "activeTab",
    "scripting",
    "sidePanel",
    "tabs",
    "unlimitedStorage",
    "storage"
  ],
  "content_scripts": [
    {
      "matches": [
        "https://leetcode.com/*",
        "https://leetcode.cn/*",
        "https://github.com/*"
      ],
      "js": [
        "src/js/interceptor.js"
      ],
      "run_at": "document_start",
      "world": "MAIN"
    },
    {
      "matches": [
        "https://leetcode.com/*",
        "https://leetcode.cn/*",
        "https://github.com/*"
      ],
      "js": [
        "src/js/leetcode.js",
        "src/js/authorize.js"
      ],
      "run_at": "document_idle"
    },
    {
      "matches": [
        "https://leetcode.com/*",
        "https://leetcode.cn/*"
      ],
      "js": [
        "src/js/leetcode-problem.js"
      ],
      "run_at": "document_idle"
    }
  ]
}
```

Keep the existing top-level metadata, icons, background, content security policy, and web accessible resources intact. Remove `action.default_popup`.

- [ ] **Step 2: Configure side panel opening in the service worker**

Add this near the bottom of `src/js/background.js`:

```js
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch(error => console.error('Failed to configure side panel behavior:', error));
```

- [ ] **Step 3: Run formatting and lint checks for the manifest/background changes**

Run:

```bash
npm run format-test
npm run lint-test
```

Expected:

```text
All matched files use Prettier code style!
```

ESLint should finish without errors. Warnings are acceptable only if they existed before this task and are unrelated to the changed files.

- [ ] **Step 4: Commit Task 2**

Run:

```bash
git add manifest.json src/js/background.js
git commit -m "feat: open leethub in side panel"
```

## Task 3: Add LeetCode Problem Data Provider

**Files:**
- Create: `src/js/leetcode-problem.js`

- [ ] **Step 1: Create the content script with slug detection and GraphQL fetching**

Create `src/js/leetcode-problem.js`:

```js
function getLeetHubKRBaseUrl() {
  const hostname = window.location.hostname;
  return `https://${hostname.includes('leetcode.cn') ? 'leetcode.cn' : 'leetcode.com'}`;
}

function getCurrentProblemSlug() {
  const match = window.location.pathname.match(/^\/problems\/([^/]+)(?:\/|$)/);
  return match?.[1] ?? null;
}

function htmlToPlainText(html) {
  const template = document.createElement('template');
  template.innerHTML = html ?? '';
  return template.content.textContent.replace(/\s+\n/g, '\n').replace(/\n\s+/g, '\n').trim();
}

async function fetchProblemBySlug(slug) {
  const query = `
query questionDetail($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    title
    titleSlug
    questionFrontendId
    difficulty
    content
    topicTags {
      name
      slug
    }
  }
}`;

  const response = await fetch(`${getLeetHubKRBaseUrl()}/graphql/`, {
    method: 'POST',
    headers: {
      cookie: document.cookie,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: { titleSlug: slug },
      operationName: 'questionDetail',
    }),
  });

  if (!response.ok) {
    throw new Error(`LeetCode GraphQL request failed: ${response.status}`);
  }

  const payload = await response.json();
  if (payload.errors?.length) {
    throw new Error(payload.errors.map(error => error.message).join('; '));
  }

  const question = payload.data?.question;
  if (!question) {
    throw new Error('LeetCode did not return question data.');
  }

  return {
    slug: question.titleSlug,
    title: question.title,
    frontendId: question.questionFrontendId,
    difficulty: question.difficulty,
    topicTags: question.topicTags ?? [],
    descriptionHtml: question.content ?? '',
    descriptionText: htmlToPlainText(question.content ?? ''),
  };
}

function getProblemFromDomFallback(slug) {
  const metaDescription = document.querySelector('meta[name="description"]')?.content ?? '';
  const pageTitle = document.title.split(' - ')[0] || slug;

  if (!metaDescription) {
    throw new Error('Could not find problem description on the page.');
  }

  return {
    slug,
    title: pageTitle,
    frontendId: '',
    difficulty: 'unknown',
    topicTags: [],
    descriptionHtml: `<p>${metaDescription}</p>`,
    descriptionText: metaDescription,
  };
}

async function getCurrentLeetCodeProblem() {
  const slug = getCurrentProblemSlug();
  if (!slug) {
    return {
      ok: false,
      error: 'Open a LeetCode problem page to translate the description.',
    };
  }

  try {
    const problem = await fetchProblemBySlug(slug);
    return { ok: true, problem };
  } catch (error) {
    try {
      return { ok: true, problem: getProblemFromDomFallback(slug) };
    } catch (_fallbackError) {
      return { ok: false, error: error.message };
    }
  }
}

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request?.action !== 'getCurrentLeetCodeProblem') {
    return false;
  }

  getCurrentLeetCodeProblem()
    .then(sendResponse)
    .catch(error => sendResponse({ ok: false, error: error.message }));

  return true;
});
```

- [ ] **Step 2: Run lint on the new content script**

Run:

```bash
npm run lint-test
```

Expected: ESLint finishes without errors in `src/js/leetcode-problem.js`.

- [ ] **Step 3: Commit Task 3**

Run:

```bash
git add src/js/leetcode-problem.js
git commit -m "feat: provide leetcode problem data"
```

## Task 4: Create Side Panel Markup And Layout

**Files:**
- Create: `src/html/sidepanel.html`
- Create: `src/css/sidepanel.css`

- [ ] **Step 1: Create the side panel HTML from the current popup content**

Create `src/html/sidepanel.html` by copying the body content from `src/html/popup.html`, then make these changes:

```html
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <link rel="stylesheet" href="../css/sidepanel.css" />
    <script src="../js/static/jquery-3.3.1.min.js"></script>
    <link
      href="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.4.1/semantic.min.css"
      rel="stylesheet"
    />
    <script src="../js/static/semantic-2.4.1.min.js"></script>
  </head>

  <body>
    <main class="sidepanel-shell">
      <section id="problem_translation_mode" class="translation-panel" hidden>
        <div class="translation-header">
          <p class="translation-eyebrow">LeetCode Description</p>
          <h2 id="problem-title" class="translation-title">Problem</h2>
          <p id="problem-meta" class="translation-meta"></p>
        </div>

        <div id="translation-status" class="translation-status" role="status"></div>

        <div id="translation-actions" class="translation-actions" hidden>
          <button id="translate-retry-btn" class="ui mini secondary button">Retry</button>
          <button id="translate-refresh-btn" class="ui mini button">Refresh</button>
          <label class="translation-toggle">
            <input type="checkbox" id="show-source-toggle" />
            Show original
          </label>
        </div>

        <article id="translated-description" class="translation-content"></article>
        <article id="source-description" class="translation-content source-content" hidden></article>
      </section>

      <section class="leethub-panel">
        <!-- Paste the existing .ui.grid.container markup from src/html/popup.html here unchanged. -->
      </section>
    </main>

    <script src="../js/oauth2.js"></script>
    <script type="module" src="../js/sidepanel.js"></script>
  </body>
</html>
```

When copying the existing popup markup, remove only the old final `<script type="text/javascript" src="../js/popup.js"></script>` line. Keep existing element IDs such as `authenticate`, `hook_URL`, `commit_mode`, `sync-previous-btn`, and `custom-commit-msg`.

- [ ] **Step 2: Add centered side panel styling**

Create `src/css/sidepanel.css`:

```css
body {
  min-width: 320px;
  margin: 0;
  background-color: #dfd9d99d !important;
  color: #222;
  font-size: 13px;
  font-family: 'Helvetica Neue', 'Lucida Grande', sans-serif;
}

.sidepanel-shell {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.leethub-panel {
  width: min(360px, 100%);
  text-align: center;
}

.ui.grid.container {
  width: 100% !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
}

#title {
  font-family: 'Norwester', 'Helvetica Neue', 'Lucida Grande', sans-serif;
  font-size: 30px;
  font-weight: bold;
  margin-bottom: 0;
  margin-top: 10px;
}

#caption {
  font-family: 'Norwester', 'Helvetica Neue', 'Lucida Grande', sans-serif;
  font-size: 14px;
  font-weight: normal;
  margin-bottom: 0;
}

.onboarding {
  font-family: sans-serif;
  border-top: solid black 1px;
  font-weight: 500;
  padding-top: 2%;
  font-size: medium;
}

.collapsible-icon {
  font-size: 10px;
  width: 20px;
  height: 20px;
  background-color: transparent;
  transition: transform 0.3s ease;
  display: inline-block;
  cursor: pointer;
}

.collapsible-icon:hover {
  background-color: #cfc9c980 !important;
}

.collapsible-icon.open {
  transform: rotate(90deg);
}

.collapsible-container {
  margin-top: 1em;
  margin-bottom: 1em;
  border: 1px dotted black;
  padding: 1em;
  display: flex;
  flex-direction: column;
  gap: 1em;
}

.setting-btns {
  align-items: center;
  background-color: #fff;
  border: 1px solid #000;
  box-sizing: border-box;
  color: #000;
  cursor: pointer;
  display: inline-flex;
  fill: #000;
  justify-content: center;
  letter-spacing: 0;
  outline: 0;
  padding: 0 17px;
  text-align: center;
  text-decoration: none;
  transition: all 0.3s;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
}

#custom-commit-msg {
  width: 100%;
  padding: 12px 20px;
  box-sizing: border-box;
  border: 2px solid #ccc;
  border-radius: 4px;
  background-color: #f8f8f8;
  font-size: 16px;
  resize: none;
}

.commit-variable {
  box-sizing: border-box;
  background-color: #a8dadc;
  border: none;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  border-radius: 30px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid black;
  margin: 2px;
}

.commit-variable:hover {
  background-color: #457b9d;
}

#success-message {
  color: green;
  font-size: 14px;
  display: none;
}

.translation-panel {
  width: min(360px, 100%);
  box-sizing: border-box;
  padding: 12px;
  border: 1px solid rgba(0, 0, 0, 0.16);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.78);
  text-align: left;
}

.translation-eyebrow {
  margin: 0 0 4px;
  color: #666;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.translation-title {
  margin: 0;
  font-size: 18px;
  line-height: 1.3;
}

.translation-meta {
  margin: 6px 0 0;
  color: #555;
  font-size: 12px;
}

.translation-status {
  margin-top: 10px;
  color: #444;
  font-size: 12px;
  line-height: 1.45;
}

.translation-actions {
  margin-top: 10px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.translation-toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.translation-content {
  margin-top: 12px;
  white-space: pre-wrap;
  line-height: 1.58;
  font-size: 13px;
}

.source-content {
  color: #555;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  padding-top: 10px;
}
```

- [ ] **Step 3: Run format check and fix if needed**

Run:

```bash
npm run format-test
```

Expected: if Prettier reports the new files need formatting, run `npm run format`, then re-run `npm run format-test`.

- [ ] **Step 4: Commit Task 4**

Run:

```bash
git add src/html/sidepanel.html src/css/sidepanel.css
git commit -m "feat: add side panel layout"
```

## Task 5: Port Popup Behavior Into Side Panel Controller

**Files:**
- Create: `src/js/sidepanel.js`

- [ ] **Step 1: Create the side panel controller with existing LeetHub behavior**

Create `src/js/sidepanel.js`:

```js
import {
  buildTranslationCacheKey,
  chunkTextForTranslation,
  getLeetCodeProblemSlug,
  normalizeTranslationText,
} from './translation-utils.js';

const $ = window.$;
const oAuth2 = window.oAuth2;

let action = false;
let activeProblem = null;
let activeCacheKey = null;

function updateDisplayedStats(stats) {
  if (!stats) {
    return;
  }

  $('#p_solved').text(stats.solved ?? 0);
  $('#p_solved_easy').text(stats.easy ?? 0);
  $('#p_solved_medium').text(stats.medium ?? 0);
  $('#p_solved_hard').text(stats.hard ?? 0);
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
```

- [ ] **Step 2: Add side panel translation placeholders to the controller**

Append this code to `src/js/sidepanel.js`:

```js
function setTranslationStatus(message) {
  $('#translation-status').text(message);
}

function setTranslationActionsVisible(isVisible) {
  $('#translation-actions').prop('hidden', !isVisible);
}

function renderProblemHeader(problem) {
  const tagNames = (problem.topicTags ?? []).map(tag => tag.name).filter(Boolean);
  const metaParts = [problem.difficulty, ...tagNames].filter(Boolean);
  $('#problem-title').text(problem.frontendId ? `${problem.frontendId}. ${problem.title}` : problem.title);
  $('#problem-meta').text(metaParts.join(' · '));
}

function renderSource(problem) {
  $('#source-description').text(normalizeTranslationText(problem.descriptionText));
}

async function getCachedTranslation(cacheKey) {
  const data = await chrome.storage.local.get(cacheKey);
  return data[cacheKey] ?? null;
}

async function setCachedTranslation(cacheKey, translatedText) {
  await chrome.storage.local.set({
    [cacheKey]: {
      translatedText,
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
  activeCacheKey = await buildTranslationCacheKey(problem.slug, problem.descriptionHtml);

  renderProblemHeader(problem);
  renderSource(problem);
  $('#problem_translation_mode').prop('hidden', false);
  setTranslationActionsVisible(true);

  if (!forceRefresh) {
    const cachedTranslation = await getCachedTranslation(activeCacheKey);
    if (cachedTranslation?.translatedText) {
      $('#translated-description').text(cachedTranslation.translatedText);
      setTranslationStatus(`Using cached Korean translation from ${cachedTranslation.translatedAt}.`);
      return;
    }
  }

  setTranslationStatus('Preparing Korean translation...');
  const translator = await createEnglishToKoreanTranslator();
  const chunks = chunkTextForTranslation(problem.descriptionText);

  if (!chunks.length) {
    throw new Error('This problem does not have a description to translate.');
  }

  const translatedChunks = [];
  for (let index = 0; index < chunks.length; index += 1) {
    setTranslationStatus(`Translating description... ${index + 1}/${chunks.length}`);
    translatedChunks.push(await translator.translate(chunks[index]));
  }

  const translatedText = translatedChunks.join('\n\n');
  $('#translated-description').text(translatedText);
  await setCachedTranslation(activeCacheKey, translatedText);
  setTranslationStatus('Korean translation ready.');
}

function requestProblemFromTab(tab) {
  const slug = getLeetCodeProblemSlug(tab.url);
  if (!slug) {
    $('#problem_translation_mode').prop('hidden', true);
    return;
  }

  $('#problem_translation_mode').prop('hidden', false);
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

function initializeTranslationPanel() {
  $('#translate-retry-btn').on('click', () => {
    if (activeProblem) {
      translateProblemDescription(activeProblem).catch(error => setTranslationStatus(error.message));
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

  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const tab = tabs?.[0];
    if (tab?.id && tab?.url) {
      requestProblemFromTab(tab);
    }
  });

  chrome.tabs.onActivated.addListener(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const tab = tabs?.[0];
      if (tab?.id && tab?.url) {
        requestProblemFromTab(tab);
      }
    });
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
```

- [ ] **Step 3: Run the unit and lint checks**

Run:

```bash
npm run test:unit
npm run lint-test
```

Expected: unit tests pass and ESLint reports no errors in `src/js/sidepanel.js`.

- [ ] **Step 4: Commit Task 5**

Run:

```bash
git add src/js/sidepanel.js
git commit -m "feat: port leethub controls to side panel"
```

## Task 6: Wire HTML, Styles, And Controller Together

**Files:**
- Modify: `src/html/sidepanel.html`
- Modify: `src/css/sidepanel.css`
- Modify: `src/js/sidepanel.js`

- [ ] **Step 1: Replace the placeholder in `sidepanel.html`**

Replace the comment `<!-- Paste the existing .ui.grid.container markup from src/html/popup.html here unchanged. -->` with the full `<div class="ui grid container">...</div>` block from `src/html/popup.html`.

Keep this exact script ending:

```html
<script src="../js/oauth2.js"></script>
<script type="module" src="../js/sidepanel.js"></script>
```

- [ ] **Step 2: Confirm hidden fields and IDs exist**

Check that `src/html/sidepanel.html` contains these IDs:

```text
problem_translation_mode
translation-status
translate-retry-btn
translate-refresh-btn
show-source-toggle
translated-description
source-description
authenticate
hook_URL
commit_mode
sync-previous-btn
custom-commit-msg
```

Run:

```bash
rg -n "problem_translation_mode|translation-status|translate-retry-btn|translate-refresh-btn|show-source-toggle|translated-description|source-description|authenticate|hook_URL|commit_mode|sync-previous-btn|custom-commit-msg" src/html/sidepanel.html
```

Expected: every ID appears at least once.

- [ ] **Step 3: Run formatting**

Run:

```bash
npm run format
npm run format-test
```

Expected: Prettier completes, then `format-test` reports all matched files use Prettier code style.

- [ ] **Step 4: Commit Task 6**

Run:

```bash
git add src/html/sidepanel.html src/css/sidepanel.css src/js/sidepanel.js
git commit -m "feat: wire side panel ui"
```

## Task 7: Manual Extension Verification

**Files:**
- No source edits expected unless verification finds a defect.

- [ ] **Step 1: Run all local checks**

Run:

```bash
npm run test:unit
npm run format-test
npm run lint-test
```

Expected:

```text
translation-utils tests passed
All matched files use Prettier code style!
```

ESLint should finish without errors.

- [ ] **Step 2: Load the unpacked extension manually**

Open `chrome://extensions`, enable Developer Mode, click Reload for the existing LeetHub-KR unpacked extension, or click Load unpacked and choose:

```text
/Users/legojeon/Documents/Codex/LeetHub-KR
```

Expected: Chrome accepts the manifest without extension errors.

- [ ] **Step 3: Verify side panel opens from the action icon**

Click the LeetHub-KR extension icon.

Expected:

```text
The UI opens in Chrome's side panel, not a small popup.
Existing LeetHub auth/hook/commit content appears centered.
Clicking the LeetCode page behind the panel does not close the panel.
```

- [ ] **Step 4: Verify non-problem pages stay clean**

Open:

```text
https://leetcode.com/problemset/
```

Expected:

```text
The side panel keeps showing the LeetHub UI.
The description translation section is hidden.
```

- [ ] **Step 5: Verify description translation on Two Sum**

Open:

```text
https://leetcode.com/problems/two-sum/description/
```

Expected:

```text
The side panel shows "LeetCode Description".
The title includes "Two Sum".
The status moves through loading and translation states.
If Chrome Translator API needs a model, download progress appears.
The Korean translation appears in the translated description area.
```

If Chrome reports that Translator API is unavailable, verify the panel shows:

```text
Chrome Translator API is not available. Use Chrome 138+ desktop.
```

- [ ] **Step 6: Verify source toggle and cache**

On the Two Sum page:

```text
Turn on "Show original".
Close and reopen the side panel.
```

Expected:

```text
The original English text appears when the toggle is on.
The second panel open uses cached Korean translation instead of translating from scratch.
```

- [ ] **Step 7: Commit verification fixes if needed**

If manual verification required code fixes, commit them:

```bash
git add manifest.json src/html/sidepanel.html src/css/sidepanel.css src/js/sidepanel.js src/js/leetcode-problem.js src/js/translation-utils.js package.json tests/translation-utils.test.mjs
git commit -m "fix: stabilize side panel translation"
```

If no fixes were needed, do not create an empty commit.

## Final Verification

Run:

```bash
npm run test:unit
npm run format-test
npm run lint-test
```

Expected:

```text
translation-utils tests passed
All matched files use Prettier code style!
```

ESLint must complete without errors.

## Plan Self-Review

- Spec coverage: side panel conversion is covered by Tasks 2, 4, 5, 6, and 7. Existing popup content centered in the side panel is covered by Tasks 4 and 6. Description-only translation is covered by Tasks 1, 3, 5, and 7. Cache and error states are covered by Task 5 and verified in Task 7. Follow-up features are intentionally excluded.
- Placeholder scan: no task contains unresolved `TBD`, `TODO`, or "implement later" instructions. The only HTML placeholder is explicitly replaced in Task 6.
- Type consistency: problem payload fields are `slug`, `title`, `frontendId`, `difficulty`, `topicTags`, `descriptionHtml`, and `descriptionText` across the provider and side panel.
