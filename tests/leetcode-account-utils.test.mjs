import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(
  new URL('../src/js/leetcode-account-utils.js', import.meta.url),
  'utf8',
);
const sandbox = { globalThis: {} };
vm.createContext(sandbox);
vm.runInContext(source, sandbox);

const serialize = value => JSON.parse(JSON.stringify(value));

const {
  LEETCODE_ACCOUNT_BY_HOOK_STORAGE_KEY,
  createLeetCodeAccountSyncDecision,
  getStoredLeetCodeAccount,
  normalizeGitHubHook,
  normalizeLeetCodeUsername,
  updateStoredLeetCodeAccount,
} = sandbox.globalThis.LeetHubLeetCodeAccountUtils;

assert.equal(LEETCODE_ACCOUNT_BY_HOOK_STORAGE_KEY, 'leetcodeAccountByHook');
assert.equal(normalizeLeetCodeUsername(' LegoJeon '), 'legojeon');
assert.equal(normalizeLeetCodeUsername(undefined), '');
assert.equal(normalizeGitHubHook(' LegoJeon/leetkr '), 'legojeon/leetkr');

assert.deepEqual(
  serialize(
    createLeetCodeAccountSyncDecision({
      storedUsername: undefined,
      currentUsername: 'firstUser',
      site: 'leetcode.com',
    }),
  ),
  {
    status: 'first-sync',
    canSync: true,
    shouldStore: true,
    shouldConfirm: false,
  },
);

assert.deepEqual(
  serialize(
    createLeetCodeAccountSyncDecision({
      storedUsername: 'FirstUser',
      currentUsername: 'firstuser',
      site: 'leetcode.com',
    }),
  ),
  {
    status: 'matched',
    canSync: true,
    shouldStore: false,
    shouldConfirm: false,
  },
);

const mismatch = createLeetCodeAccountSyncDecision({
  storedUsername: 'firstUser',
  currentUsername: 'otherUser',
  site: 'leetcode.com',
});
assert.equal(mismatch.status, 'mismatch');
assert.equal(mismatch.canSync, false);
assert.equal(mismatch.shouldConfirm, true);
assert.equal(mismatch.shouldStore, true);
assert.equal(mismatch.errorMessage.includes('otherUser'), true);
assert.equal(mismatch.confirmMessage.includes('firstUser'), true);

const signedOut = createLeetCodeAccountSyncDecision({
  storedUsername: 'firstUser',
  currentUsername: '',
  site: 'leetcode.com',
});
assert.equal(signedOut.status, 'signed-out');
assert.equal(signedOut.canSync, false);
assert.equal(signedOut.shouldConfirm, false);

const accountByHook = updateStoredLeetCodeAccount(
  {},
  'LegoJeon/leetkr',
  'leetcode.com',
  'firstUser',
  '2026-05-16T10:00:00.000Z',
);
assert.deepEqual(serialize(accountByHook), {
  'legojeon/leetkr': {
    'leetcode.com': {
      username: 'firstUser',
      lockedAt: '2026-05-16T10:00:00.000Z',
    },
  },
});
assert.deepEqual(
  serialize(getStoredLeetCodeAccount(accountByHook, 'legojeon/LEETKR', 'leetcode.com')),
  {
    username: 'firstUser',
    lockedAt: '2026-05-16T10:00:00.000Z',
  },
);
assert.equal(getStoredLeetCodeAccount(accountByHook, 'legojeon/other', 'leetcode.com'), null);
assert.equal(getStoredLeetCodeAccount(accountByHook, 'legojeon/leetkr', 'leetcode.cn'), null);

console.log('leetcode-account-utils tests passed');
