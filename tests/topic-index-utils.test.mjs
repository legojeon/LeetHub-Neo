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
const source = await readFile(new URL('../src/js/topic-index-utils.js', import.meta.url), 'utf8');
const sandbox = { globalThis: {} };
vm.createContext(sandbox);
vm.runInContext(repositoryFilesSource, sandbox);
vm.runInContext(readmeTemplateSource, sandbox);
vm.runInContext(source, sandbox);

const serialize = value => JSON.parse(JSON.stringify(value));

const {
  buildProblemEntry,
  buildProblemFolderPath,
  buildRepoPath,
  buildTopicProblemsPath,
  buildTopicReadmePath,
  createRepositoryStructureMigrationPlan,
  createTopicReadme,
  findProblemRepositoryFile,
  findProblemSolutionFile,
  mergeProblemIntoTopicProblemsContent,
  mergeTopicUpdates,
  mergeProblemIntoTopicProblems,
  normalizeTopicTags,
  normalizeTopicSlug,
  normalizeTopicTag,
  recordSolvedProblemInStats,
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
assert.deepEqual(serialize(normalizeTopicTags([], [{ name: 'Array', slug: 'array' }])), [
  { slug: 'array', name: 'Array' },
]);
assert.deepEqual(
  serialize(
    normalizeTopicTags(
      [{ name: 'Array', slug: 'array' }],
      [{ name: 'Hash Table', slug: 'hash-table' }],
    ),
  ),
  [{ slug: 'array', name: 'Array' }],
);
assert.deepEqual(
  serialize(
    normalizeTopicTags(
      [
        { name: 'Array', slug: 'array' },
        { name: 'Array', slug: 'array' },
      ],
      [{ name: 'Hash Table', slug: 'hash-table' }],
    ),
  ),
  [{ slug: 'array', name: 'Array' }],
);
assert.deepEqual(
  serialize(
    normalizeTopicTags([{ name: '', slug: '' }], [{ name: 'Hash Table', slug: 'hash-table' }]),
  ),
  [{ slug: 'hash-table', name: 'Hash Table' }],
);

assert.equal(buildTopicReadmePath('array'), 'Topics/array/README.md');
assert.equal(buildTopicProblemsPath('array'), 'Topics/array/problems.json');
assert.equal(sandbox.globalThis.LeetHubRepositoryFiles.SCRATCHPAD_MEMO_FILENAME, 'memo.txt');
assert.equal(
  createTopicReadme('Array'),
  [
    '# Array',
    '',
    'Use this page as your personal algorithm playbook.',
    '',
    'Write freely in Markdown: concepts, mental models, gotchas, links, snippets, or your own tips. Keep what helps you recognize this topic faster next time.',
    '',
    '## Code Notes',
    '',
    '```python',
    '# You can write a short example for this topic here.',
    'def example():',
    '    pass',
    '```',
    '',
    'This README works well with GitHub, Obsidian, Notion, or any Markdown-friendly notes app.',
    '',
  ].join('\n'),
);

assert.equal(
  buildRepoPath({
    problemName: '0001-two-sum',
    filename: '0001-two-sum.py',
  }),
  '0001-two-sum/0001-two-sum.py',
);
assert.equal(
  buildRepoPath({
    difficulty: 'Easy',
    problemName: '0001-two-sum',
    filename: '0001-two-sum.py',
    useDifficultyFolder: true,
  }),
  'Easy/0001-two-sum/0001-two-sum.py',
);
assert.equal(
  buildRepoPath({
    problemName: '0001-two-sum',
    filename: '0001-two-sum.py',
    language: 'Python3',
    useLanguageFolder: true,
  }),
  '0001-two-sum/Python3/0001-two-sum.py',
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
  'Easy/0001-two-sum/Python3/0001-two-sum.py',
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
  'Easy/0001-two-sum/README.md',
);
assert.equal(
  buildRepoPath({
    difficulty: 'Easy',
    problemName: '0001-two-sum',
    filename: 'memo.txt',
    language: 'Python3',
    useDifficultyFolder: true,
    useLanguageFolder: true,
  }),
  'Easy/0001-two-sum/memo.txt',
);
assert.equal(
  buildProblemFolderPath({
    difficulty: 'Easy',
    problemName: '0001-two-sum',
    useDifficultyFolder: true,
  }),
  'Easy/0001-two-sum/',
);

assert.deepEqual(
  serialize(
    findProblemSolutionFile({
      treeFiles: [
        { type: 'blob', path: 'LeetCode/0001-two-sum/0001-two-sum.py', sha: 'legacy-sha' },
        { type: 'blob', path: '0001-two-sum/0001-two-sum.py', sha: 'root-sha' },
      ],
      problemName: '0001-two-sum',
      filename: '0001-two-sum.py',
      preferredPath: 'LeetCode/0001-two-sum/0001-two-sum.py',
    }),
  ),
  { type: 'blob', path: '0001-two-sum/0001-two-sum.py', sha: 'root-sha' },
);

assert.deepEqual(
  serialize(
    findProblemSolutionFile({
      treeFiles: [
        {
          type: 'blob',
          path: 'Topics/array/0001-two-sum-05-01-2026-12-00-00.py',
          sha: 'topic-sha',
        },
        {
          type: 'blob',
          path: 'Easy/0001-two-sum/Python3/0001-two-sum-05-01-2026-12-00-00.py',
          sha: 'timestamp-sha',
        },
        { type: 'blob', path: 'Easy/0001-two-sum/README.md', sha: 'readme-sha' },
      ],
      problemName: '0001-two-sum',
      filename: '0001-two-sum.py',
    }),
  ),
  {
    type: 'blob',
    path: 'Easy/0001-two-sum/Python3/0001-two-sum-05-01-2026-12-00-00.py',
    sha: 'timestamp-sha',
  },
);

assert.deepEqual(
  serialize(
    findProblemRepositoryFile({
      treeFiles: [
        { type: 'blob', path: 'Easy/0001-two-sum/README.md', sha: 'easy-readme-sha' },
        { type: 'blob', path: 'Topics/array/0001-two-sum/README.md', sha: 'topic-readme-sha' },
      ],
      problemName: '0001-two-sum',
      filename: 'README.md',
    }),
  ),
  { type: 'blob', path: 'Easy/0001-two-sum/README.md', sha: 'easy-readme-sha' },
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
  folderPath: '0001-two-sum/',
  readmePath: '0001-two-sum/README.md',
  language: 'Python3',
  extension: '.py',
  solutionPath: '0001-two-sum/0001-two-sum.py',
  solutionSha: 'python-sha',
  syncedAt,
});

let document = mergeProblemIntoTopicProblems(null, topic, twoSumEntry, syncedAt);
assert.equal(document.version, 1);
assert.equal(document.topic.slug, topic.slug);
assert.equal(document.topic.name, topic.name);
assert.equal(document.problems.length, 1);
assert.equal(document.problems[0].problemName, '0001-two-sum');
assert.equal(document.problems[0].solutions.length, 1);
assert.equal(document.problems[0].solutions[0].path, '0001-two-sum/0001-two-sum.py');
assert.equal(document.problems[0].solutions[0].sha, 'python-sha');

const entryWithoutSolutionPath = buildProblemEntry({
  frontendId: '1',
  title: 'Two Sum',
  slug: 'two-sum',
  problemName: '0001-two-sum',
  difficulty: 'Easy',
  leetcodeBaseUrl: 'https://leetcode.com',
  folderPath: '0001-two-sum/',
  readmePath: '0001-two-sum/README.md',
  language: 'Python3',
  extension: '.py',
  solutionPath: '',
  syncedAt,
});
assert.equal(entryWithoutSolutionPath.solutions.length, 0);

document = mergeProblemIntoTopicProblems(
  document,
  topic,
  {
    ...twoSumEntry,
    solutions: [
      {
        language: 'JavaScript',
        extension: '.js',
        path: '0001-two-sum/0001-two-sum.js',
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
        path: '0001-two-sum/0001-two-sum.py',
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

document = mergeProblemIntoTopicProblems(
  document,
  topic,
  {
    ...twoSumEntry,
    solutions: [
      {
        language: 'Python3',
        extension: '.py',
        filename: '0001-two-sum.py',
        path: 'Easy/0001-two-sum/0001-two-sum.py',
        lastSyncedAt: syncedAt,
      },
    ],
  },
  '2026-05-12T10:32:30.000Z',
);
const pythonSolutions = document.problems[0].solutions.filter(
  solution => solution.language === 'Python3',
);
assert.equal(pythonSolutions.length, 1);
assert.equal(pythonSolutions[0].path, 'Easy/0001-two-sum/0001-two-sum.py');

const threeSumEntry = buildProblemEntry({
  frontendId: '15',
  title: '3Sum',
  slug: '3sum',
  problemName: '0015-3sum',
  difficulty: 'Medium',
  leetcodeBaseUrl: 'https://leetcode.com',
  folderPath: '0015-3sum/',
  readmePath: '0015-3sum/README.md',
  language: 'Python3',
  extension: '.py',
  solutionPath: '0015-3sum/0015-3sum.py',
  syncedAt,
});
document = mergeProblemIntoTopicProblems(document, topic, threeSumEntry, syncedAt);
assert.equal(
  document.problems.map(problem => problem.problemName).join(','),
  '0001-two-sum,0015-3sum',
);

const conflictContent = `${JSON.stringify(document, null, 2)}\n`;
const palindromeEntry = buildProblemEntry({
  frontendId: '9',
  title: 'Palindrome Number',
  slug: 'palindrome-number',
  problemName: '0009-palindrome-number',
  difficulty: 'Easy',
  leetcodeBaseUrl: 'https://leetcode.com',
  folderPath: '0009-palindrome-number/',
  readmePath: '0009-palindrome-number/README.md',
  language: 'Python3',
  extension: '.py',
  solutionPath: '0009-palindrome-number/0009-palindrome-number.py',
  syncedAt,
});
const rebasedContent = mergeProblemIntoTopicProblemsContent(
  conflictContent,
  topic,
  palindromeEntry,
  '2026-05-12T10:33:00.000Z',
);
const rebasedDocument = JSON.parse(rebasedContent);
assert.equal(
  rebasedDocument.problems.map(problem => problem.problemName).join(','),
  '0001-two-sum,0009-palindrome-number,0015-3sum',
);
assert.equal(rebasedContent.endsWith('\n'), true);

assert.deepEqual(
  serialize(
    mergeTopicUpdates(
      [
        { slug: 'array', name: 'Array', problemCount: 1 },
        { slug: 'hash-table', name: 'Hash Table', problemCount: 1 },
      ],
      [{ slug: 'array', name: 'Array', problemCount: 2 }],
    ),
  ),
  [
    { slug: 'array', name: 'Array', problemCount: 2 },
    { slug: 'hash-table', name: 'Hash Table', problemCount: 1 },
  ],
);

const migrationDocument = {
  version: 1,
  topic,
  updatedAt: '2026-05-12T10:00:00.000Z',
  problems: [
    {
      frontendId: '1',
      title: 'Two Sum',
      slug: 'two-sum',
      problemName: '0001-two-sum',
      difficulty: 'Easy',
      folderPath: 'LeetCode/0001-two-sum/',
      readmePath: 'LeetCode/0001-two-sum/README.md',
      solutions: [
        {
          language: 'Python3',
          extension: '.py',
          filename: '0001-two-sum.py',
          path: 'LeetCode/0001-two-sum/0001-two-sum.py',
          sha: 'code-sha',
          lastSyncedAt: syncedAt,
        },
      ],
    },
  ],
};
const migrationPlan = createRepositoryStructureMigrationPlan({
  treeFiles: [
    { type: 'blob', path: 'LeetCode/0001-two-sum/0001-two-sum.py', sha: 'code-sha' },
    { type: 'blob', path: 'LeetHub/0001-two-sum/README.md', sha: 'readme-sha' },
    { type: 'blob', path: 'Leethub/0001-two-sum/NOTES.md', sha: 'notes-sha' },
    { type: 'blob', path: 'LeetCode/0001-two-sum/Solution.md', sha: 'post-sha' },
  ],
  topicDocuments: [{ path: 'Topics/array/problems.json', document: migrationDocument }],
  folderOptions: { useDifficultyFolder: true, useLanguageFolder: true },
  syncedAt: '2026-05-12T11:00:00.000Z',
});
assert.deepEqual(
  serialize(migrationPlan.moves.map(move => [move.sourcePath, move.targetPath, move.sha])),
  [
    [
      'LeetCode/0001-two-sum/0001-two-sum.py',
      'Easy/0001-two-sum/Python3/0001-two-sum.py',
      'code-sha',
    ],
    ['LeetHub/0001-two-sum/README.md', 'Easy/0001-two-sum/README.md', 'readme-sha'],
    ['Leethub/0001-two-sum/NOTES.md', 'Easy/0001-two-sum/NOTES.md', 'notes-sha'],
    ['LeetCode/0001-two-sum/Solution.md', 'Easy/0001-two-sum/Solution.md', 'post-sha'],
  ],
);
assert.equal(migrationPlan.conflicts.length, 0);
assert.equal(migrationPlan.topicDocuments.length, 1);
const migratedTopicDocument = JSON.parse(migrationPlan.topicDocuments[0].content);
assert.equal(migratedTopicDocument.problems[0].folderPath, 'Easy/0001-two-sum/');
assert.equal(migratedTopicDocument.problems[0].readmePath, 'Easy/0001-two-sum/README.md');
assert.equal(
  migratedTopicDocument.problems[0].solutions[0].path,
  'Easy/0001-two-sum/Python3/0001-two-sum.py',
);
assert.deepEqual(serialize(migrationPlan.solutionPathUpdates), [
  {
    problemName: '0001-two-sum',
    filename: '0001-two-sum.py',
    path: 'Easy/0001-two-sum/Python3/0001-two-sum.py',
  },
]);

const profileStats = recordSolvedProblemInStats(
  recordSolvedProblemInStats(
    {
      shas: {},
      solutionPaths: {},
    },
    {
      problemName: '0001-two-sum',
      title: 'Two Sum',
      slug: 'two-sum',
      difficulty: 'Easy',
      solvedAt: '2026-05-15T12:00:00.000Z',
      topicTags: [
        { slug: 'array', name: 'Array' },
        { slug: 'hash-table', name: 'Hash Table' },
      ],
    },
  ),
  {
    problemName: '0015-3sum',
    title: '3Sum',
    slug: '3sum',
    difficulty: 'Medium',
    solvedAt: '2026-05-16T12:00:00.000Z',
    topicTags: [
      { slug: 'array', name: 'Array' },
      { slug: 'two-pointers', name: 'Two Pointers' },
    ],
  },
  new Date('2026-05-17T12:00:00.000Z'),
);

assert.equal(profileStats.solved, 2);
assert.equal(profileStats.easy, 1);
assert.equal(profileStats.medium, 1);
assert.equal(profileStats.hard, 0);
assert.equal(profileStats.activityByDate['2026-05-15'], 1);
assert.equal(profileStats.activityByDate['2026-05-16'], 1);
assert.equal(profileStats.currentStreak, 0);
assert.equal(profileStats.bestStreak, 2);
assert.equal(profileStats.tagStats.array.count, 2);
assert.equal(profileStats.tagStats['hash-table'].count, 1);
assert.deepEqual(serialize(profileStats.topTags.map(tag => [tag.slug, tag.count])), [
  ['array', 2],
  ['hash-table', 1],
  ['two-pointers', 1],
]);

const duplicatedProblemStats = recordSolvedProblemInStats(profileStats, {
  problemName: '0001-two-sum',
  title: 'Two Sum',
  slug: 'two-sum',
  difficulty: 'Easy',
  solvedAt: '2026-05-17T12:00:00.000Z',
  topicTags: [{ slug: 'array', name: 'Array' }],
});
assert.equal(duplicatedProblemStats.solved, 2);
assert.equal(duplicatedProblemStats.activityByDate['2026-05-15'], 1);
assert.equal(duplicatedProblemStats.activityByDate['2026-05-17'], undefined);

const conflictPlan = createRepositoryStructureMigrationPlan({
  treeFiles: [
    { type: 'blob', path: 'LeetCode/0001-two-sum/0001-two-sum.py', sha: 'code-sha' },
    {
      type: 'blob',
      path: 'Easy/0001-two-sum/Python3/0001-two-sum.py',
      sha: 'different-sha',
    },
  ],
  topicDocuments: [{ path: 'Topics/array/problems.json', document: migrationDocument }],
  folderOptions: { useDifficultyFolder: true, useLanguageFolder: true },
  syncedAt,
});
assert.equal(conflictPlan.moves.length, 0);
assert.equal(conflictPlan.conflicts.length, 1);
assert.equal(conflictPlan.topicDocuments.length, 0);

const duplicateTargetConflictPlan = createRepositoryStructureMigrationPlan({
  treeFiles: [
    { type: 'blob', path: 'LeetCode/0001-two-sum/README.md', sha: 'readme-sha' },
    { type: 'blob', path: 'LeetHub/0001-two-sum/README.md', sha: 'different-readme-sha' },
  ],
  topicDocuments: [{ path: 'Topics/array/problems.json', document: migrationDocument }],
  folderOptions: { useDifficultyFolder: true, useLanguageFolder: false },
  syncedAt,
});
assert.equal(duplicateTargetConflictPlan.moves.length, 0);
assert.equal(duplicateTargetConflictPlan.conflicts.length, 1);

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

const profileSummary = renderRootReadmeSummary({
  stats: profileStats,
  topics: [
    { slug: 'hash-table', name: 'Hash Table', problemCount: 1 },
    { slug: 'array', name: 'Array', problemCount: 2 },
  ],
});
assert.match(profileSummary, /## Activity/);
assert.match(profileSummary, /\| Current Streak \| Best Streak \| Active Days \|/);
assert.match(profileSummary, /\| 0 days \| 2 days \| 2 \|/);
assert.match(profileSummary, /\| 2026-05-15 \| 1 \|/);
assert.match(profileSummary, /## Top Tags/);
assert.match(profileSummary, /\| Array \| 2 \| 100% \|/);
assert.match(profileSummary, /\| Hash Table \| 1 \| 50% \|/);

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
