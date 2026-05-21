import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const scratchpadCommentSource = await readFile(
  new URL('../src/core/scratchpad/scratchpad-comment.js', import.meta.url),
  'utf8',
);
const sandbox = { globalThis: {} };
vm.createContext(sandbox);
vm.runInContext(scratchpadCommentSource, sandbox);

const {
  appendScratchpadToCode,
  formatScratchpadComment,
  getLineCommentToken,
  normalizeScratchpadText,
} = sandbox.globalThis.LeetHubScratchpadComment;

assert.equal(normalizeScratchpadText('  idea\n'), 'idea');
assert.equal(getLineCommentToken('.py'), '#');
assert.equal(getLineCommentToken('.java'), '//');
assert.equal(getLineCommentToken('.sql'), '--');
assert.equal(getLineCommentToken('.erl'), '%');
assert.equal(getLineCommentToken('.unknown'), '//');
assert.equal(
  formatScratchpadComment('two pointers\ncheck bounds', '.py'),
  ['# Scratchpad', '# two pointers', '# check bounds'].join('\n'),
);
assert.equal(formatScratchpadComment('', '.js'), '');
assert.equal(
  appendScratchpadToCode('class Solution {}', 'remember edge case', '.java'),
  ['class Solution {}', '', '// Scratchpad', '// remember edge case', ''].join('\n'),
);

console.log('scratchpad-comment tests passed');
