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
const hashTableTopic = normalizeTopicTag({ name: 'Hash Table', slug: 'hash-table' });
assert.equal(hashTableTopic.slug, 'hash-table');
assert.equal(hashTableTopic.name, 'Hash Table');
const dynamicProgrammingTopic = normalizeTopicTag({ name: 'Dynamic Programming' });
assert.equal(dynamicProgrammingTopic.slug, 'dynamic-programming');
assert.equal(dynamicProgrammingTopic.name, 'Dynamic Programming');
assert.equal(normalizeTopicTag({ name: '' }), null);

assert.equal(buildTopicReadmePath('array'), 'Topics/array/README.md');
assert.equal(buildTopicProblemsPath('array'), 'Topics/array/problems.json');
assert.equal(
  createTopicReadme('Array'),
  ['# Array', '', '## Concepts', '', '## Patterns', '', '## Tips', '', '## Mistakes', ''].join(
    '\n',
  ),
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
assert.equal(document.topic.slug, topic.slug);
assert.equal(document.topic.name, topic.name);
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
assert.equal(
  document.problems[0].solutions.map(solution => solution.language).join(','),
  'JavaScript,Python3',
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
assert.equal(
  document.problems.map(problem => problem.problemName).join(','),
  '0001-two-sum,0015-3sum',
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
    [
      'Intro',
      '<!---LeetCode Topics Start-->',
      'old table',
      '<!---LeetCode Topics End-->',
      'Outro',
    ].join('\n'),
    summary,
  ),
  `Intro\n\n${summary}\n\nOutro\n`,
);
assert.equal(
  replaceGeneratedSection(
    [
      'Intro',
      '<!---LeetHub Summary Start-->',
      'old summary',
      '<!---LeetHub Summary End-->',
      'Outro',
    ].join('\n'),
    summary,
  ),
  `Intro\n\n${summary}\n\nOutro\n`,
);

console.log('topic-index-utils tests passed');
