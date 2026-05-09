/* global oAuth2 */

let action = false;

$('#authenticate').on('click', () => {
  if (action) {
    oAuth2.begin();
  }
});

$('#welcome_URL').attr('href', chrome.runtime.getURL('src/html/welcome.html'));

$('#hook_URL').attr('href', chrome.runtime.getURL('src/html/welcome.html'));

$('#collapsible-commit-message-icon').click(() => {
  $('#collapsible-commit-message-icon').toggleClass('open');
  $('#collapsible-commit-message-container').toggle();
  chrome.storage.local.get(['custom_commit_message'], data => {
    console.log('data after toggling', data);
    let commitMessage = data.custom_commit_message;

    // if null, undefined, or an empty string, set default placeholder
    if (!commitMessage) {
      $('#custom-commit-msg').attr('placeholder', 'Time: {time}, Space: {space} - LeetHub-KR');
    } else {
      $('#custom-commit-msg').attr('placeholder', commitMessage);
      $('#custom-commit-msg').val(commitMessage);
    }
  });
});

// Toggle difficulty folder section
$('#collapsible-difficulty-icon').click(() => {
  $('#collapsible-difficulty-icon').toggleClass('open');
  $('#collapsible-difficulty-container').toggle();

  // Load from storage: use default value 'false' if not set
  chrome.storage.local.get({ useDifficultyFolder: false }, data => {
    $('#use-difficulty-folder').prop('checked', data.useDifficultyFolder);
  });
});

// Store Switch State
$('#use-difficulty-folder').change(function () {
  const isChecked = $(this).is(':checked');
  chrome.storage.local.set({ useDifficultyFolder: isChecked });
});

// Toggle language folder section
$('#collapsible-language-icon').click(() => {
  $('#collapsible-language-icon').toggleClass('open');
  $('#collapsible-language-container').toggle();

  // Load from storage: use default value 'false' if not set
  chrome.storage.local.get({ useLanguageFolder: false }, data => {
    $('#use-language-folder').prop('checked', data.useLanguageFolder);
  });
});

// Store Switch State
$('#use-language-folder').change(function () {
  const isChecked = $(this).is(':checked');
  chrome.storage.local.set({ useLanguageFolder: isChecked });
});

// Toggle timestamped filenames section
$('#collapsible-timestamp-icon').click(() => {
  $('#collapsible-timestamp-icon').toggleClass('open');
  $('#collapsible-timestamp-container').toggle();

  // Load stored toggle state
  chrome.storage.local.get({ useTimestampFilename: false }, data => {
    $('#use-timestamp-filename').prop('checked', data.useTimestampFilename);
  });
});

// Save toggle state when checkbox changes
$('#use-timestamp-filename').change(function () {
  const isChecked = $(this).is(':checked');
  chrome.storage.local.set({ useTimestampFilename: isChecked });
});

// Toggle solution post section
$('#collapsible-solution-post-icon').click(() => {
  $('#collapsible-solution-post-icon').toggleClass('open');
  $('#collapsible-solution-post-container').toggle();

  // Load from storage: use default value 'true' if not set (default enabled)
  chrome.storage.local.get({ autoCommitSolutionPost: true }, data => {
    $('#auto-commit-solution-post').prop('checked', data.autoCommitSolutionPost);
  });
});

// Store Switch State
$('#auto-commit-solution-post').change(function () {
  const isChecked = $(this).is(':checked');
  chrome.storage.local.set({ autoCommitSolutionPost: isChecked });
});

$('#msg-save-btn').click(() => {
  const commitMessage = $('#custom-commit-msg').val();
  chrome.runtime.sendMessage({
    action: 'customCommitMessageUpdated',
    message: commitMessage.trim(),
  });

  const successMessage = $('#success-message');
  successMessage.show();
  setTimeout(() => {
    successMessage.hide();
  }, 3000);
});

$('#msg-reset-btn').click(() => {
  $('#custom-commit-msg').val('');
  $('#custom-commit-msg').attr('placeholder', 'Time: {time}, Space: {space} - LeetHub-KR'); // reset to default
  chrome.runtime.sendMessage({ action: 'customCommitMessageUpdated', message: null });
});

function updateDisplayedStats(stats) {
  if (!stats) {
    return;
  }

  $('#p_solved').text(stats.solved ?? 0);
  $('#p_solved_easy').text(stats.easy ?? 0);
  $('#p_solved_medium').text(stats.medium ?? 0);
  $('#p_solved_hard').text(stats.hard ?? 0);
}

function sendSyncPreviousMessage(tabId, syncButton, syncStatus) {
  chrome.tabs.sendMessage(
    tabId,
    { action: 'syncPreviousAcceptedSubmissions' },
    response => {
      syncButton.prop('disabled', false);

      if (chrome.runtime.lastError) {
        syncStatus.text('Could not connect to the LeetCode page. Refresh it, then try again.');
        return;
      }

      if (!response?.ok) {
        syncStatus.text(response?.error || 'Sync failed.');
        return;
      }

      const { counts, totalProblems } = response.result;
      syncStatus.text(`Solved problems: ${counts?.solved ?? totalProblems}.`);
      updateDisplayedStats(counts);
    },
  );
}

$('#sync-previous-btn').click(() => {
  const syncButton = $('#sync-previous-btn');
  const syncStatus = $('#sync-previous-status');

  syncButton.prop('disabled', true);
  syncStatus.text('Open a LeetCode tab and keep it active while syncing...');

  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const activeTab = tabs?.[0];

    if (!activeTab?.id || !activeTab.url?.includes('leetcode.')) {
      syncStatus.text('Please open a LeetCode problem page, then click Sync Previous again.');
      syncButton.prop('disabled', false);
      return;
    }

    chrome.tabs.sendMessage(
      activeTab.id,
      { action: 'pingLeetHubKRContentScript' },
      response => {
        if (!chrome.runtime.lastError && response?.ok) {
          sendSyncPreviousMessage(activeTab.id, syncButton, syncStatus);
          return;
        }

        syncStatus.text('Preparing LeetHub-KR on this LeetCode tab...');
        chrome.scripting.executeScript(
          {
            target: { tabId: activeTab.id },
            files: ['src/js/leetcode.js'],
          },
          () => {
            if (chrome.runtime.lastError) {
              syncStatus.text('Refresh the LeetCode page, then try again.');
              syncButton.prop('disabled', false);
              return;
            }

            sendSyncPreviousMessage(activeTab.id, syncButton, syncStatus);
          },
        );
      },
    );
  });
});

/* when variable is clicked, add to custom commit message text area*/
$('.commit-variable').on('click', function () {
  var variableName = $(this).attr('id');
  $('#custom-commit-msg').val(function (index, currentValue) {
    return currentValue + `{${variableName}} `;
  });
});

chrome.storage.local.get('leethub_token', data => {
  const token = data.leethub_token;
  if (token === null || token === undefined) {
    action = true;
    $('#auth_mode').show();
  } else {
    // To validate user, load user object from GitHub.
    const AUTHENTICATION_URL = 'https://api.github.com/user';

    const xhr = new XMLHttpRequest();
    xhr.addEventListener('readystatechange', function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          /* Show MAIN FEATURES */
          chrome.storage.local.get('mode_type', data2 => {
            if (data2 && data2.mode_type === 'commit') {
              $('#commit_mode').show();
              /* Get problem stats and repo link */
              chrome.storage.local.get(['stats', 'leethub_hook'], data3 => {
                const { stats } = data3;
                updateDisplayedStats(stats);
                const leethubHook = data3.leethub_hook;
                if (leethubHook) {
                  $('#repo_url').html(
                    `<a target="blank" style="color: cadetblue !important; font-size:0.8em;" href="https://github.com/${leethubHook}">${leethubHook}</a>`,
                  );
                }
              });
            } else {
              $('#hook_mode').show();
            }
          });
        } else if (xhr.status === 401) {
          // bad oAuth: reset token and redirect to authorization process again!
          chrome.storage.local.set({ leethub_token: null }, () => {
            console.log('BAD oAuth!!! Redirecting back to oAuth process');
            action = true;
            $('#auth_mode').show();
          });
        }
      }
    });
    xhr.open('GET', AUTHENTICATION_URL, true);
    xhr.setRequestHeader('Authorization', `token ${token}`);
    xhr.send();
  }
});
