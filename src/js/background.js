const displayWelcomePage = () => {
  const url = chrome.runtime.getURL('src/html/welcome.html');
  chrome.tabs.create({ url: url, active: true });
};

const closeTab = () => {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
    chrome.tabs.remove(tabs[0].id);
  });
};

const isLeetCodeTab = tab => {
  try {
    const url = new URL(tab.url ?? '');
    return url.protocol === 'https:' && /^leetcode\.(com|cn)$/.test(url.hostname);
  } catch {
    return false;
  }
};

const LEETHUB_CONTENT_SCRIPT_FILES = [
  'src/core/config/repository-files.js',
  'src/core/config/leetcode-languages.js',
  'src/core/scratchpad/scratchpad-memo.js',
  'src/core/templates/root-readme-template.js',
  'src/core/templates/topic-readme-template.js',
  'src/js/topic-index-utils.js',
  'src/js/leetcode-account-utils.js',
  'src/js/leetcode.js',
];
const INITIAL_SYNC_STATUS_STORAGE_KEY = 'initialSyncStatus';
let initialSyncPromise = null;

const sendMessageToTab = (tabId, message) => {
  return new Promise(resolve => {
    chrome.tabs.sendMessage(tabId, message, response => {
      if (chrome.runtime.lastError) {
        resolve(null);
        return;
      }

      resolve(response);
    });
  });
};

const executeScriptInTab = (tabId, files) => {
  return new Promise(resolve => {
    chrome.scripting.executeScript({ target: { tabId }, files }, () => {
      resolve(!chrome.runtime.lastError);
    });
  });
};

const ensureLeetHubSyncScript = async tabId => {
  const pingResponse = await sendMessageToTab(tabId, {
    action: 'pingLeetHubNeoContentScript',
  });

  if (pingResponse?.ok) {
    return true;
  }

  const injected = await executeScriptInTab(tabId, LEETHUB_CONTENT_SCRIPT_FILES);
  if (!injected) {
    return false;
  }

  const readyResponse = await sendMessageToTab(tabId, {
    action: 'pingLeetHubNeoContentScript',
  });

  return Boolean(readyResponse?.ok);
};

const syncPreviousOnFirstAvailableLeetCodeTab = async () => {
  const [activeTabs, tabs] = await Promise.all([
    chrome.tabs.query({ active: true, lastFocusedWindow: true }),
    chrome.tabs.query({}),
  ]);
  const leetCodeTabs = [...activeTabs, ...tabs]
    .filter(isLeetCodeTab)
    .filter((tab, index, candidates) => candidates.findIndex(item => item.id === tab.id) === index);

  for (const tab of leetCodeTabs) {
    const isReady = await ensureLeetHubSyncScript(tab.id);
    if (!isReady) {
      continue;
    }

    const syncResponse = await sendMessageToTab(tab.id, {
      action: 'syncPreviousAcceptedSubmissions',
    });

    if (syncResponse?.ok) {
      return { ok: true, synced: true, tabId: tab.id, result: syncResponse.result };
    }

    return {
      ok: false,
      synced: false,
      tabId: tab.id,
      error: syncResponse?.error || 'Sync failed.',
    };
  }

  return { ok: true, synced: false, reason: 'NO_LEETCODE_TAB' };
};

const setInitialSyncStatus = async (status, details = {}) => {
  const nextStatus = {
    status,
    updatedAt: Date.now(),
    ...details,
  };
  await chrome.storage.local.set({ [INITIAL_SYNC_STATUS_STORAGE_KEY]: nextStatus });
  return nextStatus;
};

const runInitialSync = () => {
  if (initialSyncPromise) {
    return initialSyncPromise;
  }

  initialSyncPromise = (async () => {
    await setInitialSyncStatus('running');
    const result = await syncPreviousOnFirstAvailableLeetCodeTab();

    if (result.synced) {
      const counts = result.result?.counts ?? {};
      await setInitialSyncStatus('completed', {
        solved: counts.solved ?? result.result?.totalProblems ?? 0,
        uploaded: result.result?.uploaded ?? 0,
        skipped: result.result?.skipped ?? 0,
      });
    } else if (result.reason === 'NO_LEETCODE_TAB') {
      await setInitialSyncStatus('pending', { reason: result.reason });
    } else {
      await setInitialSyncStatus('failed', {
        error: result.error || 'Initial sync failed.',
      });
    }

    return result;
  })()
    .catch(async error => {
      await setInitialSyncStatus('failed', { error: error.message });
      return { ok: false, synced: false, error: error.message };
    })
    .finally(() => {
      initialSyncPromise = null;
    });

  return initialSyncPromise;
};

const retryPendingInitialSync = async tab => {
  if (tab && !isLeetCodeTab(tab)) {
    return;
  }

  const values = await chrome.storage.local.get(INITIAL_SYNC_STATUS_STORAGE_KEY);
  if (['pending', 'running'].includes(values[INITIAL_SYNC_STATUS_STORAGE_KEY]?.status)) {
    await runInitialSync();
  }
};

const handleMessage = (request, _sender, sendResponse) => {
  if (!request) {
    console.log('Received undefined message');
    return;
  }

  if (
    request.action === 'syncPreviousAfterInitialHook' ||
    request.action === 'runPreviousAcceptedSubmissionsSync'
  ) {
    runInitialSync()
      .then(sendResponse)
      .catch(error => sendResponse({ ok: false, synced: false, error: error.message }));
    return true;
  }

  if (request.action === 'customCommitMessageUpdated') {
    chrome.storage.local.set({ custom_commit_message: request.message });
  }

  if (request.closeWebPage) {
    if (request.isSuccess) {
      chrome.storage.local.set({ leethub_username: request.username });
      chrome.storage.local.set({ leethub_token: request.token });
      chrome.storage.local.set({ pipe_leethub: false }, () => {});
      closeTab();
      displayWelcomePage();
    } else {
      alert('Error while trying to authenticate your profile!');
      closeTab();
    }
  }
};

chrome.runtime.onMessage.addListener(handleMessage);

chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && isLeetCodeTab(tab)) {
    retryPendingInitialSync(tab).catch(error => console.error('Initial sync retry failed.', error));
  }
});

chrome.runtime.onStartup.addListener(() => {
  retryPendingInitialSync().catch(error => console.error('Initial sync retry failed.', error));
});

retryPendingInitialSync().catch(error => console.error('Initial sync retry failed.', error));

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch(error => console.error('Failed to configure side panel behavior:', error));
