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
  const tabs = await chrome.tabs.query({});
  const leetCodeTabs = tabs.filter(isLeetCodeTab);

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
      error: syncResponse?.error || 'Initial sync failed.',
    };
  }

  return { ok: true, synced: false, reason: 'NO_LEETCODE_TAB' };
};

const handleMessage = (request, _sender, sendResponse) => {
  if (!request) {
    console.log('Received undefined message');
    return;
  }

  if (request.action === 'syncPreviousAfterInitialHook') {
    syncPreviousOnFirstAvailableLeetCodeTab()
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

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch(error => console.error('Failed to configure side panel behavior:', error));
