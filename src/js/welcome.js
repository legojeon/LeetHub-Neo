const option = () => {
  return $('#type').val();
};

const repositoryName = () => {
  if (option() == 'new') return $('#name').val().trim();
  else return $('#existing_repo').val().trim();
};

const templateUtils = globalThis.LeetHubTopicTemplateUtils;
const templateCatalog = globalThis.LeetHubTopicTemplateCatalog;
const translationLanguageUtils = globalThis.LeetHubTranslationLanguageUtils;
const repositoryFiles = globalThis.LeetHubRepositoryFiles;
const i18n = globalThis.LeetHubI18n;
const t = (key, substitutions, fallback = '') =>
  i18n?.getMessage(key, substitutions, fallback) || fallback || key;
const INITIAL_SYNC_AFTER_HOOK_STORAGE_KEY = 'syncAcceptedSubmissionsAfterHook';
const INITIAL_SYNC_STATUS_STORAGE_KEY = 'initialSyncStatus';
const LEETHUB_BASE_PATH_STORAGE_KEY =
  repositoryFiles?.LEETHUB_BASE_PATH_STORAGE_KEY ?? 'leethub_base_path';

const renderWelcomeTemplateLanguageOptions = selectedLanguage => {
  const select = $('#topic-template-language');

  if (!select.length || !templateCatalog?.languages?.length) {
    return;
  }

  select.empty();
  templateCatalog.languages.forEach(language => {
    select.append(
      $('<option>', {
        value: language.slug,
        text: language.name,
        selected: language.slug === selectedLanguage,
      }),
    );
  });
};

const selectedTemplateLanguage = () => {
  return templateUtils?.normalizeTemplateLanguage(
    $('#topic-template-language').val(),
    templateCatalog,
  );
};

const initializeWelcomeTemplateLanguage = () => {
  if (!templateUtils || !templateCatalog) {
    return;
  }

  chrome.storage.local.get(templateUtils.TEMPLATE_LANGUAGE_STORAGE_KEY, values => {
    const language = templateUtils.normalizeTemplateLanguage(
      values[templateUtils.TEMPLATE_LANGUAGE_STORAGE_KEY],
      templateCatalog,
    );
    renderWelcomeTemplateLanguageOptions(language);
  });
};

const saveSelectedTemplateLanguage = async () => {
  if (!templateUtils) {
    return;
  }

  await chrome.storage.local.set({
    [templateUtils.TEMPLATE_LANGUAGE_STORAGE_KEY]: selectedTemplateLanguage(),
  });
};

const renderWelcomeTranslationLanguageOptions = selectedLanguage => {
  const select = $('#translation-language');

  if (!select.length || !translationLanguageUtils?.TRANSLATION_LANGUAGE_OPTIONS?.length) {
    return;
  }

  select.empty();
  translationLanguageUtils.TRANSLATION_LANGUAGE_OPTIONS.forEach(language => {
    select.append(
      $('<option>', {
        value: language.code,
        text: i18n?.localizeLanguageName(language.code, language.name) ?? language.name,
        selected: language.code === selectedLanguage,
      }),
    );
  });
};

const selectedTranslationLanguage = () => {
  return translationLanguageUtils?.normalizeTranslationLanguage($('#translation-language').val());
};

const initializeWelcomeTranslationLanguage = () => {
  if (!translationLanguageUtils) {
    return;
  }

  chrome.storage.local.get(translationLanguageUtils.TRANSLATION_LANGUAGE_STORAGE_KEY, values => {
    const language = translationLanguageUtils.normalizeTranslationLanguage(
      values[translationLanguageUtils.TRANSLATION_LANGUAGE_STORAGE_KEY],
    );
    renderWelcomeTranslationLanguageOptions(language);
  });
};

const saveSelectedTranslationLanguage = async () => {
  if (!translationLanguageUtils) {
    return;
  }

  await chrome.storage.local.set({
    [translationLanguageUtils.TRANSLATION_LANGUAGE_STORAGE_KEY]: selectedTranslationLanguage(),
  });
};

const selectedRepositoryBasePath = () => {
  return repositoryFiles?.normalizeRepositoryBasePath
    ? repositoryFiles.normalizeRepositoryBasePath($('#repository-base-path').val())
    : String($('#repository-base-path').val() ?? '').trim();
};

const initializeRepositoryBasePath = () => {
  chrome.storage.local.get(LEETHUB_BASE_PATH_STORAGE_KEY, values => {
    $('#repository-base-path').val(values[LEETHUB_BASE_PATH_STORAGE_KEY] ?? '');
  });
};

const saveSelectedRepositoryBasePath = async () => {
  await chrome.storage.local.set({
    [LEETHUB_BASE_PATH_STORAGE_KEY]: selectedRepositoryBasePath(),
  });
};

const formatRepositoryTarget = hook => {
  const basePath = selectedRepositoryBasePath();
  return basePath ? `${hook}/${basePath}` : hook;
};

const selectedInitialSyncEnabled = () => {
  return $('#sync-accepted-submissions-after-hook').is(':checked');
};

const initializeInitialSyncOption = () => {
  chrome.storage.local.get({ [INITIAL_SYNC_AFTER_HOOK_STORAGE_KEY]: true }, values => {
    $('#sync-accepted-submissions-after-hook').prop(
      'checked',
      values[INITIAL_SYNC_AFTER_HOOK_STORAGE_KEY],
    );
  });
};

const saveSelectedInitialSyncOption = async () => {
  await chrome.storage.local.set({
    [INITIAL_SYNC_AFTER_HOOK_STORAGE_KEY]: selectedInitialSyncEnabled(),
  });
};

initializeWelcomeTemplateLanguage();
initializeWelcomeTranslationLanguage();
initializeInitialSyncOption();
initializeRepositoryBasePath();

const syncPreviousAfterInitialHook = () => {
  appendSuccessLine(t('initialSyncQueued', undefined, 'Initial submission sync queued...'));
  chrome.runtime.sendMessage({ action: 'syncPreviousAfterInitialHook' }, response => {
    if (chrome.runtime.lastError) {
      appendSuccessLine(
        t(
          'initialSyncPendingOpen',
          undefined,
          'Initial sync is pending. Open LeetCode to continue.',
        ),
      );
      return;
    }

    if (response?.synced) {
      const solved = response.result?.counts?.solved ?? response.result?.totalProblems ?? 0;
      appendSuccessLine(
        t(
          'initialSyncComplete',
          [String(solved)],
          `Initial sync complete. ${solved} solved problems found.`,
        ),
      );
    } else if (response?.reason === 'NO_LEETCODE_TAB') {
      appendSuccessLine(
        t(
          'initialSyncPendingLater',
          undefined,
          'Initial sync is pending. It will start when you open LeetCode.',
        ),
      );
    } else if (!response?.ok) {
      const error = response?.error || t('retryLater', undefined, 'Please retry later.');
      appendSuccessLine(t('initialSyncFailed', [error], `Initial sync failed: ${error}`));
    }
  });
};

const appendSuccessLine = message => {
  $('#success').append('<br />', document.createTextNode(message));
};

const showRepositoryConnected = ({ created, url, label }) => {
  $('#success')
    .empty()
    .append(
      document.createTextNode(
        `${t(
          created ? 'repositoryCreated' : 'repositoryLinked',
          undefined,
          created ? 'Repository created and connected:' : 'Repository connected:',
        )} `,
      ),
      $('<a>', { target: 'blank', href: url, text: label }),
      document.createTextNode(`. ${t('startSolving', undefined, 'Start solving on')} `),
      $('<a>', { href: 'https://leetcode.com', text: 'LeetCode' }),
      document.createTextNode(' / '),
      $('<a>', { href: 'https://leetcode.cn', text: '力扣' }),
      document.createTextNode('.'),
    )
    .show();
};

/* Status codes for creating of repo */

const statusCode = (res, status, name) => {
  switch (status) {
    case 304:
      $('#success').hide();
      $('#error').text(
        t(
          'createRepositoryUnmodified',
          [name],
          `Could not create ${name}. GitHub did not modify the repository. Try again later.`,
        ),
      );
      $('#error').show();
      break;

    case 400:
      $('#success').hide();
      $('#error').text(
        t(
          'createRepositoryBadRequest',
          [name],
          `Could not create ${name}. GitHub rejected the request.`,
        ),
      );
      $('#error').show();
      break;

    case 401:
      $('#success').hide();
      $('#error').text(
        t(
          'createRepositoryUnauthorized',
          [name],
          `Could not create ${name}. Authorize GitHub again and retry.`,
        ),
      );
      $('#error').show();
      break;

    case 403:
      $('#success').hide();
      $('#error').text(
        t(
          'createRepositoryForbidden',
          [name],
          `Could not create ${name}. GitHub denied access to the repository.`,
        ),
      );
      $('#error').show();
      break;

    case 422:
      $('#success').hide();
      $('#error').text(
        t(
          'createRepositoryExists',
          [name],
          `Could not create ${name}. It may already exist; try linking it instead.`,
        ),
      );
      $('#error').show();
      break;

    default:
      /* Change mode type to commit */
      chrome.storage.local.set({ mode_type: 'commit' }, () => {
        $('#error').hide();
        showRepositoryConnected({ created: true, url: res.html_url, label: name });
        $('#unlink').show();
        /* Show new layout */
        document.getElementById('hook_mode').style.display = 'none';
        document.getElementById('commit_mode').style.display = 'inherit';

        /* Set Repo Hook */
        chrome.storage.local.set(
          {
            leethub_hook: res.full_name,
            [LEETHUB_BASE_PATH_STORAGE_KEY]: selectedRepositoryBasePath(),
          },
          async () => {
            console.log('Successfully set new repo hook');
            if (selectedInitialSyncEnabled()) {
              syncPreviousAfterInitialHook();
            } else {
              await chrome.storage.local.remove(INITIAL_SYNC_STATUS_STORAGE_KEY);
            }
          },
        );
      });

      break;
  }
};

const createRepo = (token, name) => {
  const AUTHENTICATION_URL = 'https://api.github.com/user/repos';
  let data = {
    name,
    private: true,
    auto_init: true,
    description:
      'Collection of LeetCode questions to ace the coding interview! - Created using [LeetHub-Neo](https://github.com/legojeon/LeetHub-Neo)',
  };
  data = JSON.stringify(data);

  const xhr = new XMLHttpRequest();
  xhr.addEventListener('readystatechange', function () {
    if (xhr.readyState === 4) {
      statusCode(JSON.parse(xhr.responseText), xhr.status, name);
    }
  });

  xhr.open('POST', AUTHENTICATION_URL, true);
  xhr.setRequestHeader('Authorization', `token ${token}`);
  xhr.setRequestHeader('Accept', 'application/vnd.github.v3+json');
  xhr.send(data);
};

/* Status codes for linking of repo */
const linkStatusCode = (status, name) => {
  let bool = false;
  switch (status) {
    case 301:
      $('#success').hide();
      $('#error').text(
        t(
          'linkRepositoryMoved',
          [name],
          `Could not connect ${name}. The repository has moved; select it again or create a new one.`,
        ),
      );
      $('#error').show();
      break;

    case 403:
      $('#success').hide();
      $('#error').text(
        t(
          'linkRepositoryForbidden',
          [name],
          `Could not connect ${name}. Check that your GitHub account has write access.`,
        ),
      );
      $('#error').show();
      break;

    case 404:
      $('#success').hide();
      $('#error').text(
        t(
          'linkRepositoryNotFound',
          [name],
          `Could not find ${name}. Select the correct repository and try again.`,
        ),
      );
      $('#error').show();
      break;

    default:
      bool = true;
      break;
  }
  $('#unlink').show();
  return bool;
};

/* Handle inputBox by type selection */
$('#type').change(function () {
  const selectedType = $(this).val();
  if (selectedType === 'link') {
    $('#name').hide();
    $('#existing_repo').show();
    loadRepositories();
  } else {
    $('#name').show();
    $('#existing_repo').hide();
  }
});

/* Load repositories from GitHub */
function loadRepositories() {
  chrome.storage.local.get('leethub_token', data => {
    const token = data.leethub_token;

    let repos = [];
    let page = 1;
    let hasNextPage = true;

    function fetchRepos() {
      $.ajax({
        url: 'https://api.github.com/user/repos',
        type: 'GET',
        data: {
          per_page: 100, // Max per_page to reduce the number of requests
          page: page, // Page number for pagination
          affiliation: 'owner',
        },
        headers: {
          Authorization: `token ${token}`,
        },
        success: function (response, status, xhr) {
          repos = repos.concat(response);

          // Check for the next page by looking at the 'Link' header
          const linkHeader = xhr.getResponseHeader('Link');
          hasNextPage = linkHeader && linkHeader.includes('rel="next"');

          // If there's a next page, fetch the next page
          if (hasNextPage) {
            page++;
            fetchRepos(); // Recursively fetch the next page
          } else {
            // All repos have been fetched, populate the dropdown
            $('#existing_repo')
              .empty()
              .append(
                $('<option>', {
                  value: '',
                  text: t('selectRepository', undefined, 'Select a Repository'),
                }),
              );
            repos.forEach(repo => {
              $('#existing_repo').append(`<option value="${repo.name}">${repo.name}</option>`);
            });
          }
        },
        error: function (xhr, status, error) {
          console.error('Failed to load repositories:', error);
          $('#error')
            .text(
              t(
                'loadRepositoriesFailed',
                undefined,
                'Failed to load repositories. Please try again.',
              ),
            )
            .show();
        },
      });
    }

    fetchRepos();
  });
}

/*
    Method for linking hook with an existing repository
    Steps:
    1. Check if existing repository exists and the user has write access to it.
    2. Link Hook to it (chrome Storage).
*/
const linkRepo = (token, name) => {
  const AUTHENTICATION_URL = `https://api.github.com/repos/${name}`;

  const xhr = new XMLHttpRequest();
  xhr.addEventListener('readystatechange', function () {
    if (xhr.readyState === 4) {
      const res = JSON.parse(xhr.responseText);
      const bool = linkStatusCode(xhr.status, name);
      console.log('🚀 ~ file: welcome.js:153 ~ bool:', bool);
      if (xhr.status === 200) {
        // BUG FIX
        if (!bool) {
          // unable to gain access to repo in commit mode. Must switch to hook mode.
          /* Set mode type to hook */
          chrome.storage.local.set({ mode_type: 'hook' }, () => {
            console.log(`Error linking ${name} to LeetHub-Neo`);
          });
          /* Set Repo Hook to NONE */
          chrome.storage.local.set({ leethub_hook: null }, () => {
            console.log('Defaulted repo hook to NONE');
          });

          /* Hide accordingly */
          document.getElementById('hook_mode').style.display = 'inherit';
          document.getElementById('commit_mode').style.display = 'none';
        } else {
          /* Change mode type to commit */
          /* Save repo url to chrome storage */
          chrome.storage.local.set({ mode_type: 'commit', repo: res.html_url }, () => {
            $('#error').hide();
            showRepositoryConnected({
              created: false,
              url: res.html_url,
              label: formatRepositoryTarget(res.full_name),
            });
            $('#unlink').show();

            /* Set Repo Hook */
            chrome.storage.local
              .set({
                leethub_hook: res.full_name,
                [LEETHUB_BASE_PATH_STORAGE_KEY]: selectedRepositoryBasePath(),
              })
              .then(async () => {
                console.log('Successfully set new repo hook');
                if (selectedInitialSyncEnabled()) {
                  syncPreviousAfterInitialHook();
                } else {
                  await chrome.storage.local.remove(INITIAL_SYNC_STATUS_STORAGE_KEY);
                }
                return chrome.storage.local.get('stats');
              })
              .then(psolved => {
                /* Get problems solved count */
                const { stats } = psolved;
                if (stats && stats.solved) {
                  $('#p_solved').text(stats.solved);
                  $('#p_solved_easy').text(stats.easy);
                  $('#p_solved_medium').text(stats.medium);
                  $('#p_solved_hard').text(stats.hard);
                }
              });
          });

          /* Hide accordingly */
          document.getElementById('hook_mode').style.display = 'none';
          document.getElementById('commit_mode').style.display = 'inherit';
        }
      }
    }
  });

  xhr.open('GET', AUTHENTICATION_URL, true);
  xhr.setRequestHeader('Authorization', `token ${token}`);
  xhr.setRequestHeader('Accept', 'application/vnd.github.v3+json');
  xhr.send();
};

const unlinkRepo = () => {
  /* Set mode type to hook */
  chrome.storage.local.set({ mode_type: 'hook' }, () => {
    console.log(`Unlinking repo`);
  });
  /* Set Repo Hook to NONE */
  chrome.storage.local.set({ leethub_hook: null }, () => {
    console.log('Setting repo hook to NONE');
  });
  chrome.storage.local.set({ [LEETHUB_BASE_PATH_STORAGE_KEY]: '' }, () => {
    console.log('Cleared repo base path');
  });

  /* Hide accordingly */
  document.getElementById('hook_mode').style.display = 'inherit';
  document.getElementById('commit_mode').style.display = 'none';
};

/* Check for value of select tag, Get Started disabled by default */

$('#type').on('change', function () {
  const valueSelected = this.value;
  if (valueSelected) {
    $('#hook_button').attr('disabled', false);
  } else {
    $('#hook_button').attr('disabled', true);
  }
});

$('#hook_button').on('click', () => {
  /* on click should generate: 1) option 2) repository name */
  if (!option()) {
    $('#error').text(
      t(
        'noOptionSelected',
        undefined,
        'Choose whether to create a new repository or link an existing one.',
      ),
    );
    $('#error').show();
  } else if (!repositoryName()) {
    $('#error').text(t('noRepositoryName', undefined, 'Enter a repository name.'));
    $('#name').focus();
    $('#error').show();
  } else {
    $('#error').hide();
    $('#success').text(
      t('attemptingRepositorySetup', undefined, 'Setting up the repository... Please wait.'),
    );
    $('#success').show();

    /*
      Perform processing
      - step 1: Check if current stage === hook.
      - step 2: store repo name as repoName in chrome storage.
      - step 3: if (1), POST request to repoName (iff option = create new repo) ; else display error message.
      - step 4: if proceed from 3, hide hook_mode and display commit_mode (show stats e.g: files pushed/questions-solved/leaderboard)
    */
    chrome.storage.local.get('leethub_token', async data => {
      const token = data.leethub_token;
      if (token === null || token === undefined) {
        /* Not authorized yet. */
        $('#error').text(
          t(
            'authorizationRequired',
            undefined,
            'Authorize LeetHub-Neo to access your GitHub account before continuing.',
          ),
        );
        $('#error').show();
        $('#success').hide();
      } else {
        await saveSelectedTemplateLanguage();
        await saveSelectedTranslationLanguage();
        await saveSelectedInitialSyncOption();
        await saveSelectedRepositoryBasePath();

        if (option() === 'new') {
          createRepo(token, repositoryName());
        } else {
          chrome.storage.local.get('leethub_username', data2 => {
            const username = data2.leethub_username;
            if (!username) {
              /* Improper authorization. */
              $('#error').text(
                t(
                  'authorizationInvalid',
                  undefined,
                  'GitHub authorization is incomplete. Authorize LeetHub-Neo again.',
                ),
              );
              $('#error').show();
              $('#success').hide();
            } else {
              linkRepo(token, `${username}/${repositoryName()}`);
            }
          });
        }
      }
    });
  }
});

$('#unlink a').on('click', () => {
  unlinkRepo();
  $('#unlink').hide();
  $('#success').text(
    t(
      'repositoryUnlinked',
      undefined,
      'Repository disconnected. Create or link another repository.',
    ),
  );
});

/* Add sync count behavior */
$('#sync_counts').on('click', async () => {
  //Check if linked to repo
  chrome.storage.local.get('leethub_hook', data => {
    const hook = data.leethub_hook;
    if (!hook) {
      $('#error').text(
        t(
          'noRepositoryLinked',
          undefined,
          'Link a repository before synchronizing problem counts.',
        ),
      );
      $('#error').show();
      return;
    } else {
      $('#error').hide();
    }
  });
  //Get stats

  const stats = {};
  stats.solved = 0;
  stats.easy = 0;
  stats.medium = 0;
  stats.hard = 0;
  stats.shas = {};

  //Get problems solved count from linked repo
  const repo = await chrome.storage.local.get('leethub_hook').then(({ leethub_hook }) => {
    if (leethub_hook == null) {
      $('#error').text(
        t(
          'noRepositoryLinked',
          undefined,
          'Link a repository before synchronizing problem counts.',
        ),
      );
      $('#error').show();
      return;
    } else {
      $('#error').hide();
    }
    return leethub_hook;
  });

  //Get token from storage
  const token = await chrome.storage.local.get('leethub_token').then(({ leethub_token }) => {
    if (leethub_token == null) {
      $('#error').text(
        t('noTokenFound', undefined, 'Authorize LeetHub-Neo to access your GitHub account.'),
      );
      $('#error').show();
      return;
    } else {
      $('#error').hide();
    }
    return leethub_token;
  });

  // Fetch repository data using GitHub API
  const fetchRepoData = async () => {
    const MEDIUM = 'medium';
    const HARD = 'hard';
    const EASY = 'easy';
    const basePath = selectedRepositoryBasePath();
    const contentsPath = basePath ? `/${basePath}` : '';
    try {
      const response = await fetch(`https://api.github.com/repos/${repo}/contents${contentsPath}`, {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch repository data: ${response.statusText}`);
      }

      const repoContents = await response.json();

      const extractReadmeContent = async contents => {
        const promises = contents.map(async item => {
          try {
            if (item.name.toLowerCase() === 'readme.md') {
              const { content } = await fetchFileContent(repo, item.path, token, item.type);
              const difficulty = content.split('<h3>')[1]?.split('</h3>')[0]?.trim();
              console.debug(`Difficulty for ${item.path}: ${difficulty}`);
              if (difficulty) {
                if (difficulty.toLowerCase() === EASY) {
                  stats.easy += 1;
                } else if (difficulty.toLowerCase() === MEDIUM) {
                  stats.medium += 1;
                } else if (difficulty.toLowerCase() === HARD) {
                  stats.hard += 1;
                }
                stats.solved += 1;
              }
              return { path: item.path, difficulty };
            } else if (item.type === 'dir') {
              const { content: subContents } = await fetchFileContent(
                repo,
                item.path,
                token,
                item.type,
              );
              console.debug(`Processing subdirectory: ${item.path}`);
              // Recursively process subdirectories
              return extractReadmeContent(subContents);
            }
          } catch (error) {
            console.error(`Error processing ${item.path}: ${error.message}`);
            return null;
          }
        });

        // Wait for all promises to resolve concurrently
        return Promise.all(promises);
      };

      await extractReadmeContent(repoContents);

      // Update the stats in local storage
      chrome.storage.local.set({ stats }, () => {
        $('#p_solved').text(stats.solved);
        $('#p_solved_easy').text(stats.easy);
        $('#p_solved_medium').text(stats.medium);
        $('#p_solved_hard').text(stats.hard);
      });
    } catch (error) {
      console.error(error.message);
      $('#error')
        .text(
          t(
            'fetchRepositoryFailed',
            undefined,
            'Failed to fetch repository data. Please try again.',
          ),
        )
        .show();
    }
  };

  fetchRepoData();
});

const fetchFileContent = async (repo, path, token, itemType) => {
  try {
    const response = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    // Content is Base64 encoded
    return {
      content: itemType !== 'dir' ? atob(data.content) /* Decode base64*/ : data,
      sha: data.sha,
    };
  } catch (error) {
    console.error(`Failed to fetch file content: ${error.message}`);
    throw error;
  }
};

/* Detect mode type */
chrome.storage.local.get('mode_type', data => {
  const mode = data.mode_type;

  if (mode && mode === 'commit') {
    /* Check if still access to repo */
    chrome.storage.local.get('leethub_token', data2 => {
      const token = data2.leethub_token;
      if (token === null || token === undefined) {
        /* Not authorized yet. */
        $('#error').text(
          t(
            'authorizationRequired',
            undefined,
            'Authorize LeetHub-Neo to access your GitHub account before continuing.',
          ),
        );
        $('#error').show();
        $('#success').hide();
        /* Hide accordingly */
        document.getElementById('hook_mode').style.display = 'inherit';
        document.getElementById('commit_mode').style.display = 'none';
      } else {
        /* Get access to repo */
        chrome.storage.local.get('leethub_hook', repoName => {
          const hook = repoName.leethub_hook;
          if (!hook) {
            /* Not authorized yet. */
            $('#error').text(
              t(
                'authorizationInvalid',
                undefined,
                'GitHub authorization is incomplete. Authorize LeetHub-Neo again.',
              ),
            );
            $('#error').show();
            $('#success').hide();
            /* Hide accordingly */
            document.getElementById('hook_mode').style.display = 'inherit';
            document.getElementById('commit_mode').style.display = 'none';
          } else {
            /* Username exists, at least in storage. Confirm this */
            linkRepo(token, hook);
          }
        });
      }
    });

    document.getElementById('hook_mode').style.display = 'none';
    document.getElementById('commit_mode').style.display = 'inherit';
  } else {
    document.getElementById('hook_mode').style.display = 'inherit';
    document.getElementById('commit_mode').style.display = 'none';
  }
});
