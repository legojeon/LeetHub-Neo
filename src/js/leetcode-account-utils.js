(function initializeLeetCodeAccountUtils(globalObject) {
  const LEETCODE_ACCOUNT_BY_HOOK_STORAGE_KEY = 'leetcodeAccountByHook';

  function normalizeLeetCodeUsername(username) {
    return String(username ?? '')
      .trim()
      .toLowerCase();
  }

  function normalizeGitHubHook(hook) {
    return String(hook ?? '')
      .trim()
      .toLowerCase();
  }

  function createLeetCodeAccountSyncDecision({ storedUsername, currentUsername, site }) {
    const normalizedStoredUsername = normalizeLeetCodeUsername(storedUsername);
    const normalizedCurrentUsername = normalizeLeetCodeUsername(currentUsername);

    if (!normalizedCurrentUsername) {
      return {
        status: 'signed-out',
        canSync: false,
        shouldStore: false,
        shouldConfirm: false,
        errorMessage: `Sign in to ${site || 'LeetCode'} before syncing accepted submissions.`,
      };
    }

    if (!normalizedStoredUsername) {
      return {
        status: 'first-sync',
        canSync: true,
        shouldStore: true,
        shouldConfirm: false,
      };
    }

    if (normalizedStoredUsername === normalizedCurrentUsername) {
      return {
        status: 'matched',
        canSync: true,
        shouldStore: false,
        shouldConfirm: false,
      };
    }

    return {
      status: 'mismatch',
      canSync: false,
      shouldStore: true,
      shouldConfirm: true,
      confirmMessage: [
        `LeetHub-Neo has remembered ${site || 'LeetCode'} account "${storedUsername}" for this GitHub repo.`,
        `You are currently signed in as "${currentUsername}".`,
        'Continuing will sync this account into the connected repo and remember it for future syncs.',
        '',
        'Continue?',
      ].join('\n'),
      errorMessage: `Sync canceled because the current ${site || 'LeetCode'} account (${currentUsername}) does not match the remembered account (${storedUsername}).`,
    };
  }

  function getStoredLeetCodeAccount(accountByHook, hook, site) {
    const hookKey = normalizeGitHubHook(hook);

    if (!hookKey || !site) {
      return null;
    }

    return accountByHook?.[hookKey]?.[site] ?? null;
  }

  function updateStoredLeetCodeAccount(accountByHook, hook, site, username, lockedAt) {
    const hookKey = normalizeGitHubHook(hook);

    if (!hookKey || !site) {
      return accountByHook ?? {};
    }

    return {
      ...(accountByHook ?? {}),
      [hookKey]: {
        ...(accountByHook?.[hookKey] ?? {}),
        [site]: {
          username,
          lockedAt,
        },
      },
    };
  }

  globalObject.LeetHubLeetCodeAccountUtils = {
    LEETCODE_ACCOUNT_BY_HOOK_STORAGE_KEY,
    createLeetCodeAccountSyncDecision,
    getStoredLeetCodeAccount,
    normalizeGitHubHook,
    normalizeLeetCodeUsername,
    updateStoredLeetCodeAccount,
  };
})(globalThis);
