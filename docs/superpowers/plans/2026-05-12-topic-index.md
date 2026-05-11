# Topic Index Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add link-only topic folders with user notes, generated topic problem JSON, and a root README summary for accepted LeetCode submissions.

**Architecture:** Add a focused classic-script helper at `src/js/topic-index-utils.js` that exposes pure topic/path/JSON/README helpers through `globalThis.LeetHubTopicIndexUtils`. Load it before `src/js/leetcode.js` as a content script, reuse it from `leetcode.js`, and test the same helper from Node by evaluating it in a VM sandbox. Keep GitHub API side effects in `leetcode.js`, while the helper owns deterministic string/object transformations.

**Tech Stack:** Chrome Extension MV3 content scripts, GitHub Contents API, vanilla JavaScript, Node built-in `assert`, Node `vm`, existing npm lint/format/test scripts.

---

## File Structure

- Create `src/js/topic-index-utils.js`
  - Classic browser script with no `import` or `export`.
  - Attaches helper functions to `globalThis.LeetHubTopicIndexUtils`.
  - Responsible for topic slug normalization, generated JSON merge/sort, generated README summary rendering, generated section replacement, and repo path building.
- Create `tests/topic-index-utils.test.mjs`
  - Loads `src/js/topic-index-utils.js` with `node:vm`.
  - Tests pure helper behavior without Chrome APIs.
- Modify `manifest.json`
  - Load `src/js/topic-index-utils.js` before `src/js/leetcode.js` in the existing content script list.
- Modify `package.json`
  - Run both the existing translation tests and new topic index tests in `npm run test:unit`.
- Modify `src/js/leetcode.js`
  - Use `LeetHubTopicIndexUtils` for upload paths, topic JSON merging, topic README initialization, and root README summary.
  - Replace the old root README topic table update flow with the new summary and topic JSON flow.
  - Make Sync Previous update topic metadata even when solution upload is skipped for already-synced problems.

The repository currently has unrelated modified files. During execution, stage only files touched by the current task before each commit.

---

### Task 1: Add Pure Topic Index Helpers

**Files:**
- Create: `src/js/topic-index-utils.js`
- Test later: `tests/topic-index-utils.test.mjs`

- [ ] **Step 1: Create the helper file**

Use `apply_patch` to create `src/js/topic-index-utils.js` with this complete content:

```javascript
(function initializeTopicIndexUtils(globalObject) {
  const TOPICS_BASE_PATH = 'Topics';
  const LEETCODE_BASE_PATH = 'LeetCode';
  const TOPIC_PROBLEMS_FILENAME = 'problems.json';
  const TOPIC_README_FILENAME = 'README.md';
  const SUMMARY_SECTION_START = '<!---LeetHub Summary Start-->';
  const SUMMARY_SECTION_END = '<!---LeetHub Summary End-->';
  const LEGACY_TOPICS_SECTION_START = '<!---LeetCode Topics Start-->';
  const LEGACY_TOPICS_SECTION_END = '<!---LeetCode Topics End-->';

  function normalizeTopicSlug(value) {
    return String(value ?? '')
      .trim()
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function normalizeTopicTag(tag) {
    const name = String(tag?.name ?? tag?.translatedName ?? '').trim();
    const slug = normalizeTopicSlug(tag?.slug || name);

    if (!name || !slug) {
      return null;
    }

    return { slug, name };
  }

  function getProblemNumber(problemName) {
    const match = String(problemName ?? '').match(/^(\d+)/);
    return match ? Number.parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER;
  }

  function buildRepoPath({
    basePath = LEETCODE_BASE_PATH,
    difficulty = '',
    problemName = '',
    filename = '',
    language = '',
    useDifficultyFolder = false,
    useLanguageFolder = false,
  }) {
    const segments = [];

    if (basePath) {
      segments.push(basePath);
    }

    if (useDifficultyFolder && difficulty) {
      segments.push(difficulty);
    }

    if (problemName) {
      segments.push(problemName);
    }

    if (useLanguageFolder && language && filename && !isProblemMetadataFile(filename)) {
      segments.push(language);
    }

    if (filename) {
      segments.push(filename);
    }

    return segments.join('/');
  }

  function isProblemMetadataFile(filename) {
    return ['README.md', 'NOTES.md', 'Solution.md'].includes(filename);
  }

  function buildProblemFolderPath(options) {
    return `${buildRepoPath({ ...options, filename: '' })}/`;
  }

  function buildTopicReadmePath(topicSlug) {
    return `${TOPICS_BASE_PATH}/${topicSlug}/${TOPIC_README_FILENAME}`;
  }

  function buildTopicProblemsPath(topicSlug) {
    return `${TOPICS_BASE_PATH}/${topicSlug}/${TOPIC_PROBLEMS_FILENAME}`;
  }

  function createTopicReadme(topicName) {
    return [
      `# ${topicName}`,
      '',
      '## Concepts',
      '',
      '## Patterns',
      '',
      '## Tips',
      '',
      '## Mistakes',
      '',
    ].join('\n');
  }

  function createEmptyTopicProblems(topic) {
    return {
      version: 1,
      topic,
      updatedAt: new Date().toISOString(),
      problems: [],
    };
  }

  function normalizeTopicProblemsDocument(rawDocument, topic) {
    if (!rawDocument || typeof rawDocument !== 'object' || !Array.isArray(rawDocument.problems)) {
      return createEmptyTopicProblems(topic);
    }

    return {
      version: 1,
      topic,
      updatedAt: rawDocument.updatedAt || new Date().toISOString(),
      problems: rawDocument.problems.map(problem => ({
        ...problem,
        solutions: Array.isArray(problem.solutions) ? problem.solutions : [],
      })),
    };
  }

  function mergeProblemIntoTopicProblems(rawDocument, topic, problemEntry, syncedAt) {
    const document = normalizeTopicProblemsDocument(rawDocument, topic);
    const updatedAt = syncedAt || new Date().toISOString();
    const problems = [...document.problems];
    const existingIndex = problems.findIndex(problem => problem.problemName === problemEntry.problemName);
    const incomingSolutions = Array.isArray(problemEntry.solutions) ? problemEntry.solutions : [];

    if (existingIndex === -1) {
      problems.push({
        ...problemEntry,
        solutions: sortSolutions(
          incomingSolutions.map(solution => ({
            ...solution,
            lastSyncedAt: solution.lastSyncedAt || updatedAt,
          })),
        ),
      });
    } else {
      const existingProblem = problems[existingIndex];
      const mergedSolutions = mergeSolutions(existingProblem.solutions, incomingSolutions, updatedAt);
      problems[existingIndex] = {
        ...existingProblem,
        ...problemEntry,
        solutions: mergedSolutions,
      };
    }

    return {
      version: 1,
      topic,
      updatedAt,
      problems: sortProblems(problems),
    };
  }

  function mergeSolutions(existingSolutions = [], incomingSolutions = [], syncedAt) {
    const merged = [...existingSolutions];

    for (const incomingSolution of incomingSolutions) {
      const existingIndex = merged.findIndex(
        solution => solution.language === incomingSolution.language && solution.path === incomingSolution.path,
      );

      if (existingIndex === -1) {
        merged.push({
          ...incomingSolution,
          lastSyncedAt: incomingSolution.lastSyncedAt || syncedAt,
        });
      } else {
        merged[existingIndex] = {
          ...merged[existingIndex],
          ...incomingSolution,
          lastSyncedAt: syncedAt,
        };
      }
    }

    return sortSolutions(merged);
  }

  function sortProblems(problems) {
    return [...problems].sort((a, b) => {
      const numberDiff = getProblemNumber(a.problemName) - getProblemNumber(b.problemName);
      if (numberDiff !== 0) {
        return numberDiff;
      }
      return String(a.problemName).localeCompare(String(b.problemName));
    });
  }

  function sortSolutions(solutions) {
    return [...solutions].sort((a, b) => {
      const languageDiff = String(a.language).localeCompare(String(b.language));
      if (languageDiff !== 0) {
        return languageDiff;
      }
      return String(a.path).localeCompare(String(b.path));
    });
  }

  function buildProblemEntry({
    frontendId,
    title,
    slug,
    problemName,
    difficulty,
    leetcodeBaseUrl,
    folderPath,
    readmePath,
    language,
    extension,
    solutionPath,
    syncedAt,
  }) {
    return {
      frontendId: String(frontendId ?? ''),
      title: String(title ?? ''),
      slug: String(slug ?? ''),
      problemName,
      difficulty: String(difficulty ?? ''),
      leetcodeUrl: `${leetcodeBaseUrl}/problems/${slug}/`,
      folderPath,
      readmePath,
      solutions: [
        {
          language,
          extension,
          path: solutionPath,
          lastSyncedAt: syncedAt,
        },
      ],
    };
  }

  function renderRootReadmeSummary({ stats, topics }) {
    const safeStats = stats || {};
    const sortedTopics = [...topics].sort((a, b) => a.name.localeCompare(b.name));
    const topicRows = sortedTopics.map(topic => `| [${topic.name}](${TOPICS_BASE_PATH}/${topic.slug}/) | ${topic.problemCount} |`);

    return [
      SUMMARY_SECTION_START,
      '## LeetHub Summary',
      '',
      '| Total Solved | Easy | Medium | Hard |',
      '| ---: | ---: | ---: | ---: |',
      `| ${safeStats.solved ?? 0} | ${safeStats.easy ?? 0} | ${safeStats.medium ?? 0} | ${safeStats.hard ?? 0} |`,
      '',
      '## Topics',
      '',
      '| Topic | Problems |',
      '| --- | ---: |',
      ...topicRows,
      SUMMARY_SECTION_END,
    ].join('\n');
  }

  function replaceGeneratedSection(readme, summary) {
    const source = String(readme ?? '').trimEnd();

    if (source.includes(SUMMARY_SECTION_START) && source.includes(SUMMARY_SECTION_END)) {
      return replaceBetweenMarkers(source, SUMMARY_SECTION_START, SUMMARY_SECTION_END, summary);
    }

    if (source.includes(LEGACY_TOPICS_SECTION_START) && source.includes(LEGACY_TOPICS_SECTION_END)) {
      return replaceBetweenMarkers(source, LEGACY_TOPICS_SECTION_START, LEGACY_TOPICS_SECTION_END, summary);
    }

    return `${source}${source ? '\n\n' : ''}${summary}\n`;
  }

  function replaceBetweenMarkers(source, startMarker, endMarker, replacement) {
    const startIndex = source.indexOf(startMarker);
    const endIndex = source.indexOf(endMarker);

    if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
      return `${source.trimEnd()}\n\n${replacement}\n`;
    }

    const before = source.slice(0, startIndex).trimEnd();
    const after = source.slice(endIndex + endMarker.length).trimStart();
    return [before, replacement, after].filter(Boolean).join('\n\n') + '\n';
  }

  globalObject.LeetHubTopicIndexUtils = {
    LEETCODE_BASE_PATH,
    SUMMARY_SECTION_END,
    SUMMARY_SECTION_START,
    TOPICS_BASE_PATH,
    TOPIC_PROBLEMS_FILENAME,
    TOPIC_README_FILENAME,
    buildProblemEntry,
    buildProblemFolderPath,
    buildRepoPath,
    buildTopicProblemsPath,
    buildTopicReadmePath,
    createEmptyTopicProblems,
    createTopicReadme,
    mergeProblemIntoTopicProblems,
    normalizeTopicSlug,
    normalizeTopicTag,
    renderRootReadmeSummary,
    replaceGeneratedSection,
  };
})(globalThis);
```

- [ ] **Step 2: Run formatting on the new file**

Run:

```bash
npx prettier --write src/js/topic-index-utils.js
```

Expected: Prettier rewrites or confirms `src/js/topic-index-utils.js`.

- [ ] **Step 3: Commit the helper**

Run:

```bash
git add src/js/topic-index-utils.js
git commit -m "feat: add topic index utilities"
```

Expected: One commit containing only `src/js/topic-index-utils.js`.

---

### Task 2: Add Unit Tests For Topic Helpers

**Files:**
- Create: `tests/topic-index-utils.test.mjs`
- Modify: `package.json`
- Uses: `src/js/topic-index-utils.js`

- [ ] **Step 1: Write the failing tests**

Use `apply_patch` to create `tests/topic-index-utils.test.mjs` with this complete content:

```javascript
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../src/js/topic-index-utils.js', import.meta.url), 'utf8');
const sandbox = { globalThis: {} };
vm.createContext(sandbox);
vm.runInContext(source, sandbox);

const {
  buildProblemEntry,
  buildProblemFolderPath,
  buildRepoPath,
  buildTopicProblemsPath,
  buildTopicReadmePath,
  createTopicReadme,
  mergeProblemIntoTopicProblems,
  normalizeTopicSlug,
  normalizeTopicTag,
  renderRootReadmeSummary,
  replaceGeneratedSection,
} = sandbox.globalThis.LeetHubTopicIndexUtils;

assert.equal(normalizeTopicSlug('Hash Table'), 'hash-table');
assert.equal(normalizeTopicSlug('Two Pointers'), 'two-pointers');
assert.deepEqual(normalizeTopicTag({ name: 'Hash Table', slug: 'hash-table' }), {
  slug: 'hash-table',
  name: 'Hash Table',
});
assert.deepEqual(normalizeTopicTag({ name: 'Dynamic Programming' }), {
  slug: 'dynamic-programming',
  name: 'Dynamic Programming',
});
assert.equal(normalizeTopicTag({ name: '' }), null);

assert.equal(buildTopicReadmePath('array'), 'Topics/array/README.md');
assert.equal(buildTopicProblemsPath('array'), 'Topics/array/problems.json');
assert.equal(
  createTopicReadme('Array'),
  ['# Array', '', '## Concepts', '', '## Patterns', '', '## Tips', '', '## Mistakes', ''].join('\n'),
);

assert.equal(
  buildRepoPath({
    problemName: '0001-two-sum',
    filename: '0001-two-sum.py',
  }),
  'LeetCode/0001-two-sum/0001-two-sum.py',
);
assert.equal(
  buildRepoPath({
    difficulty: 'Easy',
    problemName: '0001-two-sum',
    filename: '0001-two-sum.py',
    useDifficultyFolder: true,
  }),
  'LeetCode/Easy/0001-two-sum/0001-two-sum.py',
);
assert.equal(
  buildRepoPath({
    problemName: '0001-two-sum',
    filename: '0001-two-sum.py',
    language: 'Python3',
    useLanguageFolder: true,
  }),
  'LeetCode/0001-two-sum/Python3/0001-two-sum.py',
);
assert.equal(
  buildRepoPath({
    difficulty: 'Easy',
    problemName: '0001-two-sum',
    filename: '0001-two-sum.py',
    language: 'Python3',
    useDifficultyFolder: true,
    useLanguageFolder: true,
  }),
  'LeetCode/Easy/0001-two-sum/Python3/0001-two-sum.py',
);
assert.equal(
  buildRepoPath({
    difficulty: 'Easy',
    problemName: '0001-two-sum',
    filename: 'README.md',
    language: 'Python3',
    useDifficultyFolder: true,
    useLanguageFolder: true,
  }),
  'LeetCode/Easy/0001-two-sum/README.md',
);
assert.equal(
  buildProblemFolderPath({
    difficulty: 'Easy',
    problemName: '0001-two-sum',
    useDifficultyFolder: true,
  }),
  'LeetCode/Easy/0001-two-sum/',
);

const syncedAt = '2026-05-12T10:30:00.000Z';
const topic = { slug: 'array', name: 'Array' };
const twoSumEntry = buildProblemEntry({
  frontendId: '1',
  title: 'Two Sum',
  slug: 'two-sum',
  problemName: '0001-two-sum',
  difficulty: 'Easy',
  leetcodeBaseUrl: 'https://leetcode.com',
  folderPath: 'LeetCode/0001-two-sum/',
  readmePath: 'LeetCode/0001-two-sum/README.md',
  language: 'Python3',
  extension: '.py',
  solutionPath: 'LeetCode/0001-two-sum/0001-two-sum.py',
  syncedAt,
});

let document = mergeProblemIntoTopicProblems(null, topic, twoSumEntry, syncedAt);
assert.equal(document.version, 1);
assert.deepEqual(document.topic, topic);
assert.equal(document.problems.length, 1);
assert.equal(document.problems[0].problemName, '0001-two-sum');
assert.equal(document.problems[0].solutions.length, 1);

document = mergeProblemIntoTopicProblems(
  document,
  topic,
  {
    ...twoSumEntry,
    solutions: [
      {
        language: 'JavaScript',
        extension: '.js',
        path: 'LeetCode/0001-two-sum/0001-two-sum.js',
        lastSyncedAt: syncedAt,
      },
    ],
  },
  '2026-05-12T10:31:00.000Z',
);
assert.equal(document.problems.length, 1);
assert.deepEqual(
  document.problems[0].solutions.map(solution => solution.language),
  ['JavaScript', 'Python3'],
);

document = mergeProblemIntoTopicProblems(
  document,
  topic,
  {
    ...twoSumEntry,
    title: 'Two Sum',
    solutions: [
      {
        language: 'Python3',
        extension: '.py',
        path: 'LeetCode/0001-two-sum/0001-two-sum.py',
        lastSyncedAt: syncedAt,
      },
    ],
  },
  '2026-05-12T10:32:00.000Z',
);
assert.equal(document.problems.length, 1);
assert.equal(
  document.problems[0].solutions.find(solution => solution.language === 'Python3').lastSyncedAt,
  '2026-05-12T10:32:00.000Z',
);

const threeSumEntry = buildProblemEntry({
  frontendId: '15',
  title: '3Sum',
  slug: '3sum',
  problemName: '0015-3sum',
  difficulty: 'Medium',
  leetcodeBaseUrl: 'https://leetcode.com',
  folderPath: 'LeetCode/0015-3sum/',
  readmePath: 'LeetCode/0015-3sum/README.md',
  language: 'Python3',
  extension: '.py',
  solutionPath: 'LeetCode/0015-3sum/0015-3sum.py',
  syncedAt,
});
document = mergeProblemIntoTopicProblems(document, topic, threeSumEntry, syncedAt);
assert.deepEqual(
  document.problems.map(problem => problem.problemName),
  ['0001-two-sum', '0015-3sum'],
);

const summary = renderRootReadmeSummary({
  stats: { solved: 2, easy: 1, medium: 1, hard: 0 },
  topics: [
    { slug: 'hash-table', name: 'Hash Table', problemCount: 1 },
    { slug: 'array', name: 'Array', problemCount: 2 },
  ],
});
assert.match(summary, /LeetHub Summary/);
assert.match(summary, /\| 2 \| 1 \| 1 \| 0 \|/);
assert.match(summary, /\| \[Array\]\(Topics\/array\/\) \| 2 \|/);
assert.match(summary, /\| \[Hash Table\]\(Topics\/hash-table\/\) \| 1 \|/);

assert.equal(replaceGeneratedSection('# My Repo', summary), `# My Repo\n\n${summary}\n`);
assert.equal(
  replaceGeneratedSection(
    ['Intro', '<!---LeetCode Topics Start-->', 'old table', '<!---LeetCode Topics End-->', 'Outro'].join('\n'),
    summary,
  ),
  `Intro\n\n${summary}\n\nOutro\n`,
);
assert.equal(
  replaceGeneratedSection(
    ['Intro', '<!---LeetHub Summary Start-->', 'old summary', '<!---LeetHub Summary End-->', 'Outro'].join('\n'),
    summary,
  ),
  `Intro\n\n${summary}\n\nOutro\n`,
);

console.log('topic-index-utils tests passed');
```

- [ ] **Step 2: Run the new test to verify it fails before package wiring**

Run:

```bash
node tests/topic-index-utils.test.mjs
```

Expected after Task 1 is complete: PASS and prints `topic-index-utils tests passed`.

- [ ] **Step 3: Update the unit test npm script**

Use `apply_patch` to update `package.json`:

```diff
-    "test:unit": "node tests/translation-utils.test.mjs"
+    "test:unit": "node tests/translation-utils.test.mjs && node tests/topic-index-utils.test.mjs"
```

- [ ] **Step 4: Run all unit tests**

Run:

```bash
npm run test:unit
```

Expected: both test files pass and print:

```text
translation-utils tests passed
topic-index-utils tests passed
```

- [ ] **Step 5: Commit the tests**

Run:

```bash
git add package.json tests/topic-index-utils.test.mjs
git commit -m "test: cover topic index helpers"
```

Expected: One commit containing the test file and `package.json` script update.

---

### Task 3: Load Topic Helpers In The Extension

**Files:**
- Modify: `manifest.json`
- Uses: `src/js/topic-index-utils.js`

- [ ] **Step 1: Update the content script list**

Use `apply_patch` to modify the second content script entry in `manifest.json` so `src/js/topic-index-utils.js` loads before `src/js/leetcode.js`:

```json
"js": [
  "src/js/topic-index-utils.js",
  "src/js/leetcode.js",
  "src/js/authorize.js"
],
```

- [ ] **Step 2: Run manifest formatting**

Run:

```bash
npx prettier --write manifest.json
```

Expected: `manifest.json` remains valid JSON.

- [ ] **Step 3: Run lint and unit tests**

Run:

```bash
npm run lint-test
npm run test:unit
```

Expected: lint passes and both unit test files pass.

- [ ] **Step 4: Commit manifest loading**

Run:

```bash
git add manifest.json
git commit -m "feat: load topic index helpers"
```

Expected: One commit containing only the manifest change.

---

### Task 4: Replace Path Construction With Shared Helper

**Files:**
- Modify: `src/js/leetcode.js`
- Test: `tests/topic-index-utils.test.mjs`

- [ ] **Step 1: Add a local alias near the constants in `src/js/leetcode.js`**

Insert this block after `const defaultRepoReadme = 'Contains topicwise list of solved problems.\n\n';`:

```javascript
const topicIndexUtils = globalThis.LeetHubTopicIndexUtils;
```

- [ ] **Step 2: Replace `constructGitHubPath` body**

Replace the body of `constructGitHubPath` with this implementation:

```javascript
function constructGitHubPath(
  hook,
  basePath,
  difficulty,
  problem,
  filename,
  useDifficultyFolder,
  useLanguageFolder = false,
) {
  const path = topicIndexUtils.buildRepoPath({
    basePath: problem ? basePath : '',
    difficulty,
    problemName: problem,
    filename,
    language: last_language,
    useDifficultyFolder,
    useLanguageFolder,
  });

  return `https://api.github.com/repos/${hook}/contents/${path}`;
}
```

This preserves root README uploads by passing an empty base path when `problem` is empty.

- [ ] **Step 3: Update `appendProblemToReadme` link path for the remaining legacy helper**

Inside `appendProblemToReadme`, replace the manual `path` calculation with this block:

```javascript
  const path = topicIndexUtils.buildProblemFolderPath({
    basePath,
    difficulty,
    problemName: problem,
    language: last_language,
    useDifficultyFolder,
    useLanguageFolder,
  });
```

Keep the following line unchanged:

```javascript
  const url = `https://github.com/${hook}/tree/main/${path}`;
```

- [ ] **Step 4: Run unit tests and lint**

Run:

```bash
npm run test:unit
npm run lint-test
```

Expected: tests and lint pass.

- [ ] **Step 5: Commit the path helper integration**

Run:

```bash
git add src/js/leetcode.js
git commit -m "refactor: share leethub path generation"
```

Expected: One commit containing only the `src/js/leetcode.js` path helper changes.

---

### Task 5: Add GitHub Topic File Operations

**Files:**
- Modify: `src/js/leetcode.js`
- Uses: `src/js/topic-index-utils.js`

- [ ] **Step 1: Add generated file constants and base64 helpers**

Insert this block after `const basePath = 'LeetCode';`:

```javascript
const rootReadmeSummaryCommitMessage = 'Update LeetHub summary';

function encodeContent(content) {
  return btoa(unescape(encodeURIComponent(content)));
}

function decodeContent(content) {
  return decodeURIComponent(escape(atob(content)));
}
```

- [ ] **Step 2: Add direct GitHub content helpers after `getUpdatedData`**

Insert this block after the `getUpdatedData` function:

```javascript
async function getGitHubContentByPath(token, hook, path) {
  const response = await fetch(`https://api.github.com/repos/${hook}/contents/${path}`, {
    method: 'GET',
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (response.status === 404) {
    return null;
  }

  if (response.status === 200 || response.status === 201) {
    return response.json();
  }

  throw new Error(String(response.status));
}

async function putGitHubContentByPath(token, hook, path, content, message, sha) {
  const payload = {
    message,
    content: encodeContent(content),
  };

  if (sha) {
    payload.sha = sha;
  }

  const response = await fetch(`https://api.github.com/repos/${hook}/contents/${path}`, {
    method: 'PUT',
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
    body: JSON.stringify(payload),
  });

  if (response.status === 200 || response.status === 201) {
    return response.json();
  }

  throw new Error(String(response.status));
}
```

- [ ] **Step 3: Add retry helper after direct GitHub helpers**

Insert this block after `putGitHubContentByPath`:

```javascript
async function putGeneratedFileWithRetry(token, hook, path, content, message, sha) {
  try {
    return await putGitHubContentByPath(token, hook, path, content, message, sha);
  } catch (error) {
    if (error.message !== '409') {
      throw error;
    }

    const latest = await getGitHubContentByPath(token, hook, path);
    return putGitHubContentByPath(token, hook, path, content, message, latest?.sha);
  }
}
```

- [ ] **Step 4: Add topic README creation helper**

Insert this block after `putGeneratedFileWithRetry`:

```javascript
async function ensureTopicReadme(token, hook, topic) {
  const path = topicIndexUtils.buildTopicReadmePath(topic.slug);
  const existing = await getGitHubContentByPath(token, hook, path);

  if (existing) {
    return existing;
  }

  return putGeneratedFileWithRetry(
    token,
    hook,
    path,
    topicIndexUtils.createTopicReadme(topic.name),
    `Create ${topic.name} topic notes`,
  );
}
```

- [ ] **Step 5: Add topic JSON merge helper**

Insert this block after `ensureTopicReadme`:

```javascript
async function updateTopicProblemsJson(token, hook, topic, problemEntry, syncedAt) {
  const path = topicIndexUtils.buildTopicProblemsPath(topic.slug);
  const existing = await getGitHubContentByPath(token, hook, path);
  let existingDocument = null;

  if (existing?.content) {
    try {
      existingDocument = JSON.parse(decodeContent(existing.content));
    } catch (error) {
      console.log(`Invalid topic JSON at ${path}: ${error.message}`);
    }
  }

  const nextDocument = topicIndexUtils.mergeProblemIntoTopicProblems(
    existingDocument,
    topic,
    problemEntry,
    syncedAt,
  );
  const content = `${JSON.stringify(nextDocument, null, 2)}\n`;

  const response = await putGeneratedFileWithRetry(
    token,
    hook,
    path,
    content,
    `Update ${topic.name} topic problems`,
    existing?.sha,
  );

  return {
    document: nextDocument,
    response,
  };
}
```

- [ ] **Step 6: Run lint**

Run:

```bash
npm run lint-test
```

Expected: lint passes. If `rootReadmeSummaryCommitMessage` is unused at this point, Task 7 will use it; commit Task 5 after Task 7 if the linter blocks on unused variables.

- [ ] **Step 7: Commit topic file operations**

Run:

```bash
git add src/js/leetcode.js
git commit -m "feat: add topic github file helpers"
```

Expected: One commit containing the GitHub helper additions. If lint failed because root README summary wiring is needed, complete Task 7 before committing Tasks 5 through 7 together.

---

### Task 6: Build Problem Entries And Update Topic Indexes

**Files:**
- Modify: `src/js/leetcode.js`
- Uses: `src/js/topic-index-utils.js`

- [ ] **Step 1: Add a problem entry builder**

Insert this block after `updateTopicProblemsJson`:

```javascript
function buildTopicProblemEntry({ leetCode, problemName, fileName, language, extension, syncedAt }) {
  const folderPath = topicIndexUtils.buildProblemFolderPath({
    basePath,
    difficulty,
    problemName,
    language: last_language,
    useDifficultyFolder: leetCode.folderOptions.useDifficultyFolder,
    useLanguageFolder: leetCode.folderOptions.useLanguageFolder,
  });
  const readmePath = topicIndexUtils.buildRepoPath({
    basePath,
    difficulty,
    problemName,
    filename: 'README.md',
    language: last_language,
    useDifficultyFolder: leetCode.folderOptions.useDifficultyFolder,
    useLanguageFolder: leetCode.folderOptions.useLanguageFolder,
  });
  const solutionPath = topicIndexUtils.buildRepoPath({
    basePath,
    difficulty,
    problemName,
    filename: fileName,
    language: last_language,
    useDifficultyFolder: leetCode.folderOptions.useDifficultyFolder,
    useLanguageFolder: leetCode.folderOptions.useLanguageFolder,
  });

  return topicIndexUtils.buildProblemEntry({
    frontendId: leetCode.extractQuestionNumber(),
    title: leetCode.parseQuestionTitle(),
    slug: leetCode.submissionData.question.titleSlug,
    problemName,
    difficulty,
    leetcodeBaseUrl: getLeetCodeBaseUrl(),
    folderPath,
    readmePath,
    language: last_language,
    extension,
    solutionPath,
    syncedAt,
  });
}
```

- [ ] **Step 2: Add folder option loading helper**

Insert this block after `buildTopicProblemEntry`:

```javascript
async function getFolderOptions() {
  const { useDifficultyFolder = false } = await chrome.storage.local.get('useDifficultyFolder');
  const { useLanguageFolder = false } = await chrome.storage.local.get('useLanguageFolder');

  return {
    useDifficultyFolder,
    useLanguageFolder,
  };
}
```

- [ ] **Step 3: Add topic index update orchestrator**

Insert this block after `getFolderOptions`:

```javascript
async function updateTopicIndexesForProblem({ leetCode, problemName, fileName, language, extension }) {
  const topicTags = leetCode.questionDetails?.topicTags ?? leetCode.submissionData?.topicTags ?? [];
  const topics = topicTags.map(topicIndexUtils.normalizeTopicTag).filter(Boolean);

  if (!topics.length) {
    return [];
  }

  const { leethub_token, leethub_hook } = await chrome.storage.local.get([
    'leethub_token',
    'leethub_hook',
  ]);

  if (!leethub_token || !leethub_hook) {
    throw new Error('Missing GitHub token or hook for topic index update');
  }

  leetCode.folderOptions = await getFolderOptions();
  const syncedAt = new Date().toISOString();
  const problemEntry = buildTopicProblemEntry({
    leetCode,
    problemName,
    fileName,
    language,
    extension,
    syncedAt,
  });

  const updatedTopics = [];

  for (const topic of topics) {
    try {
      await ensureTopicReadme(leethub_token, leethub_hook, topic);
      const result = await updateTopicProblemsJson(
        leethub_token,
        leethub_hook,
        topic,
        problemEntry,
        syncedAt,
      );
      updatedTopics.push({
        ...topic,
        problemCount: result.document.problems.length,
      });
    } catch (error) {
      console.log(`Failed to update topic ${topic.slug}: ${error.message}`);
    }
  }

  return updatedTopics;
}
```

- [ ] **Step 4: Run lint**

Run:

```bash
npm run lint-test
```

Expected: lint passes or reports only integration gaps that Task 7 resolves.

- [ ] **Step 5: Commit topic index orchestration**

Run:

```bash
git add src/js/leetcode.js
git commit -m "feat: merge synced problems into topic indexes"
```

Expected: One commit containing the problem-entry and topic-orchestration helpers. If Task 5 was not committed because lint needed this wiring, commit Tasks 5 and 6 together with this message.

---

### Task 7: Generate The Root README Summary

**Files:**
- Modify: `src/js/leetcode.js`
- Uses: `src/js/topic-index-utils.js`

- [ ] **Step 1: Add topic directory listing helper**

Insert this block after `updateTopicIndexesForProblem`:

```javascript
async function listTopicDirectories(token, hook) {
  const contents = await getGitHubContentByPath(token, hook, topicIndexUtils.TOPICS_BASE_PATH);

  if (!Array.isArray(contents)) {
    return [];
  }

  return contents
    .filter(item => item.type === 'dir')
    .map(item => ({
      slug: item.name,
      path: item.path,
    }));
}
```

- [ ] **Step 2: Add topic count collection helper**

Insert this block after `listTopicDirectories`:

```javascript
async function collectTopicSummaries(token, hook, fallbackTopics) {
  const summaries = [];
  const topicDirectories = await listTopicDirectories(token, hook);
  const fallbackBySlug = new Map(fallbackTopics.map(topic => [topic.slug, topic]));
  const topicsToRead = topicDirectories.length
    ? topicDirectories.map(topic => fallbackBySlug.get(topic.slug) || topic)
    : fallbackTopics;

  for (const topic of topicsToRead) {
    try {
      const path = topicIndexUtils.buildTopicProblemsPath(topic.slug);
      const data = await getGitHubContentByPath(token, hook, path);
      const document = data?.content ? JSON.parse(decodeContent(data.content)) : null;
      summaries.push({
        slug: document?.topic?.slug || topic.slug,
        name: document?.topic?.name || topic.name || topic.slug,
        problemCount: Array.isArray(document?.problems) ? document.problems.length : topic.problemCount || 0,
      });
    } catch (error) {
      console.log(`Failed to collect topic summary for ${topic.slug}: ${error.message}`);
      summaries.push({
        slug: topic.slug,
        name: topic.name || topic.slug,
        problemCount: topic.problemCount || 0,
      });
    }
  }

  return summaries;
}
```

- [ ] **Step 3: Add root README summary updater**

Insert this block after `collectTopicSummaries`:

```javascript
async function updateRootReadmeSummary(updatedTopics = []) {
  const { leethub_token, leethub_hook, stats } = await chrome.storage.local.get([
    'leethub_token',
    'leethub_hook',
    'stats',
  ]);

  if (!leethub_token || !leethub_hook) {
    throw new Error('Missing GitHub token or hook for root README summary update');
  }

  let readme = defaultRepoReadme;
  let sha;
  const existing = await getGitHubContentByPath(leethub_token, leethub_hook, readmeFilename);

  if (existing?.content) {
    readme = decodeContent(existing.content);
    sha = existing.sha;
  }

  const topicSummaries = await collectTopicSummaries(leethub_token, leethub_hook, updatedTopics);
  const summary = topicIndexUtils.renderRootReadmeSummary({
    stats: stats || {},
    topics: topicSummaries,
  });
  const nextReadme = topicIndexUtils.replaceGeneratedSection(readme, summary);

  return putGeneratedFileWithRetry(
    leethub_token,
    leethub_hook,
    readmeFilename,
    nextReadme,
    rootReadmeSummaryCommitMessage,
    sha,
  );
}
```

- [ ] **Step 4: Run lint**

Run:

```bash
npm run lint-test
```

Expected: lint passes.

- [ ] **Step 5: Commit root README summary helpers**

Run:

```bash
git add src/js/leetcode.js
git commit -m "feat: generate leethub readme summary"
```

Expected: One commit containing the root README summary helpers.

---

### Task 8: Wire Topic Updates Into Sync Flows

**Files:**
- Modify: `src/js/leetcode.js`

- [ ] **Step 1: Update `uploadLeetCodeV2Submission` skip behavior**

In `uploadLeetCodeV2Submission`, replace this early skip block:

```javascript
  const alreadyCompleted = await checkAlreadyCompleted(problemName);
  if (alreadyCompleted) {
    return {
      status: 'skipped',
      problemName,
      difficulty,
    };
  }
```

with:

```javascript
  const alreadyCompleted = await checkAlreadyCompleted(problemName);
```

This keeps the migration path alive for already-synced problems.

- [ ] **Step 2: Gate solution uploads in `uploadLeetCodeV2Submission`**

Replace:

```javascript
  const updateCode = leetCode.findAndUploadCode(problemName, fileName, commitMsg, 'upload');
  const updateRepoReadMe = updateReadmeTopicTagsWithProblem(
    leetCode.questionDetails?.topicTags,
    problemName,
  );

  await Promise.all([updateReadMe, updateNotes, updateCode, updateRepoReadMe]);
  await incrementStats();

  return {
    status: 'uploaded',
    problemName,
    difficulty,
  };
```

with:

```javascript
  const updateCode = alreadyCompleted
    ? Promise.resolve()
    : leetCode.findAndUploadCode(problemName, fileName, commitMsg, 'upload');
  const updatedTopics = await updateTopicIndexesForProblem({
    leetCode,
    problemName,
    fileName,
    language: last_language,
    extension: language,
  });

  await Promise.all([updateReadMe, updateNotes, updateCode]);

  if (!alreadyCompleted) {
    await incrementStats();
  }

  await updateRootReadmeSummary(updatedTopics);

  return {
    status: alreadyCompleted ? 'skipped' : 'uploaded',
    problemName,
    difficulty,
  };
```

- [ ] **Step 3: Refresh the root summary after Sync Previous count reconciliation**

In `syncPreviousAcceptedSubmissions`, replace:

```javascript
    const counts = await updateStatsCountsFromSyncedResults(results);
    onProgress(`Done. Found ${counts.solved} solved problems.`);
```

with:

```javascript
    const counts = await updateStatsCountsFromSyncedResults(results);
    await updateRootReadmeSummary();
    onProgress(`Done. Found ${counts.solved} solved problems.`);
```

This ensures Sync Previous finishes with root README stats based on the reconciled solved counts.

- [ ] **Step 4: Update the live `loader` flow**

In the `loader` function, replace:

```javascript
      /* Upload code to Git */
      const updateCode = leetCode.findAndUploadCode(problemName, fileName, commitMsg, 'upload');

      /* Group problem into its relevant topics */
      const updateRepoReadMe = updateReadmeTopicTagsWithProblem(
        leetCode.questionDetails?.topicTags,
        problemName,
      );

      await Promise.all([updateReadMe, updateNotes, updateCode, updateRepoReadMe]);
```

with:

```javascript
      /* Upload code to Git */
      const updateCode = alreadyCompleted
        ? Promise.resolve()
        : leetCode.findAndUploadCode(problemName, fileName, commitMsg, 'upload');

      const updatedTopics = await updateTopicIndexesForProblem({
        leetCode,
        problemName,
        fileName,
        language: last_language,
        extension: language,
      });

      await Promise.all([updateReadMe, updateNotes, updateCode]);

      if (!alreadyCompleted) {
        await incrementStats();
      }

      await updateRootReadmeSummary(updatedTopics);
```

- [ ] **Step 5: Remove old root README topic updater calls**

Keep the old helper functions in place for this task if removing them causes a large diff. Confirm no active call site still calls `updateReadmeTopicTagsWithProblem`.

Run:

```bash
rg -n "updateReadmeTopicTagsWithProblem\\(" src/js/leetcode.js
```

Expected: only the function definition remains.

- [ ] **Step 6: Run tests and lint**

Run:

```bash
npm run test:unit
npm run lint-test
```

Expected: tests and lint pass.

- [ ] **Step 7: Commit sync wiring**

Run:

```bash
git add src/js/leetcode.js
git commit -m "feat: sync accepted problems into topic indexes"
```

Expected: One commit containing sync-flow integration.

---

### Task 9: Clean Up Legacy README Topic Code

**Files:**
- Modify: `src/js/leetcode.js`
- Test: existing lint/unit checks

- [ ] **Step 1: Remove unused legacy constants**

Remove these constants if `rg` shows no remaining references:

```javascript
const leetCodeSectionStart = `<!---LeetCode Topics Start-->`;
const leetCodeSectionHeader = `# LeetCode Topics`;
const leetCodeSectionEnd = `<!---LeetCode Topics End-->`;
```

Keep:

```javascript
const readmeFilename = 'README.md';
const defaultRepoReadme = 'Contains topicwise list of solved problems.\n\n';
```

- [ ] **Step 2: Remove unused legacy functions**

Remove these functions if no active call site remains:

- `updateReadmeTopicTagsWithProblem`
- `appendProblemToReadme`
- `sortTopicsInReadme`

- [ ] **Step 3: Run reference checks**

Run:

```bash
rg -n "leetCodeSection|appendProblemToReadme|sortTopicsInReadme|updateReadmeTopicTagsWithProblem" src/js/leetcode.js
```

Expected: no output.

- [ ] **Step 4: Run tests and lint**

Run:

```bash
npm run test:unit
npm run lint-test
```

Expected: tests and lint pass.

- [ ] **Step 5: Commit cleanup**

Run:

```bash
git add src/js/leetcode.js
git commit -m "refactor: remove legacy readme topic tables"
```

Expected: One commit containing only cleanup of unused legacy README topic code.

---

### Task 10: Final Verification

**Files:**
- Verify all changed files

- [ ] **Step 1: Run formatting check**

Run:

```bash
npm run format-test
```

Expected: Prettier reports all matched files use correct formatting.

- [ ] **Step 2: Run lint**

Run:

```bash
npm run lint-test
```

Expected: ESLint exits successfully.

- [ ] **Step 3: Run unit tests**

Run:

```bash
npm run test:unit
```

Expected:

```text
translation-utils tests passed
topic-index-utils tests passed
```

- [ ] **Step 4: Inspect the final diff**

Run:

```bash
git status --short
git diff --stat HEAD
```

Expected: only intentional files remain modified. Existing unrelated user changes should not be reverted or staged accidentally.

- [ ] **Step 5: Manual extension verification**

Load the unpacked extension in Chrome and verify:

```text
1. Submit an accepted problem with at least one topic tag.
2. Confirm the solution file remains in the existing LeetCode problem folder.
3. Confirm Topics/<topic-slug>/README.md exists and contains the note template.
4. Confirm Topics/<topic-slug>/problems.json contains the problem and solution path.
5. Submit or sync a problem with multiple topic tags and confirm every topic JSON updates.
6. Run Sync Previous and confirm already-synced problems update topic JSON without duplicating solutions.
7. Confirm root README contains LeetHub Summary and topic links, not the old detailed topic tables.
```

- [ ] **Step 6: Final commit if verification required fixes**

If final verification required small fixes, run:

```bash
git add manifest.json package.json src/js/leetcode.js src/js/topic-index-utils.js tests/topic-index-utils.test.mjs
git commit -m "fix: stabilize topic index sync"
```

Expected: commit is created only if verification fixes changed files.
