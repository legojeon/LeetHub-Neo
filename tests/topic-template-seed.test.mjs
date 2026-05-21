import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const repositoryFilesSource = await readFile(
  new URL('../src/core/config/repository-files.js', import.meta.url),
  'utf8',
);
const readmeTemplateSource = await readFile(
  new URL('../src/core/templates/topic-readme-template.js', import.meta.url),
  'utf8',
);
const utilsSource = await readFile(
  new URL('../src/core/templates/topic-template-utils.js', import.meta.url),
  'utf8',
);
const seedSource = await readFile(
  new URL('../src/core/templates/topic-template-seed.js', import.meta.url),
  'utf8',
);

const templateSourcePath = 'src/templates/leetcode-cheatsheet/python/array/prefix_sum.py';
const requests = [];
let createTreeBody = null;
let createCommitBody = null;
let updateRefBody = null;
const serialize = value => JSON.parse(JSON.stringify(value));

const jsonResponse = payload => ({
  ok: true,
  json: async () => payload,
});
const textResponse = payload => ({
  ok: true,
  text: async () => payload,
});

const sandbox = {
  chrome: {
    runtime: {
      getURL: path => `chrome-extension://${path}`,
    },
  },
  fetch: async (url, options = {}) => {
    requests.push({ url, options });

    if (url === 'chrome-extension://src/templates/leetcode-cheatsheet/python/array/prefix_sum.py') {
      return textResponse('def prefix_sum(nums):\n    return []\n');
    }

    if (url === 'https://api.github.com/repos/owner/repo') {
      return jsonResponse({ default_branch: 'main' });
    }

    if (
      url === 'https://api.github.com/repos/owner/repo/git/ref/heads/main' &&
      options.method !== 'PATCH'
    ) {
      return jsonResponse({ object: { sha: 'base-commit' } });
    }

    if (url === 'https://api.github.com/repos/owner/repo/git/commits/base-commit') {
      return jsonResponse({ tree: { sha: 'base-tree' } });
    }

    if (url === 'https://api.github.com/repos/owner/repo/git/trees/base-tree?recursive=1') {
      return jsonResponse({ tree: [{ path: 'Topics/array/README.md' }] });
    }

    if (url === 'https://api.github.com/repos/owner/repo/git/trees') {
      createTreeBody = JSON.parse(options.body);
      return jsonResponse({ sha: 'next-tree' });
    }

    if (url === 'https://api.github.com/repos/owner/repo/git/commits') {
      createCommitBody = JSON.parse(options.body);
      return jsonResponse({ sha: 'next-commit' });
    }

    if (
      url === 'https://api.github.com/repos/owner/repo/git/refs/heads/main' &&
      options.method === 'PATCH'
    ) {
      updateRefBody = JSON.parse(options.body);
      return jsonResponse({ object: { sha: 'next-commit' } });
    }

    throw new Error(`Unexpected request: ${url}`);
  },
  globalThis: {
    LeetHubTopicTemplateCatalog: {
      languages: [{ slug: 'python', name: 'Python', extension: '.py' }],
      topics: [
        {
          slug: 'array',
          name: 'Array',
          templates: [
            {
              id: 'prefix-sum',
              title: 'Prefix Sum',
              files: {
                python: {
                  sourcePath: templateSourcePath,
                  targetPath: 'templates/python/prefix_sum.py',
                },
              },
            },
          ],
        },
      ],
    },
  },
};

vm.createContext(sandbox);
vm.runInContext(repositoryFilesSource, sandbox);
vm.runInContext(readmeTemplateSource, sandbox);
vm.runInContext(utilsSource, sandbox);
vm.runInContext(seedSource, sandbox);

const progressEvents = [];
const result = await sandbox.globalThis.LeetHubTopicTemplateSeed.seedCuratedTopicTemplates({
  token: 'token',
  hook: 'owner/repo',
  onProgress: progress => progressEvents.push(progress),
});

assert.deepEqual(serialize(result), {
  topics: 1,
  total: 4,
  created: 3,
  skipped: 1,
});
assert.equal(createTreeBody.base_tree, 'base-tree');
assert.deepEqual(
  createTreeBody.tree.map(entry => entry.path),
  [
    'Topics/array/problems.json',
    'Topics/array/templates.json',
    'Topics/array/templates/python/prefix_sum.py',
  ],
);
assert.equal(
  createTreeBody.tree.find(entry => entry.path.endsWith('prefix_sum.py')).content,
  'def prefix_sum(nums):\n    return []\n',
);
assert.deepEqual(createCommitBody, {
  message: 'Seed LeetHub topic templates',
  tree: 'next-tree',
  parents: ['base-commit'],
});
assert.deepEqual(updateRefBody, { sha: 'next-commit' });
assert.equal(progressEvents.at(0).current, 0);
assert.equal(progressEvents.at(-1).path, 'Topics/array/templates/python/prefix_sum.py');
assert.equal(
  requests.every(
    request =>
      request.options.headers?.Authorization === 'token token' ||
      request.url.startsWith('chrome-extension://'),
  ),
  true,
);

console.log('topic-template-seed tests passed');
