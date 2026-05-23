import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const repositoryFilesSource = await readFile(
  new URL('../src/core/config/repository-files.js', import.meta.url),
  'utf8',
);
const sandbox = { globalThis: {} };
vm.createContext(sandbox);
vm.runInContext(repositoryFilesSource, sandbox);

const repositoryFiles = sandbox.globalThis.LeetHubRepositoryFiles;

assert.equal(repositoryFiles.isProblemMetadataFile('README.md'), true);
assert.equal(repositoryFiles.isProblemMetadataFile('NOTES.md'), true);
assert.equal(repositoryFiles.isProblemMetadataFile('Solution.md'), true);
assert.equal(repositoryFiles.isProblemMetadataFile('memo.txt'), true);
assert.equal(repositoryFiles.isProblemMetadataFile('0001-two-sum.py'), false);
assert.equal(repositoryFiles.isSolutionUpload('memo.txt'), false);
assert.equal(repositoryFiles.isSolutionUpload('0001-two-sum.py'), true);

console.log('repository-files tests passed');
