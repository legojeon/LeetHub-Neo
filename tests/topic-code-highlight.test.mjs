import assert from 'node:assert/strict';

import {
  getTopicCodeLanguageForPath,
  isSupportedTopicCodeLanguage,
  normalizeTopicCodeLanguage,
} from '../src/features/sidepanel/topics/topic-code-highlight.js';

assert.equal(normalizeTopicCodeLanguage('python'), 'python');
assert.equal(normalizeTopicCodeLanguage('Python'), 'python');
assert.equal(normalizeTopicCodeLanguage('py'), 'python');
assert.equal(normalizeTopicCodeLanguage('js'), 'javascript');
assert.equal(normalizeTopicCodeLanguage('C++'), 'cpp');
assert.equal(normalizeTopicCodeLanguage('rb'), 'ruby');

assert.equal(normalizeTopicCodeLanguage('typescript'), '');
assert.equal(normalizeTopicCodeLanguage('cangjie'), '');
assert.equal(normalizeTopicCodeLanguage(''), '');

assert.equal(isSupportedTopicCodeLanguage('java'), true);
assert.equal(isSupportedTopicCodeLanguage('go'), false);

assert.equal(getTopicCodeLanguageForPath('templates/cpp/prefix_sum.cpp'), 'cpp');
assert.equal(getTopicCodeLanguageForPath('templates/javascript/prefix_sum.js'), 'javascript');
assert.equal(getTopicCodeLanguageForPath('templates/python/prefix_sum.py'), 'python');
assert.equal(getTopicCodeLanguageForPath('templates/ruby/prefix_sum.rb'), 'ruby');
assert.equal(getTopicCodeLanguageForPath('templates/lua/prefix_sum.lua'), 'lua');
assert.equal(getTopicCodeLanguageForPath('templates/java/prefix_sum.java'), 'java');
assert.equal(getTopicCodeLanguageForPath('templates/typescript/prefix_sum.ts'), '');
assert.equal(getTopicCodeLanguageForPath('', 'Ruby'), 'ruby');

console.log('topic-code-highlight tests passed');
