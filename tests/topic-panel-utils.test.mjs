import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const repositoryFilesSource = await readFile(
  new URL('../src/core/config/repository-files.js', import.meta.url),
  'utf8',
);
const source = await readFile(
  new URL('../src/features/sidepanel/topics/topic-panel-utils.js', import.meta.url),
  'utf8',
);
const sandbox = { globalThis: {} };
vm.createContext(sandbox);
vm.runInContext(repositoryFilesSource, sandbox);
vm.runInContext(source, sandbox);

const serialize = value => JSON.parse(JSON.stringify(value));

const {
  createTopicGithubPaths,
  getTemplateEntriesForLanguage,
  normalizePanelProblems,
  normalizePanelTopics,
  renderMarkdownToHtml,
} = sandbox.globalThis.LeetHubTopicPanelUtils;

assert.deepEqual(serialize(normalizePanelTopics([{ name: 'Hash Table', slug: 'hash-table' }])), [
  { slug: 'hash-table', name: 'Hash Table' },
]);
assert.deepEqual(
  serialize(
    normalizePanelTopics(
      [
        { name: 'Dynamic Programming' },
        { name: 'Dynamic Programming', slug: 'dynamic-programming' },
      ],
      [{ slug: 'dynamic-programming', name: 'DP' }],
    ),
  ),
  [{ slug: 'dynamic-programming', name: 'DP' }],
);
assert.deepEqual(serialize(createTopicGithubPaths('hash-table')), {
  readme: 'Topics/hash-table/README.md',
  problems: 'Topics/hash-table/problems.json',
  templates: 'Topics/hash-table/templates.json',
});

assert.deepEqual(
  serialize(
    normalizePanelProblems(
      {
        problems: [
          {
            frontendId: '125',
            title: 'Valid Palindrome',
            slug: 'valid-palindrome',
            difficulty: 'Easy',
            leetcodeUrl: 'https://leetcode.com/problems/valid-palindrome/',
            solutions: [
              {
                language: 'Python3',
                path: '0125-valid-palindrome/0125-valid-palindrome.py',
              },
            ],
          },
          {
            frontendId: '1',
            title: 'Two Sum',
            slug: 'two-sum',
            problemName: '0001-two-sum',
            difficulty: 'Easy',
          },
        ],
      },
      undefined,
      { currentSlug: 'two-sum' },
    ),
  ),
  [
    {
      frontendId: '125',
      title: 'Valid Palindrome',
      problemName: '',
      slug: 'valid-palindrome',
      difficulty: 'Easy',
      leetcodeUrl: 'https://leetcode.com/problems/valid-palindrome/',
      solutions: [
        {
          language: 'Python3',
          path: '0125-valid-palindrome/0125-valid-palindrome.py',
        },
      ],
    },
  ],
);

assert.deepEqual(
  serialize(
    getTemplateEntriesForLanguage(
      {
        templates: [
          {
            id: 'prefix-sum',
            title: 'Prefix Sum',
            files: {
              python: 'templates/python/prefix_sum.py',
              javascript: 'templates/javascript/prefix_sum.js',
            },
          },
        ],
      },
      'python',
    ),
  ),
  [
    {
      id: 'prefix-sum',
      title: 'Prefix Sum',
      path: 'templates/python/prefix_sum.py',
    },
  ],
);

assert.equal(
  renderMarkdownToHtml(
    '# Array\n\n## Concepts\n\n- Prefix sum\n\n```python\nx = 1\n```\n\n<script>bad</script>',
  ),
  '<h1>Array</h1><h2>Concepts</h2><ul><li>Prefix sum</li></ul><pre><code class="language-python">x = 1</code></pre><p>&lt;script&gt;bad&lt;/script&gt;</p>',
);

console.log('topic-panel-utils tests passed');
