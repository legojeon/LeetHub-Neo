import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/js/leetcode.js', import.meta.url), 'utf8');

assert.match(source, /LeetHubScratchpadMemo/);
assert.match(source, /uploadScratchpadMemoIfAny/);
assert.match(source, /repositoryFiles\.SCRATCHPAD_MEMO_FILENAME/);
assert.doesNotMatch(source, /appendScratchpadToSubmissionCode/);
assert.doesNotMatch(source, /appendScratchpadToCode/);

console.log('leetcode scratchpad upload tests passed');
