import assert from 'node:assert/strict';

import {
  buildTranslationCacheKey,
  chunkTextForTranslation,
  getLeetCodeProblemSlug,
  isLeetCodeProblemTabUrl,
  isLeetCodeUrl,
  normalizeTranslationText,
} from '../src/core/translation/translation-utils.js';
import { translateDescriptionHtml } from '../src/features/sidepanel/description/description-translation.js';
import { renderStructuredDescriptionHtml } from '../src/features/sidepanel/description/description-section-utils.js';

import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const translationLanguageSource = await readFile(
  new URL('../src/core/config/translation-languages.js', import.meta.url),
  'utf8',
);
const translationLanguageSandbox = { globalThis: {} };
vm.createContext(translationLanguageSandbox);
vm.runInContext(translationLanguageSource, translationLanguageSandbox);

const {
  DEFAULT_TRANSLATION_LANGUAGE,
  TRANSLATION_LANGUAGE_STORAGE_KEY,
  TRANSLATION_LANGUAGE_OPTIONS,
  createTranslationLanguageSettings,
  getTranslationLanguageName,
  normalizeTranslationLanguage,
} = translationLanguageSandbox.globalThis.LeetHubTranslationLanguageUtils;
const serialize = value => JSON.parse(JSON.stringify(value));

assert.equal(DEFAULT_TRANSLATION_LANGUAGE, 'ko');
assert.equal(TRANSLATION_LANGUAGE_STORAGE_KEY, 'translationLanguage');
assert.equal(
  TRANSLATION_LANGUAGE_OPTIONS.some(language => language.code === 'ko'),
  true,
);
assert.equal(
  TRANSLATION_LANGUAGE_OPTIONS.some(language => language.code === 'fr'),
  true,
);
assert.equal(
  TRANSLATION_LANGUAGE_OPTIONS.some(language => language.code === 'en'),
  true,
);
assert.equal(normalizeTranslationLanguage('FR'), 'fr');
assert.equal(normalizeTranslationLanguage('zh-hant'), 'zh-Hant');
assert.equal(normalizeTranslationLanguage('unknown'), 'ko');
assert.equal(getTranslationLanguageName('ja'), 'Japanese');
assert.equal(getTranslationLanguageName('unknown'), 'Korean');
assert.deepEqual(serialize(createTranslationLanguageSettings({ translationLanguage: 'es' })), {
  translationLanguage: 'es',
});

assert.equal(isLeetCodeUrl('https://leetcode.com/'), true);
assert.equal(isLeetCodeUrl('https://leetcode.com'), true);
assert.equal(isLeetCodeUrl('https://leetcode.com/problemset/'), true);
assert.equal(isLeetCodeUrl('https://leetcode.cn/'), true);
assert.equal(isLeetCodeUrl('https://leetcode.com.evil.test/'), false);
assert.equal(isLeetCodeUrl('https://naver.com/search?q=leetcode.com'), false);
assert.equal(isLeetCodeUrl('not a url'), false);

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
assert.equal(getLeetCodeProblemSlug('https://github.com/legojeon/LeetHub-Neo'), null);

assert.equal(isLeetCodeProblemTabUrl('https://leetcode.com/problems/two-sum/'), true);
assert.equal(isLeetCodeProblemTabUrl('https://leetcode.com/problems/two-sum/description/'), true);
assert.equal(
  isLeetCodeProblemTabUrl('https://leetcode.com/problems/two-sum/submissions/123/'),
  false,
);
assert.equal(isLeetCodeProblemTabUrl('https://leetcode.com/problemset/'), false);
assert.equal(isLeetCodeProblemTabUrl('https://github.com/legojeon/LeetHub-Neo'), false);

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

const frenchKey = await buildTranslationCacheKey('two-sum', '<p>Given nums.</p>', 'fr');
assert.match(frenchKey, /^translation-html:en-fr:two-sum:[a-f0-9]{16}$/);
assert.notEqual(firstKey, frenchKey);

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

const frenchHtml = await translateDescriptionHtml(sampleHtml, async text => `[fr:${text}]`, {
  targetLanguage: 'fr',
});

assert.match(frenchHtml, /<strong>\[fr:Example 1:\]<\/strong>/);
assert.match(frenchHtml, /<strong>\[fr:Input:\]<\/strong> nums = \[2,7,11,15\], target = 9/);
assert.match(frenchHtml, /<strong>\[fr:Output:\]<\/strong> \[0,1\]/);
assert.match(
  frenchHtml,
  /<strong>\[fr:Explanation:\]<\/strong> \[fr:Because nums\[0\] \+ nums\[1\] == 9, we return \[0, 1\]\.\]/,
);
assert.match(frenchHtml, /<strong>\[fr:Constraints:\]<\/strong>/);

const englishHtml = await translateDescriptionHtml(
  sampleHtml,
  async () => {
    throw new Error('English source should not call Translator API.');
  },
  {
    targetLanguage: 'en',
  },
);

assert.equal(englishHtml, sampleHtml);

const structuredHtml = renderStructuredDescriptionHtml(translatedHtml);
assert.match(structuredHtml, /class="description-card description-card-problem"/);
assert.match(structuredHtml, /class="description-example-group"/);
assert.match(structuredHtml, /class="description-card description-card-example"/);
assert.match(structuredHtml, /class="description-card description-card-constraints"/);
assert.match(
  structuredHtml,
  /description-card-problem[\s\S]*description-example-group[\s\S]*description-card-constraints/,
);
assert.match(structuredHtml, /class="description-card-title">Problem<\/h3>/);
assert.match(structuredHtml, /class="description-card-title">예시 1:<\/h3>/);
assert.match(
  structuredHtml,
  /<div class="example-field example-field-input"><span class="example-field-label">입력:<\/span><span class="example-field-value">nums = \[2,7,11,15\], target = 9<\/span><\/div>/,
);
assert.match(
  structuredHtml,
  /<div class="example-field example-field-output"><span class="example-field-label">출력:<\/span><span class="example-field-value">\[0,1\]<\/span><\/div>/,
);
assert.doesNotMatch(structuredHtml, /class="example-field-label">설명:<\/span>/);
assert.match(
  structuredHtml,
  /<div class="example-field example-field-explanation"><span class="example-field-value example-field-value-muted">\[ko:Because nums\[0\] \+ nums\[1\] == 9, we return \[0, 1\]\.\]<\/span><\/div>/,
);
assert.match(structuredHtml, /<code>2 <= nums\.length <= 10<sup>4<\/sup><\/code>/);

console.log('translation-utils tests passed');
