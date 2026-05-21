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
const source = await readFile(
  new URL('../src/core/templates/topic-template-utils.js', import.meta.url),
  'utf8',
);
const sandbox = { globalThis: {} };
vm.createContext(sandbox);
vm.runInContext(repositoryFilesSource, sandbox);
vm.runInContext(readmeTemplateSource, sandbox);
vm.runInContext(source, sandbox);

const serialize = value => JSON.parse(JSON.stringify(value));

const {
  DEFAULT_TEMPLATE_LANGUAGE,
  DEFAULT_SHOW_TOPIC_TEMPLATES,
  createTemplateSettings,
  createTemplateReadme,
  createCustomTemplateEntry,
  createCustomTemplateContent,
  createTopicSeedFileEntries,
  createTemplatesJson,
  normalizeTemplateLanguage,
  normalizeTemplateVisibility,
} = sandbox.globalThis.LeetHubTopicTemplateUtils;

const catalog = {
  languages: [
    { slug: 'python', name: 'Python', extension: '.py' },
    { slug: 'javascript', name: 'JavaScript', extension: '.js' },
  ],
};

assert.equal(DEFAULT_TEMPLATE_LANGUAGE, 'python');
assert.equal(DEFAULT_SHOW_TOPIC_TEMPLATES, true);
assert.equal(
  createTemplateReadme('Array'),
  '# Array\n\nUse this page as your personal algorithm playbook.\n\nWrite freely in Markdown: concepts, mental models, gotchas, links, snippets, or your own tips. Keep what helps you recognize this topic faster next time.\n\nThis README works well with GitHub, Obsidian, Notion, or any Markdown-friendly notes app.\n',
);
assert.equal(normalizeTemplateLanguage('javascript', catalog), 'javascript');
assert.equal(normalizeTemplateLanguage('Python', catalog), 'python');
assert.equal(normalizeTemplateLanguage('unknown', catalog), 'python');
assert.equal(normalizeTemplateLanguage(undefined, catalog), 'python');
assert.equal(normalizeTemplateVisibility(false), false);
assert.equal(normalizeTemplateVisibility(undefined), true);
assert.deepEqual(
  serialize(createTemplateSettings({ topicTemplateLanguage: 'javascript' }, catalog)),
  {
    topicTemplateLanguage: 'javascript',
    showTopicTemplates: true,
  },
);
assert.equal(typeof createCustomTemplateEntry, 'function');
assert.equal(typeof createCustomTemplateContent, 'function');
assert.deepEqual(serialize(createCustomTemplateEntry('Union Find Rollback', 'python', catalog)), {
  id: 'union-find-rollback',
  title: 'Union Find Rollback',
  path: 'templates/python/union_find_rollback.py',
});
assert.deepEqual(
  serialize(createCustomTemplateEntry('  C++ Trick: Two Pointers  ', 'javascript', catalog)),
  {
    id: 'c-trick-two-pointers',
    title: 'C++ Trick: Two Pointers',
    path: 'templates/javascript/c_trick_two_pointers.js',
  },
);
assert.equal(createCustomTemplateEntry('!!!', 'python', catalog), null);
assert.equal(
  createCustomTemplateContent('Union Find Rollback', 'python'),
  '# Union Find Rollback\n',
);
assert.equal(createCustomTemplateContent('Sliding Window', 'javascript'), '// Sliding Window\n');

const templatesJson = createTemplatesJson(
  {
    slug: 'array',
    name: 'Array',
    templates: [
      {
        id: 'prefix-sum',
        title: 'Prefix Sum',
        files: {
          python: {
            targetPath: 'templates/python/prefix_sum.py',
          },
          javascript: {
            targetPath: 'templates/javascript/prefix_sum.js',
          },
        },
      },
    ],
  },
  '2026-05-15T10:00:00.000Z',
);

assert.equal(templatesJson.version, 1);
assert.equal(templatesJson.topic.slug, 'array');
assert.equal(templatesJson.updatedAt, '2026-05-15T10:00:00.000Z');
assert.deepEqual(serialize(templatesJson.templates[0]), {
  id: 'prefix-sum',
  title: 'Prefix Sum',
  files: {
    python: 'templates/python/prefix_sum.py',
    javascript: 'templates/javascript/prefix_sum.js',
  },
});

const seedEntries = createTopicSeedFileEntries(
  {
    slug: 'array',
    name: 'Array',
    templates: [
      {
        id: 'prefix-sum',
        title: 'Prefix Sum',
        files: {
          python: {
            sourcePath: 'src/templates/leetcode-cheatsheet/python/array/prefix_sum.py',
            targetPath: 'templates/python/prefix_sum.py',
          },
        },
      },
    ],
  },
  '2026-05-15T10:00:00.000Z',
);
assert.deepEqual(serialize(seedEntries.map(entry => entry.path)), [
  'Topics/array/README.md',
  'Topics/array/problems.json',
  'Topics/array/templates.json',
  'Topics/array/templates/python/prefix_sum.py',
]);
assert.equal(seedEntries[0].content.includes('# Array'), true);
assert.equal(seedEntries[1].content.includes('"problems": []'), true);
assert.equal(
  seedEntries[3].sourcePath,
  'src/templates/leetcode-cheatsheet/python/array/prefix_sum.py',
);

const uncatalogedTopicEntries = createTopicSeedFileEntries({
  slug: 'queue',
  name: 'Queue',
});
assert.deepEqual(serialize(uncatalogedTopicEntries.map(entry => entry.path)), [
  'Topics/queue/README.md',
  'Topics/queue/problems.json',
  'Topics/queue/templates.json',
]);
assert.equal(uncatalogedTopicEntries[2].content.includes('"templates": []'), true);

console.log('topic-template-utils tests passed');
