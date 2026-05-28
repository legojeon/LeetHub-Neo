import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../src/js/leetcode.js', import.meta.url), 'utf8');
const graphQlCalls = [];
const storage = {
  leethub_hook: 'owner/repo',
  leethub_token: 'token',
  stats: {},
};

const sandbox = {
  atob: value => Buffer.from(value, 'base64').toString('binary'),
  btoa: value => Buffer.from(value, 'binary').toString('base64'),
  console: {
    debug() {},
    error() {},
    info() {},
    log() {},
    table() {},
  },
  CustomEvent: class CustomEvent {
    constructor(_type, init = {}) {
      this.detail = init.detail;
    }
  },
  document: {
    addEventListener() {},
    cookie: '',
  },
  fetch: async (url, options = {}) => {
    if (String(url).startsWith('https://api.github.com/')) {
      return gitHubResponse(url);
    }

    const request = JSON.parse(options.body);
    graphQlCalls.push(request);

    if (request.operationName === 'globalData') {
      return jsonResponse({
        data: {
          userStatus: {
            isSignedIn: true,
            username: 'jeus',
          },
        },
      });
    }

    if (request.operationName === 'recentAcSubmissions') {
      return jsonResponse({
        data: {
          matchedUser: {
            submitStatsGlobal: {
              acSubmissionNum: [
                { difficulty: 'All', count: 2, submissions: 3 },
                { difficulty: 'Easy', count: 1, submissions: 2 },
                { difficulty: 'Medium', count: 1, submissions: 1 },
                { difficulty: 'Hard', count: 0, submissions: 0 },
              ],
            },
          },
          recentAcSubmissionList: [
            {
              id: 'latest-two-sum',
              title: 'Two Sum',
              titleSlug: 'two-sum',
              timestamp: '300',
            },
            {
              id: 'removing-stars',
              title: 'Removing Stars From a String',
              titleSlug: 'removing-stars-from-a-string',
              timestamp: '200',
            },
            {
              id: 'older-two-sum',
              title: 'Two Sum',
              titleSlug: 'two-sum',
              timestamp: '100',
            },
          ],
        },
      });
    }

    if (request.operationName === 'Submissions') {
      return jsonResponse({
        data: {
          submissionList: {
            lastKey: null,
            hasNext: false,
            submissions: [
              {
                id: 'legacy-only',
                title: 'Two Sum',
                titleSlug: 'two-sum',
                statusDisplay: 'Accepted',
                timestamp: '100',
              },
            ],
          },
        },
      });
    }

    throw new Error(`Unexpected GraphQL operation: ${request.operationName}`);
  },
  globalThis: {},
  addEventListener() {},
  dispatchEvent() {},
  location: { hostname: 'leetcode.com' },
  chrome: {
    runtime: {
      onMessage: {
        addListener() {},
      },
      sendMessage() {},
    },
    storage: {
      local: {
        async get(keys) {
          if (Array.isArray(keys)) {
            return Object.fromEntries(keys.map(key => [key, storage[key]]));
          }

          if (typeof keys === 'string') {
            return { [keys]: storage[keys] };
          }

          return { ...keys, ...storage };
        },
        async set(values) {
          Object.assign(storage, values);
        },
      },
    },
  },
};
sandbox.globalThis = sandbox;
sandbox.window = sandbox;
sandbox.LeetHubRepositoryFiles = {
  NOTES_FILENAME: 'NOTES.md',
  PROBLEM_README_FILENAME: 'README.md',
  ROOT_README_FILENAME: 'README.md',
  SCRATCHPAD_MEMO_FILENAME: 'memo.txt',
  isSolutionUpload: () => true,
};
sandbox.LeetHubRootReadmeTemplate = {
  DEFAULT_ROOT_README: '',
  ROOT_README_SUMMARY_COMMIT_MESSAGE: 'Update README',
};
sandbox.LeetHubLeetCodeLanguages = {
  LEETCODE_LANGUAGE_EXTENSIONS: {},
};
sandbox.LeetHubScratchpadMemo = {};
sandbox.LeetHubTopicIndexUtils = {
  findProblemRepositoryFile: ({ treeFiles }) =>
    treeFiles.find(file => file.path.endsWith('0001-two-sum-05-01-2026-12-00-00.py')) ?? null,
  mergeTopicUpdates: updates => updates ?? [],
  normalizeTopicTags: (...tagGroups) => tagGroups.flat().filter(Boolean),
  recordSolvedProblemInStats: stats => stats,
};
sandbox.LeetHubLeetCodeAccountUtils = {
  LEETCODE_ACCOUNT_BY_HOOK_STORAGE_KEY: 'leetcodeAccountByHook',
  createLeetCodeAccountSyncDecision: () => ({
    canSync: true,
    shouldConfirm: false,
    shouldStore: false,
    status: 'matched',
  }),
  getStoredLeetCodeAccount: () => ({ username: 'jeus' }),
  updateStoredLeetCodeAccount: accountByHook => accountByHook ?? {},
};

vm.createContext(sandbox);
vm.runInContext(
  `${source.slice(
    0,
    source.indexOf("document.addEventListener('click'"),
  )}\nglobalThis.__leetcodeTest = { getExistingSolutionRecord };`,
  sandbox,
);

const submissions = await sandbox.leetHubFetchAcceptedSubmissions();

assert.equal(submissions.length, 3);
assert.deepEqual(
  submissions.map(submission => submission.id),
  ['latest-two-sum', 'removing-stars', 'older-two-sum'],
);
assert.deepEqual(
  submissions.map(submission => submission.statusDisplay),
  ['Accepted', 'Accepted', 'Accepted'],
);
assert.equal(
  graphQlCalls.some(call => call.operationName === 'recentAcSubmissions'),
  true,
);
assert.equal(
  graphQlCalls.some(call => call.operationName === 'Submissions'),
  false,
);

const existingRecord = await sandbox.__leetcodeTest.getExistingSolutionRecord(
  '0001-two-sum',
  '0001-two-sum.py',
);

assert.deepEqual(JSON.parse(JSON.stringify(existingRecord)), {
  filename: '0001-two-sum-05-01-2026-12-00-00.py',
  path: 'Easy/0001-two-sum/Python3/0001-two-sum-05-01-2026-12-00-00.py',
  sha: 'timestamp-sha',
});
assert.equal(
  storage.stats.solutionPaths['0001-two-sum']['0001-two-sum-05-01-2026-12-00-00.py'],
  'Easy/0001-two-sum/Python3/0001-two-sum-05-01-2026-12-00-00.py',
);

function jsonResponse(payload) {
  return {
    ok: true,
    async json() {
      return payload;
    },
  };
}

function gitHubResponse(url) {
  if (url === 'https://api.github.com/repos/owner/repo') {
    return jsonResponse({ default_branch: 'main' });
  }

  if (url === 'https://api.github.com/repos/owner/repo/git/ref/heads/main') {
    return jsonResponse({ object: { sha: 'commit-sha' } });
  }

  if (url === 'https://api.github.com/repos/owner/repo/git/commits/commit-sha') {
    return jsonResponse({ sha: 'commit-sha', tree: { sha: 'tree-sha' } });
  }

  if (url === 'https://api.github.com/repos/owner/repo/git/trees/tree-sha?recursive=1') {
    return jsonResponse({
      tree: [
        {
          type: 'blob',
          path: 'Easy/0001-two-sum/Python3/0001-two-sum-05-01-2026-12-00-00.py',
          sha: 'timestamp-sha',
        },
      ],
    });
  }

  throw new Error(`Unexpected GitHub URL: ${url}`);
}

console.log('leetcode profile accepted submissions tests passed');
