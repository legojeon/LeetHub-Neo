import assert from 'node:assert/strict';

import {
  buildTranslationCacheKey,
  chunkTextForTranslation,
  getLeetCodeProblemSlug,
  normalizeTranslationText,
} from '../src/js/translation-utils.js';

assert.equal(getLeetCodeProblemSlug('https://leetcode.com/problems/two-sum/'), 'two-sum');
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
  normalizeTranslationText('  Given   an array\n\nof integers,  return indices. '),
  'Given an array\nof integers, return indices.',
);

assert.deepEqual(chunkTextForTranslation('a\n\nb\n\nc', 4), ['a\nb', 'c']);
assert.deepEqual(chunkTextForTranslation('abcdef', 3), ['abcdef']);

const firstKey = await buildTranslationCacheKey('two-sum', '<p>Given nums.</p>');
const secondKey = await buildTranslationCacheKey('two-sum', '<p>Given nums.</p>');
const changedKey = await buildTranslationCacheKey('two-sum', '<p>Changed.</p>');

assert.equal(firstKey, secondKey);
assert.notEqual(firstKey, changedKey);
assert.match(firstKey, /^translation:en-ko:two-sum:[a-f0-9]{16}$/);

console.log('translation-utils tests passed');
