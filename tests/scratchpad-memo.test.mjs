import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const scratchpadMemoSource = await readFile(
  new URL('../src/core/scratchpad/scratchpad-memo.js', import.meta.url),
  'utf8',
);
const sandbox = { globalThis: {} };
vm.createContext(sandbox);
vm.runInContext(scratchpadMemoSource, sandbox);

const { formatScratchpadMemo, normalizeScratchpadText } = sandbox.globalThis.LeetHubScratchpadMemo;

assert.equal(normalizeScratchpadText('  idea\n'), 'idea');
assert.equal(normalizeScratchpadText(null), '');
assert.equal(formatScratchpadMemo('two pointers\ncheck bounds'), 'two pointers\ncheck bounds\n');
assert.equal(formatScratchpadMemo(''), '');
assert.equal(formatScratchpadMemo('   \n  '), '');

console.log('scratchpad-memo tests passed');
