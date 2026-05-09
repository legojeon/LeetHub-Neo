import assert from 'node:assert/strict';

import {
  buildTranslationCacheKey,
  chunkTextForTranslation,
  getLeetCodeProblemSlug,
  normalizeTranslationText,
} from '../src/js/translation-utils.js';
import { translateDescriptionHtml } from '../src/js/description-translation.js';

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
assert.match(firstKey, /^translation-html:en-ko:two-sum:[a-f0-9]{16}$/);

const sampleHtml = `
<p>Given an array of integers <code>nums</code> and an integer <code>target</code>.</p>
<p><strong>Example 1:</strong></p>
<pre><strong>Input:</strong> nums = [2,7,11,15], target = 9
<strong>Output:</strong> [0,1]
<strong>Explanation:</strong> Because nums[0] + nums[1] == 9, we return [0, 1].</pre>
<p><strong>Constraints:</strong></p>
<ul><li><code>2 <= nums.length <= 10<sup>4</sup></code></li><li><strong>Only one valid answer exists.</strong></li></ul>
`;

const translatedHtml = await translateDescriptionHtml(sampleHtml, async text => `[ko:${text}]`);

assert.match(translatedHtml, /<code>nums<\/code>/);
assert.match(translatedHtml, /<code>target<\/code>/);
assert.match(translatedHtml, /<strong>예시 1:<\/strong>/);
assert.match(translatedHtml, /<strong>입력:<\/strong> nums = \[2,7,11,15\], target = 9/);
assert.match(translatedHtml, /<strong>출력:<\/strong> \[0,1\]/);
assert.match(
  translatedHtml,
  /<strong>설명:<\/strong> \[ko:Because nums\[0\] \+ nums\[1\] == 9, we return \[0, 1\]\.\]/,
);
assert.match(translatedHtml, /<strong>제약 조건:<\/strong>/);
assert.match(translatedHtml, /<code>2 <= nums\.length <= 10<sup>4<\/sup><\/code>/);
assert.match(translatedHtml, /<strong>\[ko:Only one valid answer exists\.\]<\/strong>/);

console.log('translation-utils tests passed');
