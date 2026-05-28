/* Helper function to get the current LeetCode base URL */
function getLeetCodeBaseUrl() {
  const hostname = window.location.hostname;
  return `https://${hostname.includes('leetcode.cn') ? 'leetcode.cn' : 'leetcode.com'}`;
}

const repositoryFiles = globalThis.LeetHubRepositoryFiles;
const rootReadmeTemplate = globalThis.LeetHubRootReadmeTemplate;
const languages = globalThis.LeetHubLeetCodeLanguages.LEETCODE_LANGUAGE_EXTENSIONS;
const scratchpadMemo = globalThis.LeetHubScratchpadMemo;
const readmeFilename = repositoryFiles.ROOT_README_FILENAME;
const defaultRepoReadme = rootReadmeTemplate.DEFAULT_ROOT_README;
const topicIndexUtils = globalThis.LeetHubTopicIndexUtils;
const leetCodeAccountUtils = globalThis.LeetHubLeetCodeAccountUtils;

// SubFolder
const basePath = '';
const rootReadmeSummaryCommitMessage = rootReadmeTemplate.ROOT_README_SUMMARY_COMMIT_MESSAGE;
let solutionLookupTreePromise = null;

function encodeContent(content) {
  return btoa(unescape(encodeURIComponent(content)));
}

function decodeContent(content) {
  return decodeURIComponent(escape(atob(content)));
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getPathFilename(path) {
  return (
    String(path ?? '')
      .split('/')
      .pop() || ''
  );
}

function requestScratchpadContentForUpload() {
  return new Promise(resolve => {
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve('');
      }
    }, 300);

    chrome.runtime.sendMessage({ action: 'getScratchpadContentForUpload' }, response => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timer);

      if (chrome.runtime.lastError || !response?.ok) {
        resolve('');
        return;
      }

      resolve(String(response.content ?? ''));
    });
  });
}

async function formatScratchpadMemoForUpload() {
  const scratchpadText = await requestScratchpadContentForUpload();

  return scratchpadMemo?.formatScratchpadMemo
    ? scratchpadMemo.formatScratchpadMemo(scratchpadText)
    : '';
}

async function uploadScratchpadMemoIfAny(problemName) {
  const memoContent = await formatScratchpadMemoForUpload();

  if (!memoContent) {
    return undefined;
  }

  return uploadGit(
    encodeContent(memoContent),
    problemName,
    repositoryFiles.SCRATCHPAD_MEMO_FILENAME,
    `Attach memo : ${problemName}`,
    'upload',
    false,
  );
}

/* Difficulty of most recenty submitted question */
let difficulty = '';
/* Difficulty of most recenty submitted question */
let last_language = '';

/* state of upload for progress */
let uploadState = { uploading: false };

/* returns today's date in MM-DD-YYYY format */
function getTodaysDate() {
  const today = new Date();
  const month = today.getMonth() + 1; // fix months are zero-indexed
  const day = today.getDate();
  const year = today.getFullYear();

  const formattedMonth = month < 10 ? '0' + month : month;
  const formattedDay = day < 10 ? '0' + day : day;

  return `${formattedMonth}-${formattedDay}-${year}`;
}

/* returns time in hh-mm-ss format */
function getTime() {
  const today = new Date();
  const hours = today.getHours();
  const minutes = today.getMinutes();
  const seconds = today.getSeconds();

  const formattedHours = hours < 10 ? '0' + hours : hours;
  const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
  const formattedSeconds = seconds < 10 ? '0' + seconds : seconds;

  return `${formattedHours}-${formattedMinutes}-${formattedSeconds}`;
}

const SUBMISSION_LIST_QUERY = `
query Submissions($offset: Int!, $limit: Int!, $lastKey: String, $questionSlug: String) {
  submissionList(
    offset: $offset
    limit: $limit
    lastKey: $lastKey
    questionSlug: $questionSlug
  ) {
    lastKey
    hasNext
    submissions {
      id
      title
      titleSlug
      statusDisplay
      lang
      runtime
      memory
      timestamp
      url
    }
  }
}`;

const RECENT_ACCEPTED_SUBMISSIONS_QUERY = `
query recentAcSubmissions($username: String!, $limit: Int!) {
  matchedUser(username: $username) {
    submitStatsGlobal {
      acSubmissionNum {
        difficulty
        count
        submissions
      }
    }
  }
  recentAcSubmissionList(username: $username, limit: $limit) {
    id
    title
    titleSlug
    timestamp
  }
}`;

const QUESTION_DETAIL_QUERY = `
query questionDetail($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    title
    titleSlug
    questionId
    questionFrontendId
    questionTitle
    translatedTitle
    content
    translatedContent
    categoryTitle
    difficulty
    stats
    topicTags {
      name
      slug
      translatedName
    }
  }
}`;

const CURRENT_USER_QUERY = `
query globalData {
  userStatus {
    isSignedIn
    username
  }
}`;

async function fetchLeetCodeGraphQL(query, variables, operationName) {
  const response = await fetch(`${getLeetCodeBaseUrl()}/graphql/`, {
    method: 'POST',
    headers: {
      cookie: document.cookie,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
      operationName,
    }),
  });

  if (!response.ok) {
    throw new Error(`LeetCode GraphQL request failed: ${response.status}`);
  }

  const payload = await response.json();
  if (payload.errors?.length) {
    throw new Error(payload.errors.map(error => error.message).join('; '));
  }

  return payload.data;
}

function getLeetCodeAccountSite() {
  return getLeetCodeBaseUrl().includes('leetcode.cn') ? 'leetcode.cn' : 'leetcode.com';
}

async function fetchCurrentLeetCodeAccount() {
  const site = getLeetCodeAccountSite();
  const data = await fetchLeetCodeGraphQL(CURRENT_USER_QUERY, {}, 'globalData');
  const userStatus = data?.userStatus;

  return {
    site,
    username: userStatus?.isSignedIn ? userStatus.username : '',
  };
}

async function saveLeetCodeAccountForHook({ hook, site, username }) {
  const storageKey = leetCodeAccountUtils.LEETCODE_ACCOUNT_BY_HOOK_STORAGE_KEY;
  const values = await chrome.storage.local.get(storageKey);
  const accountByHook = leetCodeAccountUtils.updateStoredLeetCodeAccount(
    values[storageKey],
    hook,
    site,
    username,
    new Date().toISOString(),
  );

  await chrome.storage.local.set({ [storageKey]: accountByHook });
}

async function ensureLeetCodeAccountCanSync({ confirmMismatch = true } = {}) {
  if (!leetCodeAccountUtils) {
    throw new Error('LeetCode account guard is not available.');
  }

  const { leethub_hook: hook } = await chrome.storage.local.get('leethub_hook');

  if (!hook) {
    throw new Error('No GitHub repository is linked to LeetHub-Neo.');
  }

  const currentAccount = await fetchCurrentLeetCodeAccount();
  const storageKey = leetCodeAccountUtils.LEETCODE_ACCOUNT_BY_HOOK_STORAGE_KEY;
  const values = await chrome.storage.local.get(storageKey);
  const storedAccount = leetCodeAccountUtils.getStoredLeetCodeAccount(
    values[storageKey],
    hook,
    currentAccount.site,
  );
  const decision = leetCodeAccountUtils.createLeetCodeAccountSyncDecision({
    storedUsername: storedAccount?.username,
    currentUsername: currentAccount.username,
    site: currentAccount.site,
  });

  if (decision.shouldConfirm) {
    const shouldContinue = confirmMismatch && window.confirm(decision.confirmMessage);

    if (!shouldContinue) {
      throw new Error(decision.errorMessage);
    }
  } else if (!decision.canSync) {
    throw new Error(decision.errorMessage);
  }

  if (decision.shouldStore) {
    await saveLeetCodeAccountForHook({
      hook,
      site: currentAccount.site,
      username: currentAccount.username,
    });
  }

  return {
    ...currentAccount,
    status: decision.status,
  };
}

const PROFILE_ACCEPTED_SUBMISSIONS_LIMIT = 5000;

function normalizeRecentAcceptedSubmission(submission) {
  return {
    ...submission,
    statusDisplay: 'Accepted',
  };
}

async function fetchProfileAcceptedSubmissions({ username, limit = 50 } = {}) {
  if (!username) {
    throw new Error('LeetCode username is required to fetch accepted submissions.');
  }

  const data = await fetchLeetCodeGraphQL(
    RECENT_ACCEPTED_SUBMISSIONS_QUERY,
    {
      username,
      limit: Math.max(limit, PROFILE_ACCEPTED_SUBMISSIONS_LIMIT),
    },
    'recentAcSubmissions',
  );
  const submissions = data?.recentAcSubmissionList;

  if (!Array.isArray(submissions)) {
    throw new Error('LeetCode response did not include recentAcSubmissionList');
  }

  return submissions.map(normalizeRecentAcceptedSubmission);
}

async function fetchSubmissionListAcceptedSubmissions({
  limit = 50,
  offset = 0,
  maxPages = null,
  questionSlug = undefined,
} = {}) {
  const acceptedSubmissions = [];
  let currentOffset = offset;
  let lastKey = null;
  let hasNext = true;
  let pagesFetched = 0;

  while (hasNext && (maxPages == null || pagesFetched < maxPages)) {
    const data = await fetchLeetCodeGraphQL(
      SUBMISSION_LIST_QUERY,
      {
        offset: currentOffset,
        limit,
        lastKey,
        questionSlug,
      },
      'Submissions',
    );
    const submissionList = data?.submissionList;

    if (!submissionList) {
      throw new Error('LeetCode response did not include submissionList');
    }

    acceptedSubmissions.push(
      ...submissionList.submissions.filter(submission => submission.statusDisplay === 'Accepted'),
    );

    hasNext = Boolean(submissionList.hasNext);
    lastKey = submissionList.lastKey;
    currentOffset += limit;
    pagesFetched += 1;
  }

  console.table(
    acceptedSubmissions.map(submission => ({
      id: submission.id,
      title: submission.title,
      titleSlug: submission.titleSlug,
      lang: submission.lang,
      timestamp: submission.timestamp,
    })),
  );
  console.info('[LeetHub-Neo] Accepted submissions fetched:', acceptedSubmissions);

  return acceptedSubmissions;
}

async function fetchAcceptedSubmissions(options = {}) {
  const { username } = options;

  if (options.questionSlug) {
    return fetchSubmissionListAcceptedSubmissions(options);
  }

  const account = username
    ? { username, site: getLeetCodeAccountSite() }
    : await fetchCurrentLeetCodeAccount();

  if (account.site !== 'leetcode.cn' && account.username) {
    try {
      const acceptedSubmissions = await fetchProfileAcceptedSubmissions({
        ...options,
        username: account.username,
      });

      console.table(
        acceptedSubmissions.map(submission => ({
          id: submission.id,
          title: submission.title,
          titleSlug: submission.titleSlug,
          timestamp: submission.timestamp,
        })),
      );
      console.info('[LeetHub-Neo] Profile accepted submissions fetched:', acceptedSubmissions);

      return acceptedSubmissions;
    } catch (error) {
      console.warn(
        `[LeetHub-Neo] Profile accepted submissions failed, falling back to submissionList: ${error.message}`,
      );
    }
  }

  return fetchSubmissionListAcceptedSubmissions(options);
}

async function fetchSubmissionDetailsById(submissionId) {
  const isCN = getLeetCodeBaseUrl() === 'https://leetcode.cn';
  const submissionDetailsQuery = {
    query: isCN
      ? `
query submissionDetails($submissionId: ID!) {
  submissionDetail(submissionId: $submissionId) {
    code
    timestamp
    statusDisplay
    isMine
    lang
    langVerboseName
    runtimeDisplay: runtime
    memoryDisplay: memory
    memory: rawMemory
    runtimePercentile
    memoryPercentile
    question {
      questionId
      titleSlug
      hasFrontendPreview
    }
    user {
      realName
      userAvatar
      userSlug
    }
    passedTestCaseCnt
    totalTestCaseCnt
    ... on GeneralSubmissionNode {
      outputDetail {
        codeOutput
        expectedOutput
        input
        compileError
        runtimeError
        lastTestcase
      }
    }
  }
}`
      : '\n    query submissionDetails($submissionId: Int!) {\n  submissionDetails(submissionId: $submissionId) {\n    runtime\n    runtimeDisplay\n    runtimePercentile\n    runtimeDistribution\n    memory\n    memoryDisplay\n    memoryPercentile\n    memoryDistribution\n    code\n    timestamp\n    statusCode\n    lang {\n      name\n      verboseName\n    }\n    question {\n      questionId\n    questionFrontendId\n    title\n    titleSlug\n    content\n    difficulty\n    }\n    notes\n    topicTags {\n      tagId\n      slug\n      name\n    }\n    runtimeError\n  }\n}\n    ',
    variables: { submissionId },
    operationName: 'submissionDetails',
  };
  const data = await fetchLeetCodeGraphQL(
    submissionDetailsQuery.query,
    submissionDetailsQuery.variables,
    submissionDetailsQuery.operationName,
  );
  const submissionDetails = isCN ? data.submissionDetail : data.submissionDetails;

  console.info('[LeetHub-Neo] Submission details fetched:', submissionDetails);
  if (submissionDetails?.code) {
    console.info('[LeetHub-Neo] Submission code preview:\n', submissionDetails.code);
  }

  return submissionDetails;
}

async function fetchQuestionDetailsBySlug(titleSlug) {
  if (!titleSlug) {
    return null;
  }

  const data = await fetchLeetCodeGraphQL(QUESTION_DETAIL_QUERY, { titleSlug }, 'questionDetail');
  const questionDetails = data?.question ?? null;

  console.info('[LeetHub-Neo] Question details fetched:', questionDetails);
  return questionDetails;
}

function getLatestAcceptedSubmissionByProblem(submissions) {
  const latestByProblem = new Map();
  const firstAcceptedTimestampByProblem = new Map();

  for (const submission of submissions) {
    const current = latestByProblem.get(submission.titleSlug);
    const firstTimestamp = firstAcceptedTimestampByProblem.get(submission.titleSlug);

    if (!current || Number(submission.timestamp) > Number(current.timestamp)) {
      latestByProblem.set(submission.titleSlug, submission);
    }

    if (firstTimestamp === undefined || Number(submission.timestamp) < Number(firstTimestamp)) {
      firstAcceptedTimestampByProblem.set(submission.titleSlug, submission.timestamp);
    }
  }

  return [...latestByProblem.values()].map(submission => ({
    ...submission,
    firstAcceptedTimestamp: firstAcceptedTimestampByProblem.get(submission.titleSlug),
  }));
}

function hasTopicTags(topicTags) {
  return topicIndexUtils.normalizeTopicTags(topicTags).length > 0;
}

function shouldFetchQuestionDetailsForSubmission(submissionDetails) {
  const question = submissionDetails?.question ?? {};

  return (
    !hasTopicTags(submissionDetails?.topicTags) ||
    !question.title ||
    !question.content ||
    !question.difficulty ||
    !question.questionFrontendId
  );
}

function mergeQuestionDetails(submissionQuestion = {}, questionDetails = {}) {
  const question = {
    ...questionDetails,
    ...submissionQuestion,
  };

  return {
    ...question,
    title:
      submissionQuestion.title ??
      questionDetails.title ??
      questionDetails.translatedTitle ??
      questionDetails.questionTitle ??
      '',
    content:
      submissionQuestion.content ??
      questionDetails.content ??
      questionDetails.translatedContent ??
      '',
    difficulty: submissionQuestion.difficulty ?? questionDetails.difficulty ?? '',
    questionFrontendId:
      submissionQuestion.questionFrontendId ??
      questionDetails.questionFrontendId ??
      submissionQuestion.questionId ??
      questionDetails.questionId ??
      '',
    questionId: submissionQuestion.questionId ?? questionDetails.questionId ?? '',
    titleSlug: submissionQuestion.titleSlug ?? questionDetails.titleSlug ?? '',
  };
}

async function fetchQuestionDetailsForSubmission(submissionDetails, fallbackTitleSlug) {
  if (!shouldFetchQuestionDetailsForSubmission(submissionDetails)) {
    return null;
  }

  const titleSlug = submissionDetails?.question?.titleSlug ?? fallbackTitleSlug;

  try {
    return await fetchQuestionDetailsBySlug(titleSlug);
  } catch (error) {
    console.log(`Failed to fetch question details for ${titleSlug}: ${error.message}`);
    return null;
  }
}

function createLeetCodeV2FromSubmission(
  submissionDetails,
  questionDetails = null,
  acceptedSubmission = null,
) {
  const leetCode = Object.create(LeetCodeV2.prototype);
  const topicTags = topicIndexUtils.normalizeTopicTags(
    questionDetails?.topicTags,
    submissionDetails.topicTags,
  );
  const question = questionDetails
    ? mergeQuestionDetails(submissionDetails.question, questionDetails)
    : submissionDetails.question;

  leetCode.submissionData = {
    ...submissionDetails,
    question,
    topicTags,
  };
  leetCode.questionDetails = {
    ...(questionDetails ?? {}),
    topicTags,
  };
  leetCode.acceptedSubmission = acceptedSubmission;
  return leetCode;
}

async function uploadLeetCodeV2Submission(leetCode, suffix, { updateSummary = true } = {}) {
  const probStats = leetCode.parseStats();
  if (!probStats) {
    throw new Error('Could not get submission stats');
  }

  const probStatement = leetCode.parseQuestion();
  if (!probStatement) {
    throw new Error('Could not find problem statement');
  }

  const problemName = leetCode.getProblemNameSlug();

  const language = leetCode.getLanguageExtension();
  if (!language) {
    throw new Error('Could not find language');
  }
  last_language = leetCode.getLanguage();

  const updateReadMe = await chrome.storage.local.get('stats').then(({ stats }) => {
    const shaExists =
      stats?.shas?.[problemName]?.[repositoryFiles.PROBLEM_README_FILENAME] !== undefined;

    if (!shaExists) {
      return uploadGit(
        btoa(unescape(encodeURIComponent(probStatement))),
        problemName,
        repositoryFiles.PROBLEM_README_FILENAME,
        `Create readme : ${problemName}`,
        'upload',
        false,
      );
    }
  });

  const notes = leetCode.getNotesIfAny();
  let updateNotes;
  if (notes != undefined && notes.length > 0) {
    updateNotes = uploadGit(
      btoa(unescape(encodeURIComponent(notes))),
      problemName,
      repositoryFiles.NOTES_FILENAME,
      `Attach Notes : ${problemName}`,
      'upload',
      false,
    );
  }
  const updateMemo = uploadScratchpadMemoIfAny(problemName);

  const problemContext = {
    time: `${probStats.time} (${probStats.timePercentile}%)`,
    space: `${probStats.space} (${probStats.spacePercentile}%)`,
    language,
    problemName,
    difficulty,
    date: getTodaysDate(),
    problemTopic: probStats.problemTopic,
  };
  const probStatsCommitMsg = `Time: ${probStats.time} (${probStats.timePercentile}%), Space: ${probStats.space} (${probStats.spacePercentile}%) - LeetHub-Neo`;
  const commitMsg = (await getCustomCommitMessage(problemContext)) || probStatsCommitMsg;

  const { useTimestampFilename = false } = await chrome.storage.local.get('useTimestampFilename');

  let fileName;
  if (useTimestampFilename) {
    const timestamp = `${getTodaysDate()}-${getTime()}`.replace(/[:\s]/g, '--');
    fileName = suffix
      ? `${problemName}${suffix}-${timestamp}${language}`
      : `${problemName}-${timestamp}${language}`;
  } else {
    fileName = suffix ? `${problemName}${suffix}${language}` : `${problemName}${language}`;
  }

  const existingSolutionRecord = await getExistingSolutionRecord(problemName, fileName);
  const alreadyCompleted = Boolean(existingSolutionRecord);
  const updateCode = alreadyCompleted
    ? existingSolutionRecord
    : leetCode.findAndUploadCode(problemName, fileName, commitMsg, 'upload');
  const [solutionRecord] = await Promise.all([updateCode, updateReadMe, updateNotes, updateMemo]);
  const updatedTopics = await safeUpdateTopicIndexesForProblem({
    leetCode,
    problemName,
    language: last_language,
    extension: language,
    solutionRecord,
  });

  if (!alreadyCompleted) {
    await recordSolvedProblemStats(leetCode, problemName, { preserveLegacyCounts: true });
  }

  if (updateSummary) {
    await safeUpdateRootReadmeSummary(updatedTopics);
  }

  return {
    status: alreadyCompleted ? 'skipped' : 'uploaded',
    problemName,
    difficulty,
    ...buildSolvedProblemStatsEntry(leetCode, problemName),
    updatedTopics,
  };
}

async function updateStatsCountsFromSyncedResults(results) {
  const { stats = {} } = await chrome.storage.local.get('stats');
  const nextStats = results.reduce(
    (profileStats, result) => topicIndexUtils.recordSolvedProblemInStats(profileStats, result),
    {
      ...stats,
      problemStats: {},
      shas: stats.shas ?? {},
      solutionPaths: stats.solutionPaths ?? {},
    },
  );

  await chrome.storage.local.set({ stats: nextStats });

  return {
    solved: nextStats.solved,
    easy: nextStats.easy,
    medium: nextStats.medium,
    hard: nextStats.hard,
  };
}

async function syncPreviousAcceptedSubmissions({
  limit = 50,
  maxPages = null,
  onProgress = () => {},
} = {}) {
  if (uploadState.uploading) {
    throw new Error('LeetHub-Neo is already uploading. Please try again later.');
  }

  uploadState.uploading = true;

  try {
    solutionLookupTreePromise = null;
    onProgress('Checking LeetCode account...');
    const currentAccount = await ensureLeetCodeAccountCanSync();
    onProgress('Fetching accepted submissions...');
    const acceptedSubmissions = await fetchAcceptedSubmissions({
      limit,
      maxPages,
      username: currentAccount.username,
    });
    const latestSubmissions = getLatestAcceptedSubmissionByProblem(acceptedSubmissions);
    const results = [];
    let syncedTopics = [];

    for (let index = 0; index < latestSubmissions.length; index += 1) {
      const submission = latestSubmissions[index];
      onProgress(`Syncing ${index + 1}/${latestSubmissions.length}: ${submission.title}`);

      const submissionDetails = await fetchSubmissionDetailsById(submission.id);
      const questionDetails = await fetchQuestionDetailsForSubmission(
        submissionDetails,
        submission.titleSlug,
      );
      const leetCode = createLeetCodeV2FromSubmission(
        submissionDetails,
        questionDetails,
        submission,
      );
      const result = await uploadLeetCodeV2Submission(leetCode, undefined, {
        updateSummary: false,
      });
      syncedTopics = topicIndexUtils.mergeTopicUpdates(syncedTopics, result.updatedTopics);
      results.push(result);
    }

    const uploaded = results.filter(result => result.status === 'uploaded').length;
    const skipped = results.filter(result => result.status === 'skipped').length;
    const counts = await updateStatsCountsFromSyncedResults(results);
    await safeUpdateRootReadmeSummary(syncedTopics);
    onProgress(`Done. Found ${counts.solved} solved problems.`);

    return {
      uploaded,
      skipped,
      counts,
      totalAccepted: acceptedSubmissions.length,
      totalProblems: latestSubmissions.length,
      results,
    };
  } finally {
    uploadState.uploading = false;
  }
}

async function migrateRepositoryStructure({ onProgress = () => {} } = {}) {
  if (uploadState.uploading) {
    throw new Error('LeetHub-Neo is already uploading. Please try again later.');
  }

  uploadState.uploading = true;

  try {
    const { leethub_token: token, leethub_hook: hook } = await chrome.storage.local.get([
      'leethub_token',
      'leethub_hook',
    ]);

    if (!token || !hook) {
      throw new Error('Missing GitHub token or repository hook.');
    }

    onProgress('Scanning repository...');
    const repositoryState = await getRepositoryState(token, hook);
    const topicDocuments = await getTopicProblemsDocuments(
      token,
      hook,
      repositoryState.tree.tree ?? [],
    );

    if (!topicDocuments.length) {
      throw new Error('Run Sync Previous before migrating repository structure.');
    }

    const folderOptions = await getFolderOptions();
    const syncedAt = new Date().toISOString();
    const plan = topicIndexUtils.createRepositoryStructureMigrationPlan({
      treeFiles: repositoryState.tree.tree ?? [],
      topicDocuments,
      folderOptions,
      syncedAt,
    });
    const treeEntries = createMigrationTreeEntries(plan);

    if (!treeEntries.length) {
      return {
        moved: 0,
        updatedTopicIndexes: 0,
        conflicts: plan.conflicts,
        missing: plan.missing,
        status: 'noop',
      };
    }

    onProgress(`Migrating ${plan.moves.length} files...`);
    await commitRepositoryMigration(token, hook, repositoryState, treeEntries);
    solutionLookupTreePromise = null;
    await updateStatsSolutionPathsForMigration(plan.solutionPathUpdates);

    return {
      moved: plan.moves.length,
      updatedTopicIndexes: plan.topicDocuments.length,
      conflicts: plan.conflicts,
      missing: plan.missing,
      status: 'migrated',
    };
  } finally {
    uploadState.uploading = false;
  }
}

window.leetHubFetchAcceptedSubmissions = fetchAcceptedSubmissions;
window.leetHubFetchSubmissionDetails = fetchSubmissionDetailsById;
window.leetHubFetchQuestionDetails = fetchQuestionDetailsBySlug;
window.leetHubSyncPreviousAcceptedSubmissions = syncPreviousAcceptedSubmissions;
window.leetHubMigrateRepositoryStructure = migrateRepositoryStructure;
window.addEventListener('leetHubFetchAcceptedSubmissionsRequest', async event => {
  const { requestId, options } = event.detail ?? {};

  try {
    const submissions = await fetchAcceptedSubmissions(options);
    window.dispatchEvent(
      new CustomEvent('leetHubFetchAcceptedSubmissionsResponse', {
        detail: {
          requestId,
          submissions,
        },
      }),
    );
  } catch (error) {
    window.dispatchEvent(
      new CustomEvent('leetHubFetchAcceptedSubmissionsResponse', {
        detail: {
          requestId,
          error: error.message,
        },
      }),
    );
  }
});
window.addEventListener('leetHubFetchSubmissionDetailsRequest', async event => {
  const { requestId, submissionId } = event.detail ?? {};

  try {
    const submissionDetails = await fetchSubmissionDetailsById(submissionId);
    window.dispatchEvent(
      new CustomEvent('leetHubFetchSubmissionDetailsResponse', {
        detail: {
          requestId,
          submissions: submissionDetails,
        },
      }),
    );
  } catch (error) {
    window.dispatchEvent(
      new CustomEvent('leetHubFetchSubmissionDetailsResponse', {
        detail: {
          requestId,
          error: error.message,
        },
      }),
    );
  }
});
window.addEventListener('leetHubSyncPreviousAcceptedSubmissionsRequest', async event => {
  const { requestId, options } = event.detail ?? {};

  try {
    const result = await syncPreviousAcceptedSubmissions(options);
    window.dispatchEvent(
      new CustomEvent('leetHubSyncPreviousAcceptedSubmissionsResponse', {
        detail: {
          requestId,
          submissions: result,
        },
      }),
    );
  } catch (error) {
    window.dispatchEvent(
      new CustomEvent('leetHubSyncPreviousAcceptedSubmissionsResponse', {
        detail: {
          requestId,
          error: error.message,
        },
      }),
    );
  }
});
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request?.action === 'pingLeetHubNeoContentScript') {
    sendResponse({ ok: true });
    return false;
  }

  if (request?.action === 'syncPreviousAcceptedSubmissions') {
    syncPreviousAcceptedSubmissions()
      .then(result => {
        sendResponse({ ok: true, result });
      })
      .catch(error => {
        sendResponse({ ok: false, error: error.message });
      });

    return true;
  }

  if (request?.action === 'migrateRepositoryStructure') {
    migrateRepositoryStructure()
      .then(result => {
        sendResponse({ ok: true, result });
      })
      .catch(error => {
        sendResponse({ ok: false, error: error.message });
      });

    return true;
  }

  return false;
});
/* returns the corresponding language from language extension */
function getLanguageFromExtension(extension) {
  if (extension === null || extension === undefined) {
    return null;
  }
  const language = Object.keys(languages).find(key => languages[key] === extension);
  console.log(language);
  return language || null;
}

/**
 * Constructs the full GitHub API URL to upload a file to a specific path in the repository.
 *
 * @param {string} hook - GitHub repository path in the format "username/repo".
 * @param {string} basePath - Base folder path where the file will be uploaded (e.g., "algorithm/LeetCode").
 * @param {string} difficulty - Problem difficulty (e.g., "Easy", "Medium", "Hard").
 * @param {string} problem - Problem slug or directory name (e.g., "0001-two-sum").
 * @param {string} filename - Name of the file to upload (e.g., "0001-two-sum.js").
 * @param {boolean} [useDifficultyFolder=true] - Whether to include the difficulty as a subfolder.
 * @param {boolean} useLanguageFolder - Whether to include the language as a subfolder.
 * @returns {string} Full GitHub API URL for the file upload.
 */

function constructGitHubPath(
  hook,
  basePath,
  difficulty,
  problem,
  filename,
  useDifficultyFolder,
  useLanguageFolder = false,
) {
  const path = buildGitHubContentPath({
    basePath,
    difficulty,
    problem,
    filename,
    useDifficultyFolder,
    useLanguageFolder,
  });

  return `https://api.github.com/repos/${hook}/contents/${path}`;
}

function buildGitHubContentPath({
  basePath,
  difficulty,
  problem,
  filename,
  useDifficultyFolder,
  useLanguageFolder = false,
}) {
  return topicIndexUtils.buildRepoPath({
    basePath: problem ? basePath : '',
    difficulty,
    problemName: problem,
    filename,
    language: last_language,
    useDifficultyFolder,
    useLanguageFolder,
  });
}

const parseCustomCommitMessage = (text, problemContext) => {
  return text.replace(/{(\w+)}/g, (match, key) => {
    return Object.prototype.hasOwnProperty.call(problemContext, key) ? problemContext[key] : match;
  });
};

/* returns custom commit message or null if doesn't exist */
const getCustomCommitMessage = problemContext => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get('custom_commit_message', result => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else if (!result.custom_commit_message || !result.custom_commit_message.trim()) {
        resolve(null); // no custom message is set
      } else {
        const finalCommitMessage = parseCustomCommitMessage(
          result.custom_commit_message,
          problemContext,
        );
        resolve(finalCommitMessage);
      }
    });
  });
};

/* Main function for uploading code to GitHub repo, and callback cb is called if success */
const upload = (
  token,
  hook,
  code,
  problem,
  filename,
  sha,
  commitMsg,
  cb = undefined,
  useDifficultyFolder,
  useLanguageFolder,
) => {
  // const URL = `https://api.github.com/repos/${hook}/contents/${problem}/${filename}`;
  const uploadPath = buildGitHubContentPath({
    basePath,
    difficulty,
    problem,
    filename,
    useDifficultyFolder,
    useLanguageFolder,
  });
  const URL = `https://api.github.com/repos/${hook}/contents/${uploadPath}`;

  /* Define Payload */
  let data = {
    message: commitMsg,
    content: code,
    sha,
  };

  data = JSON.stringify(data);

  let options = {
    method: 'PUT',
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
    body: data,
  };
  let updatedSha;

  return fetch(URL, options)
    .then(res => {
      if (res.status === 200 || res.status === 201) {
        return res.json();
      }
      throw new Error(res.status);
    })
    .then(async body => {
      updatedSha = body.content.sha; // get updated SHA.
      const actualPath = body.content.path || uploadPath;
      const stats = await getAndInitializeStats(problem);
      stats.shas[problem][filename] = updatedSha;
      if (isSolutionUpload(filename)) {
        stats.solutionPaths[problem][filename] = actualPath;
      }
      await chrome.storage.local.set({ stats });
      return {
        filename,
        path: actualPath,
        sha: updatedSha,
      };
    })
    .then(uploadResult => {
      console.log(`Successfully committed ${filename} to github`);
      if (cb != undefined) {
        cb();
      }
      return uploadResult;
    });
};

const getAndInitializeStats = problem => {
  return chrome.storage.local.get('stats').then(({ stats }) => {
    if (stats == null || stats == {}) {
      // create stats object
      stats = {};
      stats.solved = 0;
      stats.easy = 0;
      stats.medium = 0;
      stats.hard = 0;
      stats.shas = {};
    }

    if (stats.shas == null) {
      stats.shas = {};
    }

    if (stats.solutionPaths == null) {
      stats.solutionPaths = {};
    }

    if (stats.shas[problem] == null) {
      stats.shas[problem] = {};
    }

    if (stats.solutionPaths[problem] == null) {
      stats.solutionPaths[problem] = {};
    }

    return stats;
  });
};

function isSolutionUpload(filename) {
  return repositoryFiles.isSolutionUpload(filename);
}

function buildSolvedProblemStatsEntry(leetCode, problemName) {
  const topicTags = topicIndexUtils.normalizeTopicTags(
    leetCode.questionDetails?.topicTags,
    leetCode.submissionData?.topicTags,
  );

  return {
    problemName,
    title: leetCode.parseQuestionTitle(),
    slug: leetCode.submissionData?.question?.titleSlug ?? '',
    difficulty,
    solvedAt:
      leetCode.acceptedSubmission?.firstAcceptedTimestamp ??
      leetCode.submissionData?.timestamp ??
      new Date().toISOString(),
    topicTags,
  };
}

async function recordSolvedProblemStats(leetCode, problemName, options = {}) {
  const { stats = {} } = await chrome.storage.local.get('stats');
  const nextStats = topicIndexUtils.recordSolvedProblemInStats(
    stats,
    buildSolvedProblemStatsEntry(leetCode, problemName),
    new Date(),
    options,
  );

  await chrome.storage.local.set({ stats: nextStats });
  return nextStats;
}

async function getExistingSolutionRecord(problemName, filename) {
  const { stats } = await chrome.storage.local.get('stats');
  const path = stats?.solutionPaths?.[problemName]?.[filename];
  const sha = stats?.shas?.[problemName]?.[filename];
  const localRecord =
    sha || path
      ? {
          filename,
          path: path || '',
          sha: sha || '',
        }
      : null;

  const scannedRecord = await findExistingSolutionRecordInRepo(problemName, filename, path);
  if (scannedRecord) {
    await rememberExistingSolutionRecord(problemName, scannedRecord);

    return scannedRecord;
  }

  return localRecord;
}

async function rememberExistingSolutionRecord(problemName, solutionRecord) {
  return rememberExistingProblemFileRecord(problemName, solutionRecord, { trackSolution: true });
}

async function rememberExistingProblemFileRecord(
  problemName,
  fileRecord,
  { trackSolution = false } = {},
) {
  if (!fileRecord?.filename) {
    return null;
  }

  const nextStats = await getAndInitializeStats(problemName);

  if (fileRecord.sha) {
    nextStats.shas[problemName][fileRecord.filename] = fileRecord.sha;
  }

  if (trackSolution && fileRecord.path) {
    nextStats.solutionPaths[problemName][fileRecord.filename] = fileRecord.path;
  }

  await chrome.storage.local.set({ stats: nextStats });
  return nextStats;
}

async function requestGitHubJson(token, url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub request failed: ${response.status}`);
  }

  return response.json();
}

async function getRepositoryState(token, hook) {
  const repo = await requestGitHubJson(token, `https://api.github.com/repos/${hook}`);
  const branchName = repo.default_branch || 'main';
  const ref = await requestGitHubJson(
    token,
    `https://api.github.com/repos/${hook}/git/ref/heads/${branchName}`,
  );
  const commit = await requestGitHubJson(
    token,
    `https://api.github.com/repos/${hook}/git/commits/${ref.object.sha}`,
  );
  const tree = await requestGitHubJson(
    token,
    `https://api.github.com/repos/${hook}/git/trees/${commit.tree.sha}?recursive=1`,
  );

  return {
    branchName,
    commit,
    tree,
  };
}

async function getTopicProblemsDocuments(token, hook, treeFiles) {
  const topicProblemsPathPattern = new RegExp(
    `^${escapeRegExp(repositoryFiles.TOPICS_BASE_PATH)}/[^/]+/${escapeRegExp(
      repositoryFiles.TOPIC_PROBLEMS_FILENAME,
    )}$`,
  );
  const topicProblemFiles = treeFiles
    .filter(file => file.type === 'blob' && topicProblemsPathPattern.test(file.path))
    .sort((a, b) => a.path.localeCompare(b.path));
  const documents = [];

  for (const file of topicProblemFiles) {
    const content = await getGitHubContentByPath(token, hook, file.path);

    if (!content?.content) {
      continue;
    }

    try {
      documents.push({
        path: file.path,
        document: JSON.parse(decodeContent(content.content)),
      });
    } catch (error) {
      console.log(`Skipping invalid topic problems document ${file.path}: ${error.message}`);
    }
  }

  return documents;
}

function createMigrationTreeEntries(plan) {
  const treeEntries = [];

  for (const move of plan.moves) {
    treeEntries.push({
      path: move.targetPath,
      mode: '100644',
      type: 'blob',
      sha: move.sha,
    });
    treeEntries.push({
      path: move.sourcePath,
      mode: '100644',
      type: 'blob',
      sha: null,
    });
  }

  for (const topicDocument of plan.topicDocuments) {
    treeEntries.push({
      path: topicDocument.path,
      mode: '100644',
      type: 'blob',
      content: topicDocument.content,
    });
  }

  return treeEntries;
}

async function commitRepositoryMigration(token, hook, repositoryState, treeEntries) {
  const tree = await requestGitHubJson(token, `https://api.github.com/repos/${hook}/git/trees`, {
    method: 'POST',
    body: JSON.stringify({
      base_tree: repositoryState.commit.tree.sha,
      tree: treeEntries,
    }),
  });
  const commit = await requestGitHubJson(
    token,
    `https://api.github.com/repos/${hook}/git/commits`,
    {
      method: 'POST',
      body: JSON.stringify({
        message: 'Migrate LeetHub repository structure',
        tree: tree.sha,
        parents: [repositoryState.commit.sha],
      }),
    },
  );

  return requestGitHubJson(
    token,
    `https://api.github.com/repos/${hook}/git/refs/heads/${repositoryState.branchName}`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        sha: commit.sha,
      }),
    },
  );
}

async function updateStatsSolutionPathsForMigration(solutionPathUpdates) {
  if (!solutionPathUpdates.length) {
    return null;
  }

  const { stats } = await chrome.storage.local.get('stats');

  if (!stats) {
    return null;
  }

  const nextStats = {
    ...stats,
    solutionPaths: {
      ...(stats.solutionPaths ?? {}),
    },
  };

  for (const update of solutionPathUpdates) {
    nextStats.solutionPaths[update.problemName] = {
      ...(nextStats.solutionPaths[update.problemName] ?? {}),
      [update.filename]: update.path,
    };
  }

  await chrome.storage.local.set({ stats: nextStats });
  return nextStats;
}

async function getRepositoryTreeForSolutionLookup(token, hook) {
  if (!solutionLookupTreePromise) {
    solutionLookupTreePromise = getRepositoryState(token, hook).then(state => state.tree);
  }

  return solutionLookupTreePromise;
}

async function findExistingSolutionRecordInRepo(problemName, filename, preferredPath = '') {
  return findExistingProblemFileRecordInRepo(problemName, filename, preferredPath, {
    allowSolutionFilenameFallback: true,
  });
}

async function findExistingProblemFileRecordInRepo(
  problemName,
  filename,
  preferredPath = '',
  { allowSolutionFilenameFallback = false } = {},
) {
  try {
    const { leethub_token: token, leethub_hook: hook } = await chrome.storage.local.get([
      'leethub_token',
      'leethub_hook',
    ]);

    if (!token || !hook) {
      return null;
    }

    const tree = await getRepositoryTreeForSolutionLookup(token, hook);
    const match = topicIndexUtils.findProblemRepositoryFile({
      treeFiles: tree.tree ?? [],
      problemName,
      filename,
      preferredPath,
      allowSolutionFilenameFallback,
    });

    if (!match) {
      return null;
    }

    return {
      filename: getPathFilename(match.path) || filename,
      path: match.path,
      sha: match.sha || '',
    };
  } catch (error) {
    console.log(`Failed to scan existing repository file for ${problemName}: ${error.message}`);
    return null;
  }
}

/* Main function for updating code on GitHub Repo */
/* Read from existing file on GitHub */
/* Discussion posts prepended at top of README */
/* Future implementations may require appending to bottom of file */
const update = (
  token,
  hook,
  addition,
  problem,
  filename,
  commitMsg,
  shouldPreprendDiscussionPosts,
  cb = undefined,
  useDifficultyFolder,
  useLanguageFolder,
) => {
  let responseSHA;
  return getUpdatedData(token, hook, problem, filename, useDifficultyFolder, useLanguageFolder)
    .then(data => {
      responseSHA = data.sha;
      return decodeURIComponent(escape(atob(data.content)));
    })
    .then(existingContent =>
      shouldPreprendDiscussionPosts
        ? // https://web.archive.org/web/20190623091645/https://monsur.hossa.in/2012/07/20/utf-8-in-javascript.html
          // In order to preserve mutation of the data, we have to encode it, which is usually done in base64.
          // But btoa only accepts ASCII 7 bit chars (0-127) while Javascript uses 16-bit minimum chars (0-65535).
          // EncodeURIComponent converts the Unicode Points UTF-8 bits to hex UTF-8.
          // Unescape converts percent-encoded hex values into regular ASCII (optional; it shrinks string size).
          // btoa converts ASCII to base64.
          btoa(unescape(encodeURIComponent(addition + existingContent)))
        : btoa(unescape(encodeURIComponent(existingContent))),
    )
    .then(newContent =>
      upload(
        token,
        hook,
        newContent,
        problem,
        filename,
        responseSHA,
        commitMsg,
        cb,
        useDifficultyFolder,
        useLanguageFolder,
      ),
    );
};

function uploadGit(
  code,
  problemName,
  fileName,
  commitMsg,
  action,
  shouldPrependDiscussionPosts = false,
  cb = undefined,
  _diff = undefined,
) {
  // Assign difficulty
  if (_diff && _diff !== undefined) {
    difficulty = _diff.trim();
  }

  let token;
  let hook;
  let useDifficultyFolder = false;
  let useLanguageFolder = false;

  return chrome.storage.local
    .get('leethub_token')
    .then(({ leethub_token }) => {
      token = leethub_token;
      if (leethub_token == undefined) {
        throw new Error('leethub token is undefined');
      }
      return chrome.storage.local.get('mode_type');
    })
    .then(({ mode_type }) => {
      if (mode_type !== 'commit') {
        throw new Error('leethub mode is not commit');
      }
      return chrome.storage.local.get('leethub_hook');
    })
    .then(({ leethub_hook }) => {
      hook = leethub_hook;
      if (!hook) {
        throw new Error('leethub hook not defined');
      }
      return chrome.storage.local.get('useDifficultyFolder');
    })
    .then(result => {
      useDifficultyFolder = result.useDifficultyFolder || false;
      return chrome.storage.local.get('useLanguageFolder');
    })
    .then(result => {
      useLanguageFolder = result.useLanguageFolder || false;
      return chrome.storage.local.get('stats');
    })
    .then(async ({ stats }) => {
      if (action === 'upload') {
        /* Get SHA, if it exists */
        let sha = stats?.shas?.[problemName]?.[fileName] ?? '';

        if (!sha) {
          const existingRecord = await findExistingProblemFileRecordInRepo(problemName, fileName);

          if (existingRecord?.sha) {
            sha = existingRecord.sha;
            await rememberExistingProblemFileRecord(problemName, existingRecord, {
              trackSolution: isSolutionUpload(existingRecord.filename),
            });
          }
        }

        return upload(
          token,
          hook,
          code,
          problemName,
          fileName,
          sha,
          commitMsg,
          cb,
          useDifficultyFolder,
          useLanguageFolder,
        );
      } else if (action === 'update') {
        return update(
          token,
          hook,
          code,
          problemName,
          fileName,
          commitMsg,
          shouldPrependDiscussionPosts,
          cb,
          useDifficultyFolder,
          useLanguageFolder,
        );
      }
    })
    .catch(err => {
      if (err.message === '409') {
        return getUpdatedData(
          token,
          hook,
          problemName,
          fileName,
          useDifficultyFolder,
          useLanguageFolder,
        ).then(data => ({
          retryUpload: true,
          sha: data?.sha || '',
        }));
      } else {
        throw err;
      }
    })
    .then(result =>
      result?.retryUpload
        ? upload(
            token,
            hook,
            code,
            problemName,
            fileName,
            result.sha,
            commitMsg,
            cb,
            useDifficultyFolder,
            useLanguageFolder,
          )
        : result,
    );
}

/* Gets updated GitHub data for the specific file in repo in question */
async function getUpdatedData(
  token,
  hook,
  problem,
  filename,
  useDifficultyFolder,
  useLanguageFolder,
) {
  const URL = constructGitHubPath(
    hook,
    basePath,
    difficulty,
    problem,
    filename,
    useDifficultyFolder,
    useLanguageFolder,
  );

  let options = {
    method: 'GET',
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  };

  return fetch(URL, options)
    .then(res => {
      if (res.status === 200 || res.status === 201) {
        return res.json();
      } else {
        console.log(`Fetch failed with status: ${res.status}`);
        return {};
      }
    })
    .catch(err => {
      console.log(`Fetch error: ${err.message}`);
      return {};
    });
}

async function getGitHubContentByPath(token, hook, path) {
  const response = await fetch(`https://api.github.com/repos/${hook}/contents/${path}`, {
    method: 'GET',
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (response.status === 404) {
    return null;
  }

  if (response.status === 200 || response.status === 201) {
    return response.json();
  }

  throw new Error(String(response.status));
}

async function putGitHubContentByPath(token, hook, path, content, message, sha) {
  const payload = {
    message,
    content: encodeContent(content),
  };

  if (sha) {
    payload.sha = sha;
  }

  const response = await fetch(`https://api.github.com/repos/${hook}/contents/${path}`, {
    method: 'PUT',
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
    body: JSON.stringify(payload),
  });

  if (response.status === 200 || response.status === 201) {
    return response.json();
  }

  throw new Error(String(response.status));
}

async function putGeneratedFileWithRetry(token, hook, path, content, message, sha) {
  try {
    return await putGitHubContentByPath(token, hook, path, content, message, sha);
  } catch (error) {
    if (error.message !== '409') {
      throw error;
    }

    const latest = await getGitHubContentByPath(token, hook, path);
    return putGitHubContentByPath(token, hook, path, content, message, latest?.sha);
  }
}

async function ensureTopicReadme(token, hook, topic) {
  const path = topicIndexUtils.buildTopicReadmePath(topic.slug);
  const existing = await getGitHubContentByPath(token, hook, path);

  if (existing) {
    return existing;
  }

  return putGeneratedFileWithRetry(
    token,
    hook,
    path,
    topicIndexUtils.createTopicReadme(topic.name),
    `Create ${topic.name} topic notes`,
  );
}

async function updateTopicProblemsJson(token, hook, topic, problemEntry, syncedAt) {
  const path = topicIndexUtils.buildTopicProblemsPath(topic.slug);
  const existing = await getGitHubContentByPath(token, hook, path);
  let content = topicIndexUtils.mergeProblemIntoTopicProblemsContent(
    existing?.content ? decodeContent(existing.content) : '',
    topic,
    problemEntry,
    syncedAt,
  );
  let response;

  try {
    response = await putGitHubContentByPath(
      token,
      hook,
      path,
      content,
      `Update ${topic.name} topic problems`,
      existing?.sha,
    );
  } catch (error) {
    if (error.message !== '409') {
      throw error;
    }

    const latest = await getGitHubContentByPath(token, hook, path);
    content = topicIndexUtils.mergeProblemIntoTopicProblemsContent(
      latest?.content ? decodeContent(latest.content) : '',
      topic,
      problemEntry,
      syncedAt,
    );
    response = await putGitHubContentByPath(
      token,
      hook,
      path,
      content,
      `Update ${topic.name} topic problems`,
      latest?.sha,
    );
  }

  return {
    document: JSON.parse(content),
    response,
  };
}

function buildTopicProblemEntry({
  leetCode,
  problemName,
  language,
  extension,
  solutionRecord,
  syncedAt,
}) {
  const folderPath = topicIndexUtils.buildProblemFolderPath({
    basePath,
    difficulty,
    problemName,
    language,
    useDifficultyFolder: leetCode.folderOptions.useDifficultyFolder,
    useLanguageFolder: leetCode.folderOptions.useLanguageFolder,
  });
  const readmePath = topicIndexUtils.buildRepoPath({
    basePath,
    difficulty,
    problemName,
    filename: repositoryFiles.PROBLEM_README_FILENAME,
    language,
    useDifficultyFolder: leetCode.folderOptions.useDifficultyFolder,
    useLanguageFolder: leetCode.folderOptions.useLanguageFolder,
  });
  return topicIndexUtils.buildProblemEntry({
    frontendId: leetCode.extractQuestionNumber(),
    title: leetCode.parseQuestionTitle(),
    slug: leetCode.submissionData.question.titleSlug,
    problemName,
    difficulty,
    leetcodeBaseUrl: getLeetCodeBaseUrl(),
    folderPath,
    readmePath,
    language,
    extension,
    solutionPath: solutionRecord?.path ?? '',
    solutionSha: solutionRecord?.sha ?? '',
    solutionFilename: solutionRecord?.filename ?? '',
    syncedAt,
  });
}

async function getFolderOptions() {
  const { useDifficultyFolder = false } = await chrome.storage.local.get('useDifficultyFolder');
  const { useLanguageFolder = false } = await chrome.storage.local.get('useLanguageFolder');

  return {
    useDifficultyFolder,
    useLanguageFolder,
  };
}

async function updateTopicIndexesForProblem({
  leetCode,
  problemName,
  language,
  extension,
  solutionRecord,
}) {
  const topics = topicIndexUtils.normalizeTopicTags(
    leetCode.questionDetails?.topicTags,
    leetCode.submissionData?.topicTags,
  );

  if (!topics.length) {
    return [];
  }

  const { leethub_token, leethub_hook } = await chrome.storage.local.get([
    'leethub_token',
    'leethub_hook',
  ]);

  if (!leethub_token || !leethub_hook) {
    throw new Error('Missing GitHub token or hook for topic index update');
  }

  leetCode.folderOptions = await getFolderOptions();
  const syncedAt = new Date().toISOString();
  const problemEntry = buildTopicProblemEntry({
    leetCode,
    problemName,
    language,
    extension,
    solutionRecord,
    syncedAt,
  });

  const updatedTopics = [];

  for (const topic of topics) {
    try {
      await ensureTopicReadme(leethub_token, leethub_hook, topic);
      const result = await updateTopicProblemsJson(
        leethub_token,
        leethub_hook,
        topic,
        problemEntry,
        syncedAt,
      );
      updatedTopics.push({
        ...topic,
        problemCount: result.document.problems.length,
      });
    } catch (error) {
      console.log(`Failed to update topic ${topic.slug}: ${error.message}`);
    }
  }

  return updatedTopics;
}

async function listTopicDirectories(token, hook) {
  const contents = await getGitHubContentByPath(token, hook, topicIndexUtils.TOPICS_BASE_PATH);

  if (!Array.isArray(contents)) {
    return [];
  }

  return contents
    .filter(item => item.type === 'dir')
    .map(item => ({
      slug: item.name,
      path: item.path,
    }));
}

async function collectTopicSummaries(token, hook, fallbackTopics = []) {
  const summaries = [];
  const topicDirectories = await listTopicDirectories(token, hook);
  const fallbackBySlug = new Map(fallbackTopics.map(topic => [topic.slug, topic]));
  const topicsToRead = topicDirectories.length
    ? topicDirectories.map(topic => fallbackBySlug.get(topic.slug) || topic)
    : fallbackTopics;

  for (const topic of topicsToRead) {
    try {
      const path = topicIndexUtils.buildTopicProblemsPath(topic.slug);
      const data = await getGitHubContentByPath(token, hook, path);
      const document = data?.content ? JSON.parse(decodeContent(data.content)) : null;
      summaries.push({
        slug: document?.topic?.slug || topic.slug,
        name: document?.topic?.name || topic.name || topic.slug,
        problemCount: Array.isArray(document?.problems)
          ? document.problems.length
          : topic.problemCount || 0,
      });
    } catch (error) {
      console.log(`Failed to collect topic summary for ${topic.slug}: ${error.message}`);
      summaries.push({
        slug: topic.slug,
        name: topic.name || topic.slug,
        problemCount: topic.problemCount || 0,
      });
    }
  }

  return summaries;
}

async function updateRootReadmeSummary(updatedTopics = []) {
  const { leethub_token, leethub_hook, stats } = await chrome.storage.local.get([
    'leethub_token',
    'leethub_hook',
    'stats',
  ]);

  if (!leethub_token || !leethub_hook) {
    throw new Error('Missing GitHub token or hook for root README summary update');
  }

  let readme = defaultRepoReadme;
  let sha;
  const existing = await getGitHubContentByPath(leethub_token, leethub_hook, readmeFilename);

  if (existing?.content) {
    readme = decodeContent(existing.content);
    sha = existing.sha;
  }

  const topicSummaries = await collectTopicSummaries(leethub_token, leethub_hook, updatedTopics);
  const summary = topicIndexUtils.renderRootReadmeSummary({
    stats: stats || {},
    topics: topicSummaries,
  });
  const nextReadme = topicIndexUtils.replaceGeneratedSection(readme, summary);

  return putGeneratedFileWithRetry(
    leethub_token,
    leethub_hook,
    readmeFilename,
    nextReadme,
    rootReadmeSummaryCommitMessage,
    sha,
  );
}

async function safeUpdateTopicIndexesForProblem(options) {
  try {
    return await updateTopicIndexesForProblem(options);
  } catch (error) {
    console.log(`Failed to update topic indexes: ${error.message}`);
    return [];
  }
}

async function safeUpdateRootReadmeSummary(updatedTopics = []) {
  try {
    return await updateRootReadmeSummary(updatedTopics);
  } catch (error) {
    console.log(`Failed to update root README summary: ${error.message}`);
    return null;
  }
}

/* Checks if an elem/array exists and has length */
function checkElem(elem) {
  return elem && elem.length > 0;
}

function convertToSlug(string) {
  const a = 'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;';
  const b = 'aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------';
  const p = new RegExp(a.split('').join('|'), 'g');

  return string
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w-]+/g, '') // Remove all non-word characters
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

function addLeadingZeros(title) {
  const maxTitlePrefixLength = 4;
  var len = title.split('-')[0].length;
  if (len < maxTitlePrefixLength) {
    return '0'.repeat(4 - len) + title;
  }
  return title;
}

function formatStats(time, timePercentile, space, spacePercentile) {
  return `Time: ${time} (${timePercentile}%), Space: ${space} (${spacePercentile}%) - LeetHub-Neo`;
}

function getGitIcon() {
  // Create an SVG element
  var gitSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  gitSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  gitSvg.setAttribute('width', '24');
  gitSvg.setAttribute('height', '24');
  gitSvg.setAttribute('viewBox', '0 0 114.8625 114.8625');

  // Create a path element inside the SVG
  var gitPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  gitPath.setAttribute('fill', '#100f0d');
  gitPath.setAttribute(
    'd',
    'm112.693375 52.3185-50.149-50.146875c-2.886625-2.88875-7.57075-2.88875-10.461375 0l-10.412625 10.4145 13.2095 13.2095C57.94975 24.759 61.47025 25.45475 63.9165 27.9015c2.461 2.462 3.150875 6.01275 2.087375 9.09375l12.732 12.7305c3.081-1.062 6.63325-.3755 9.09425 2.088875 3.4375 3.4365 3.4375 9.007375 0 12.44675-3.44 3.4395-9.00975 3.4395-12.45125 0-2.585375-2.587875-3.225125-6.387125-1.914-9.57275l-11.875-11.874V74.06075c.837375.415 1.628375.96775 2.326625 1.664 3.4375 3.437125 3.4375 9.007375 0 12.44975-3.4375 3.436-9.01125 3.436-12.44625 0-3.4375-3.442375-3.4375-9.012625 0-12.44975.849625-.848625 1.8335-1.490625 2.88325-1.920375V42.26925c-1.04975-.42975-2.03125-1.066375-2.88325-1.920875-2.6035-2.602625-3.23-6.424375-1.894625-9.622125L36.55325 17.701875 2.1660125 52.086125c-2.88818 2.891125-2.88818 7.57525 0 10.463875l50.1513625 50.146975c2.88725 2.88818125 7.569875 2.88818125 10.461375 0l49.914625-49.9146c2.889625-2.889125 2.889625-7.575625 0-10.463875',
  );

  gitSvg.appendChild(gitPath);
  return gitSvg;
}

function getToolTip() {
  var toolTip = document.createElement('div');
  toolTip.id = 'toolTip';
  toolTip.className = 'hidden';

  chrome.storage.local.get('dontShowToolTip').then(({ dontShowToolTip }) => {
    if (dontShowToolTip) {
      return toolTip;
    } else {
      toolTip.textContent =
        'You may select from earlier submissions to push. \r\n\r\n You may maintain multiple versions by adding a suffix with a right-click.';
      toolTip.className =
        'fixed bg-sd-popover text-sd-popover-foreground rounded-sd-md z-modal text-xs text-left font-normal whitespace-pre-line shadow w-48 p-2 border-sd-border border cursor-default translate-y-20 transition-opacity opacity-0 duration-300 group-hover:opacity-100';
      toolTip.appendChild(getDontShowContainer());
      toolTip.addEventListener('click', event => event.stopPropagation());
    }
  });
  return toolTip;
}

function getDontShowContainer() {
  var dontShowContainer = document.createElement('div');
  dontShowContainer.className = 'flex item-center justify-center gap-1 mt-2';

  var lable = document.createElement('label');
  lable.htmlFor = 'dontShowCheckBox';
  lable.textContent = 'dont show it again';

  var checkBox = document.createElement('input');
  checkBox.type = 'checkbox';
  checkBox.id = 'dontShowCheckBox';
  checkBox.addEventListener('click', function (event) {
    event.stopPropagation();
    if (this.checked) {
      chrome.storage.local.set({ dontShowToolTip: true });
      document.getElementById('toolTip').className = document
        .getElementById('toolTip')
        .className.replace('group-hover:opacity-100', '');
    }
  });

  dontShowContainer.appendChild(checkBox);
  dontShowContainer.appendChild(lable);
  return dontShowContainer;
}

/* Discussion Link - When a user makes a new post, the link is prepended to the README for that problem.*/
document.addEventListener('click', event => {
  const element = event.target;
  const oldPath = window.location.pathname;

  /* Act on Post button click */
  /* Complex since "New" button shares many of the same properties as "Post button */
  if (
    element.classList.contains('icon__3Su4') ||
    (element.parentElement != null &&
      (element.parentElement.classList.contains('icon__3Su4') ||
        element.parentElement.classList.contains('btn-content-container__214G') ||
        element.parentElement.classList.contains('header-right__2UzF')))
  ) {
    setTimeout(function () {
      /* Only post if post button was clicked and url changed */
      if (
        oldPath !== window.location.pathname &&
        oldPath === window.location.pathname.substring(0, oldPath.length) &&
        !Number.isNaN(window.location.pathname.charAt(oldPath.length))
      ) {
        const date = new Date();
        const currentDate = `${date.getDate()}/${date.getMonth()}/${date.getFullYear()} at ${date.getHours()}:${date.getMinutes()}`;
        const addition = `[Discussion Post (created on ${currentDate})](${window.location})  \n`;
        const problemName = window.location.pathname.split('/')[2]; // must be true.

        uploadGit(
          addition,
          problemName,
          repositoryFiles.PROBLEM_README_FILENAME,
          `Prepend discussion post: ${problemName}`,
          'update',
          true,
        );
      }
    }, 1000);
  }
});

function LeetCodeV1() {
  this.progressSpinnerElementId = 'leethub_progress_elem';
  this.progressSpinnerElementClass = 'leethub_progress';
  this.injectSpinnerStyle();
}
LeetCodeV1.prototype.init = async function () {};
/* Function for finding and parsing the full code. */
/* - At first find the submission details url. */
/* - Then send a request for the details page. */
/* - Parse the code from the html reponse. */
/* - Parse the stats from the html response (explore section) */
LeetCodeV1.prototype.findAndUploadCode = function (
  problemName,
  fileName,
  commitMsg,
  action,
  cb = undefined,
) {
  /* Get the submission details url from the submission page. */
  let submissionURL;
  const e = document.getElementsByClassName('status-column__3SUg');
  if (checkElem(e)) {
    // for normal problem submisson
    const submissionRef = e[1].innerHTML.split(' ')[1];
    submissionURL = getLeetCodeBaseUrl() + submissionRef.split('=')[1].slice(1, -1);
  } else {
    // for a submission in explore section
    const submissionRef = document.getElementById('result-state');
    submissionURL = submissionRef.href;
  }

  if (submissionURL == undefined) {
    return;
  }
  /* Request for the submission details page */
  return fetch(submissionURL)
    .then(res => {
      if (res.status == 200) {
        return res.text();
      } else {
        throw new Error('' + res.status);
      }
    })
    .then(async responseText => {
      const doc = new DOMParser().parseFromString(responseText, 'text/html');
      /* the response has a js object called pageData. */
      /* Pagedata has the details data with code about that submission */
      const scripts = doc.getElementsByTagName('script');
      for (let i = 0; i < scripts.length; i++) {
        const text = scripts[i].innerText;
        if (text.includes('pageData')) {
          /* Extract the full code */
          const firstIndex = text.indexOf('submissionCode');
          const lastIndex = text.indexOf('editCodeUrl');
          let slicedText = text.slice(firstIndex, lastIndex);
          /* slicedText has form "submissionCode: 'Details code'" */
          /* Find the index of first and last single inverted coma. */
          const firstInverted = slicedText.indexOf("'");
          const lastInverted = slicedText.lastIndexOf("'");
          /* Extract only the code */
          const codeUnicoded = slicedText.slice(firstInverted + 1, lastInverted);
          /* The code has some unicode. Replacing all unicode with actual characters */
          const code = codeUnicoded.replace(/\\u[\dA-F]{4}/gi, function (match) {
            return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
          });

          /* For a submission in explore section we do not get probStat beforehand.
            So, parse statistics from submisson page */
          if (!commitMsg) {
            slicedText = text.slice(text.indexOf('runtime'), text.indexOf('memory'));
            const resultRuntime = slicedText.slice(
              slicedText.indexOf("'") + 1,
              slicedText.lastIndexOf("'"),
            );
            slicedText = text.slice(text.indexOf('memory'), text.indexOf('total_correct'));
            const resultMemory = slicedText.slice(
              slicedText.indexOf("'") + 1,
              slicedText.lastIndexOf("'"),
            );
            commitMsg = `Time: ${resultRuntime}, Memory: ${resultMemory} - LeetHub-Neo`;
          }
          if (code != null) {
            return uploadGit(
              btoa(unescape(encodeURIComponent(code))),
              problemName,
              fileName,
              commitMsg,
              action,
              false,
              cb,
            );
          }
        }
      }
    });
};
// Returns the language extension
LeetCodeV1.prototype.getLanguageExtension = function () {
  const tag = [
    ...document.getElementsByClassName('ant-select-selection-selected-value'),
    ...document.getElementsByClassName('Select-value-label'),
  ];
  if (tag && tag.length > 0) {
    for (let i = 0; i < tag.length; i += 1) {
      const elem = tag[i].textContent;
      if (elem !== undefined && languages[elem] !== undefined) {
        return languages[elem];
      }
    }
  }
  return null;
};
LeetCodeV1.prototype.getLanguage = function () {
  const tag = [
    ...document.getElementsByClassName('ant-select-selection-selected-value'),
    ...document.getElementsByClassName('Select-value-label'),
  ];
  if (tag && tag.length > 0) {
    for (let i = 0; i < tag.length; i += 1) {
      const elem = tag[i].textContent;
      if (elem !== undefined && languages[elem] !== undefined) {
        return elem;
      }
    }
  }
  return '';
};
/* function to get the notes if there is any
 the note should be opened atleast once for this to work
 this is because the dom is populated after data is fetched by opening the note */
LeetCodeV1.prototype.getNotesIfAny = function () {
  // there are no notes on expore
  if (document.URL.startsWith(`${getLeetCodeBaseUrl()}/explore/`)) return '';

  let notes = '';
  if (
    checkElem(document.getElementsByClassName('notewrap__eHkN')) &&
    checkElem(
      document
        .getElementsByClassName('notewrap__eHkN')[0]
        .getElementsByClassName('CodeMirror-code'),
    )
  ) {
    const notesdiv = document
      .getElementsByClassName('notewrap__eHkN')[0]
      .getElementsByClassName('CodeMirror-code')[0];
    if (notesdiv) {
      for (let i = 0; i < notesdiv.childNodes.length; i++) {
        if (notesdiv.childNodes[i].childNodes.length == 0) continue;
        const text = notesdiv.childNodes[i].childNodes[0].innerText;
        if (text) {
          notes = `${notes}\n${text.trim()}`.trim();
        }
      }
    }
  }
  return notes.trim();
};
// Returns a slugged num+title variation e.g. 0001-two-sum
LeetCodeV1.prototype.getProblemNameSlug = function () {
  const questionElem = document.getElementsByClassName('content__u3I1 question-content__JfgR');
  const questionDescriptionElem = document.getElementsByClassName('question-description__3U1T');
  let questionTitle = 'unknown-problem';
  if (checkElem(questionElem)) {
    let qtitle = document.getElementsByClassName('css-v3d350');
    if (checkElem(qtitle)) {
      questionTitle = qtitle[0].innerHTML;
    }
  } else if (checkElem(questionDescriptionElem)) {
    let qtitle = document.getElementsByClassName('question-title');
    if (checkElem(qtitle)) {
      questionTitle = qtitle[0].innerText;
    }
  }
  return addLeadingZeros(convertToSlug(questionTitle));
};
/* Gets the success state of the solution and updates html elements with new classes */
LeetCodeV1.prototype.getSuccessStateAndUpdate = function () {
  const successTag = document.getElementsByClassName('success__3Ai7');
  const resultState = document.getElementById('result-state');

  // check success state for a normal problem
  if (
    checkElem(successTag) &&
    successTag[0].className === 'success__3Ai7' &&
    successTag[0].innerText.trim() === 'Success'
  ) {
    console.log(successTag[0]);
    successTag[0].classList.add('marked_as_success');
    return true;
  }
  // check success state for a explore section problem
  else if (
    resultState &&
    resultState.className === 'text-success' &&
    resultState.innerText === 'Accepted'
  ) {
    resultState.classList.add('marked_as_success');
    return true;
  }

  return false;
};
/* Parser function for time/space stats */
LeetCodeV1.prototype.parseStats = function () {
  const probStats = document.getElementsByClassName('data__HC-i');
  if (!checkElem(probStats)) {
    return null;
  }
  const time = probStats[0].textContent;
  const timePercentile = probStats[1].textContent;
  const space = probStats[2].textContent;
  const spacePercentile = probStats[3].textContent;

  return `Time: ${time} (${timePercentile}), Space: ${space} (${spacePercentile}) - LeetHub-Neo`;
};
/* Parser function for the question, question title, question difficulty, and tags */
LeetCodeV1.prototype.parseQuestion = function () {
  let questionUrl = window.location.href;
  if (questionUrl.endsWith('/submissions/')) {
    questionUrl = questionUrl.substring(0, questionUrl.lastIndexOf('/submissions/') + 1);
  }
  const questionElem = document.getElementsByClassName('content__u3I1 question-content__JfgR');
  const questionDescriptionElem = document.getElementsByClassName('question-description__3U1T');
  if (checkElem(questionElem)) {
    const qbody = questionElem[0].innerHTML;

    // Problem title.
    let qtitle = document.getElementsByClassName('css-v3d350');
    if (checkElem(qtitle)) {
      qtitle = qtitle[0].innerHTML;
    } else {
      qtitle = 'unknown-problem';
    }

    // Problem difficulty, each problem difficulty has its own class.
    const isHard = document.getElementsByClassName('css-t42afm');
    const isMedium = document.getElementsByClassName('css-dcmtd5');
    const isEasy = document.getElementsByClassName('css-14oi08n');

    if (checkElem(isEasy)) {
      difficulty = 'Easy';
    } else if (checkElem(isMedium)) {
      difficulty = 'Medium';
    } else if (checkElem(isHard)) {
      difficulty = 'Hard';
    }
    // Final formatting of the contents of the README for each problem
    const markdown = `<h2><a href="${questionUrl}">${qtitle}</a></h2><h3>${difficulty}</h3><hr>${qbody}`;
    return markdown;
  } else if (checkElem(questionDescriptionElem)) {
    let questionTitle = document.getElementsByClassName('question-title');
    if (checkElem(questionTitle)) {
      questionTitle = questionTitle[0].innerText;
    } else {
      questionTitle = 'unknown-problem';
    }

    const questionBody = questionDescriptionElem[0].innerHTML;
    const markdown = `<h2>${questionTitle}</h2><hr>${questionBody}`;

    return markdown;
  }
};
/* Injects a spinner on left side to the "Run Code" button */
LeetCodeV1.prototype.startSpinner = function () {
  try {
    let elem = document.getElementById('leethub_progress_anchor_element');
    if (!elem) {
      elem = document.createElement('span');
      elem.id = 'leethub_progress_anchor_element';
      elem.style = 'margin-right: 20px;padding-top: 2px;';
    }
    elem.innerHTML = `<div id="${this.progressSpinnerElementId}" class="${this.progressSpinnerElementClass}"></div>`;
    this.insertToAnchorElement(elem);
    uploadState.uploading = true;
  } catch (error) {
    console.log(error);
  }
};
/* Injects css style required for the upload progress indicator */
LeetCodeV1.prototype.injectSpinnerStyle = function () {
  const style = document.createElement('style');
  style.textContent = `.${this.progressSpinnerElementClass} {pointer-events: none;width: 2.0em;height: 2.0em;border: 0.4em solid transparent;border-color: #eee;border-top-color: #3E67EC;border-radius: 50%;animation: loadingspin 1s linear infinite;} @keyframes loadingspin { 100% { transform: rotate(360deg) }}`;
  document.head.append(style);
};
/* Inserts an anchor element that is specific to the page you are on (e.g. Explore) */
LeetCodeV1.prototype.insertToAnchorElement = function (elem) {
  if (document.URL.startsWith('${getLeetCodeBaseUrl()}/explore/')) {
    const action = document.getElementsByClassName('action');
    if (
      checkElem(action) &&
      checkElem(action[0].getElementsByClassName('row')) &&
      checkElem(action[0].getElementsByClassName('row')[0].getElementsByClassName('col-sm-6')) &&
      action[0].getElementsByClassName('row')[0].getElementsByClassName('col-sm-6').length > 1
    ) {
      const target = action[0]
        .getElementsByClassName('row')[0]
        .getElementsByClassName('col-sm-6')[1];
      elem.className = 'pull-left';
      if (target.childNodes.length > 0) target.childNodes[0].prepend(elem);
    }
  } else {
    if (checkElem(document.getElementsByClassName('action__38Xc'))) {
      const target = document.getElementsByClassName('action__38Xc')[0];
      elem.className = 'runcode-wrapper__8rXm';
      if (target.childNodes.length > 0) target.childNodes[0].prepend(elem);
    }
  }
};
/* Creates a tick mark before "Run Code" button signaling LeetHub-Neo has done its job */
LeetCodeV1.prototype.markUploaded = function () {
  const elem = document.getElementById(this.progressSpinnerElementId);
  if (elem) {
    elem.className = '';
    elem.style =
      'display: inline-block;transform: rotate(45deg);height:24px;width:12px;border-bottom:7px solid #78b13f;border-right:7px solid #78b13f;';
  }
};
/* Creates a ❌ failed tick mark before "Run Code" button signaling that upload failed */
LeetCodeV1.prototype.markUploadFailed = function () {
  const elem = document.getElementById(this.progressSpinnerElementId);
  if (elem) {
    elem.className = '';
    elem.style =
      'display: inline-block;transform: rotate(45deg);height:24px;width:12px;border-bottom:7px solid red;border-right:7px solid red;';
  }
};
/**
 * Injects the interceptor script into the page's "Main World"
 * and listens for messages from the injected script.
 */
LeetCodeV2.prototype.injectAndListen = function () {
  window.addEventListener('leetHubSubmissionId', event => {
    console.log('[LeetHub-Neo] Received submission ID:', event.detail.submissionId);
    this.processSubmission(event.detail.submissionId);
  });

  window.addEventListener('leetHubSolutionPost', event => {
    const { questionSlug, content, title } = event.detail;
    console.log('LeetHub-Neo: Received solution post event:', event.detail);
    this.handleSolutionPost(questionSlug, content, title);
  });
};

/**
 * The main function that handles the entire commit process based on the submissionId.
 */
LeetCodeV2.prototype.processSubmission = async function (submissionId) {
  // Set the submissionId as a global variable so the existing init function can use it.
  window.leethubLastSubmissionId = submissionId;

  // Directly call the loader from the existing code.
  loader(this);
};

function LeetCodeV2() {
  this.submissionData;
  this.progressSpinnerElementId = 'leethub_progress_elem';
  this.progressSpinnerElementClass = 'leethub_progress';
  this.injectSpinnerStyle();
  this.addManualSubmitButton();
  this.injectAndListen();
}
LeetCodeV2.prototype.init = async function () {
  const submissionId = window.leethubLastSubmissionId;
  if (!submissionId) {
    alert('Could not find a recent submission ID. Please try submitting again.');
    return;
  }
  // Query for getting the solution runtime and memory stats, the code, the coding language, the question id, question title and question difficulty
  const isCN = getLeetCodeBaseUrl() === 'https://leetcode.cn';
  const submissionDetailsQuery = {
    query: isCN
      ? `
query submissionDetails($submissionId: ID!) {
  submissionDetail(submissionId: $submissionId) {
    code
    timestamp
    statusDisplay
    isMine
    lang
    langVerboseName
    runtimeDisplay: runtime
    memoryDisplay: memory

    memory: rawMemory

    runtimePercentile
    memoryPercentile

    question {
      questionId
      titleSlug
      hasFrontendPreview
    }

    user {
      realName
      userAvatar
      userSlug
    }

    passedTestCaseCnt
    totalTestCaseCnt

    ... on GeneralSubmissionNode {
      outputDetail {
        codeOutput
        expectedOutput
        input
        compileError
        runtimeError # in outputDetail
        lastTestcase
      }
    }
  }
}`
      : '\n    query submissionDetails($submissionId: Int!) {\n  submissionDetails(submissionId: $submissionId) {\n    runtime\n    runtimeDisplay\n    runtimePercentile\n    runtimeDistribution\n    memory\n    memoryDisplay\n    memoryPercentile\n    memoryDistribution\n    code\n    timestamp\n    statusCode\n    lang {\n      name\n      verboseName\n    }\n    question {\n      questionId\n    questionFrontendId\n    title\n    titleSlug\n    content\n    difficulty\n    }\n    notes\n    topicTags {\n      tagId\n      slug\n      name\n    }\n    runtimeError\n  }\n}\n    ',
    variables: { submissionId: submissionId },
    operationName: 'submissionDetails',
  };
  const submissionDetailsOptions = {
    method: 'POST',
    headers: {
      cookie: document.cookie, // required to authorize the API request
      'content-type': 'application/json',
    },
    body: JSON.stringify(submissionDetailsQuery),
  };
  const submissionDetailsData = await fetch(
    `${getLeetCodeBaseUrl()}/graphql/`,
    submissionDetailsOptions,
  )
    .then(res => res.json())
    .then(res => (isCN ? res.data.submissionDetail : res.data.submissionDetails));
  console.info('LeetHub-Neo:', { submissionDetailsData });
  this.submissionData = submissionDetailsData;

  const questionDetailsQuery = {
    query:
      '\n    query questionDetail($titleSlug: String!) {\n  question(titleSlug: $titleSlug) {\n    title\n    titleSlug\n    questionId\n    questionFrontendId\n    questionTitle\n    translatedTitle\n    content\n    translatedContent\n    categoryTitle\n    difficulty\n    stats\n    topicTags {\n      name\n      slug\n      translatedName\n    }\n  }\n}\n',
    variables: { titleSlug: this.submissionData.question.titleSlug },
    operationName: 'questionDetail',
  };
  const questionDetailsOptions = {
    method: 'POST',
    headers: {
      cookie: document.cookie,
      'content-type': 'application/json',
    },
    body: JSON.stringify(questionDetailsQuery),
  };
  const questionDetailsData = await fetch(
    getLeetCodeBaseUrl() + '/graphql/',
    questionDetailsOptions,
  )
    .then(res => res.json())
    .then(res => res.data.question);
  this.questionDetails = questionDetailsData;
};
LeetCodeV2.prototype.findAndUploadCode = async function (
  problemName,
  fileName,
  commitMsg,
  action,
  cb = undefined,
) {
  const code = this.getCode();
  if (!code) {
    throw new Error('No solution code found');
  }

  return uploadGit(
    btoa(unescape(encodeURIComponent(code))),
    problemName,
    fileName,
    commitMsg,
    action,
    false,
    cb,
  );
};
LeetCodeV2.prototype.getCode = function () {
  if (this.submissionData != null) {
    return this.submissionData.code;
  }

  const code = document.getElementsByTagName('code');
  if (!checkElem(code)) {
    return null;
  }

  return code[0].innerText;
};
LeetCodeV2.prototype.getLanguageExtension = function () {
  if (this.submissionData != null) {
    return languages[this.submissionData.lang.verboseName ?? this.submissionData.langVerboseName];
  }

  const tag = document.querySelector('button[id^="headlessui-listbox-button"]');
  if (!tag) {
    throw new Error('No language button found');
  }

  const lang = tag.innerText;
  if (languages[lang] === undefined) {
    throw new Error('Unknown Language: ' + { lang });
  }

  return languages[lang];
};
LeetCodeV2.prototype.getLanguage = function () {
  if (this.submissionData != null) {
    return this.submissionData.lang.verboseName ?? this.submissionData.langVerboseName;
  }
  return '';
};

LeetCodeV2.prototype.getNotesIfAny = function () {};

LeetCodeV2.prototype.extractQuestionNumber = function () {
  return this.submissionData.question.questionFrontendId ?? this.submissionData.question.questionId;
};

/**
 * Gets a formatted problem name slug from the LeetCodeV2 instance.
 * @returns {string} A string combining the problem number and the slug title.
 */
LeetCodeV2.prototype.getProblemNameSlug = function () {
  const slugTitle = this.submissionData.question.titleSlug;
  const qNum = this.extractQuestionNumber();
  return addLeadingZeros(qNum + '-' + slugTitle);
};

LeetCodeV2.prototype.getSuccessStateAndUpdate = function () {
  const successTag = document.querySelectorAll('[data-e2e-locator="submission-result"]');
  if (checkElem(successTag)) {
    console.log(successTag[0]);
    successTag[0].classList.add('marked_as_success');
    return true;
  }
  return false;
};
LeetCodeV2.prototype.parseStats = function () {
  if (this.submissionData != null) {
    const runtimePercentile =
      Math.round((this.submissionData.runtimePercentile + Number.EPSILON) * 100) / 100;
    const spacePercentile =
      Math.round((this.submissionData.memoryPercentile + Number.EPSILON) * 100) / 100;
    return {
      time: this.submissionData.runtimeDisplay,
      timePercentile: runtimePercentile,
      space: this.submissionData.memoryDisplay,
      spacePercentile: spacePercentile,
      problemTopic: this.questionDetails?.topicTags?.[0]?.name ?? 'UNKNOWN',
    };
  }

  // Doesn't work unless we wait for page to finish loading.
  setTimeout(() => {}, 1000);
  const probStats = document.getElementsByClassName('flex w-full pb-4')[0].innerText.split('\n');
  if (!checkElem(probStats)) {
    return null;
  }

  const time = probStats[1];
  const timePercentile = probStats[3];
  const space = probStats[5];
  const spacePercentile = probStats[7];

  return formatStats(time, timePercentile, space, spacePercentile);
};
LeetCodeV2.prototype.parseQuestion = function () {
  let markdown;
  if (this.submissionData != null) {
    const questionUrl = `${getLeetCodeBaseUrl()}/problems/${this.submissionData.question.titleSlug}/`;
    const qTitle = `${this.extractQuestionNumber()}. ${this.submissionData.question.title}`;
    const qBody = this.parseQuestionDescription();

    difficulty = this.submissionData.question.difficulty;

    // Final formatting of the contents of the README for each problem
    markdown = `<h2><a href="${questionUrl}">${qTitle}</a></h2><h3>${difficulty}</h3><hr>${qBody}`;
  } else {
    // TODO: get the README markdown via scraping. Right now this isn't possible.
    markdown = null;
  }

  return markdown;
};
LeetCodeV2.prototype.parseQuestionTitle = function () {
  if (this.submissionData != null) {
    return this.submissionData.question.title;
  }

  let questionTitle = document
    .getElementsByTagName('title')[0]
    .innerText.split(' ')
    .slice(0, -2)
    .join(' ');

  if (questionTitle === '') {
    questionTitle = 'unknown-problem';
  }

  return questionTitle;
};
LeetCodeV2.prototype.parseQuestionDescription = function () {
  if (this.submissionData != null) {
    return this.submissionData.question.content;
  }

  const description = document.getElementsByName('description');
  if (!checkElem(description)) {
    return null;
  }
  return description[0].content;
};
LeetCodeV2.prototype.parseDifficulty = function () {
  if (this.submissionData != null) {
    return this.submissionData.question.difficulty;
  }

  const diffElement = document.getElementsByClassName('mt-3 flex space-x-4');
  if (checkElem(diffElement)) {
    return diffElement[0].children[0].innerText;
  }
  // Else, we're not on the description page. Nothing we can do.
  return 'unknown';
};
LeetCodeV2.prototype.startSpinner = function () {
  let elem = document.getElementById('leethub_progress_anchor_element');
  if (!elem) {
    elem = document.createElement('span');
    elem.id = 'leethub_progress_anchor_element';
    elem.style = 'margin-right: 20px;padding-top: 2px;';
  }
  elem.innerHTML = `<div id="${this.progressSpinnerElementId}" class="${this.progressSpinnerElementClass}"></div>`;
  this.insertToAnchorElement(elem);
  uploadState.uploading = true;
};
LeetCodeV2.prototype.injectSpinnerStyle = function () {
  const style = document.createElement('style');
  style.textContent = `.${this.progressSpinnerElementClass} {pointer-events: none;width: 2.0em;height: 2.0em;border: 0.4em solid transparent;border-color: #eee;border-top-color: #3E67EC;border-radius: 50%;animation: loadingspin 1s linear infinite;} @keyframes loadingspin { 100% { transform: rotate(360deg) }}`;
  document.head.append(style);
};
LeetCodeV2.prototype.insertToAnchorElement = function (elem) {
  if (document.URL.startsWith('${getLeetCodeBaseUrl()}/explore/')) {
    // TODO: support spinner when answering problems on Explore pages
    //   action = document.getElementsByClassName('action');
    //   if (
    //     checkElem(action) &&
    //     checkElem(action[0].getElementsByClassName('row')) &&
    //     checkElem(action[0].getElementsByClassName('row')[0].getElementsByClassName('col-sm-6')) &&
    //     action[0].getElementsByClassName('row')[0].getElementsByClassName('col-sm-6').length > 1
    //   ) {
    //     target = action[0].getElementsByClassName('row')[0].getElementsByClassName('col-sm-6')[1];
    //     elem.className = 'pull-left';
    //     if (target.childNodes.length > 0) target.childNodes[0].prepend(elem);
    //   }
    return;
  }

  if (checkElem(document.getElementsByClassName('ml-auto'))) {
    const target = document.getElementsByClassName('ml-auto')[0];
    elem.className = 'runcode-wrapper__8rXm';
    if (target.childNodes.length > 0) target.prepend(elem);
  }
};
LeetCodeV2.prototype.markUploaded = function () {
  let elem = document.getElementById(this.progressSpinnerElementId);
  if (elem) {
    elem.className = '';
    elem.style =
      'display: inline-block;transform: rotate(45deg);height:24px;width:12px;border-bottom:7px solid #78b13f;border-right:7px solid #78b13f;';
  }
};
LeetCodeV2.prototype.markUploadFailed = function () {
  let elem = document.getElementById(this.progressSpinnerElementId);
  if (elem) {
    elem.className = '';
    elem.style =
      'display: inline-block;transform: rotate(45deg);height:24px;width:12px;border-bottom:7px solid red;border-right:7px solid red;';
  }
};

LeetCodeV2.prototype.addManualSubmitButton = function () {
  let elem = document.getElementById('manualGitSubmit');
  const domain = document.URL.match(/:\/\/(www\.)?(.[^/:]+)/)[2].split('.')[0];
  if (elem || domain != 'leetcode') {
    return;
  }

  var submitButton = document.createElement('button');
  submitButton.id = 'manualGitSubmit';
  submitButton.className =
    'relative inline-flex gap-2 items-center justify-center font-medium cursor-pointer focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-colors bg-transparent enabled:hover:bg-fill-secondary enabled:active:bg-fill-primary text-caption rounded text-text-primary group ml-auto p-1';
  submitButton.textContent = 'Push ';
  submitButton.appendChild(getGitIcon());
  submitButton.appendChild(getToolTip());
  submitButton.addEventListener('click', () => loader(this));
  submitButton.addEventListener('contextmenu', event => {
    event.preventDefault();
    const suffix = prompt(
      'Add a suffix for this solution file, i.e., -bfs, -dfs. \r\nWe don\'recommend includes special character except for "-".',
    );
    if (isValidSuffix(suffix)) {
      loader(this, suffix);
    }
  });

  let notesIcon = document.querySelectorAll('.ml-auto svg.fa-bookmark');
  if (checkElem(notesIcon)) {
    const target = notesIcon[0].closest('button.ml-auto').parentElement;
    target.prepend(submitButton);
  }
};

/* Validate if string can be added as suffix. Can add more constrains if necessary. */
function isValidSuffix(string) {
  if (!string || string.length > 255) {
    return false;
  }
  return true;
}

LeetCodeV2.prototype.addUrlChangeListener = function () {
  window.navigation.addEventListener('navigate', _ => {
    const problem = window.location.href.match(/leetcode\.(com|cn)\/problems\/(.*)\/submissions/);
    const submissionId = window.location.href.match(/\/(\d+)(\/|\?|$)/);
    if (problem && problem.length > 2 && submissionId && submissionId.length > 1) {
      chrome.storage.local.set({ [problem[2]]: submissionId[1] });
    }
  });
};

/* Sync to local storage */
chrome.storage.local.get('isSync', data => {
  const keys = [
    'leethub_token',
    'leethub_username',
    'pipe_leethub',
    'stats',
    'leethub_hook',
    'mode_type',
    'custom_commit_message',
  ];
  if (!data || !data.isSync) {
    keys.forEach(key => {
      chrome.storage.sync.get(key, data => {
        chrome.storage.local.set({ [key]: data[key] });
      });
    });
    chrome.storage.local.set({ isSync: true }, _ => {
      console.log('LeetHub-Neo synced to local values');
    });
  } else {
    console.log('LeetHub-Neo local storage already synced!');
  }
});

const loader = (leetCode, suffix) => {
  let iterations = 0;
  // start upload indicator here
  leetCode.startSpinner();
  const intervalId = setInterval(async () => {
    try {
      const isSuccessfulSubmission = leetCode.getSuccessStateAndUpdate();
      if (!isSuccessfulSubmission) {
        iterations++;
        if (iterations > 9) {
          clearInterval(intervalId); // poll for max 10 attempts (10 seconds)
          leetCode.markUploadFailed();
        }
        return;
      }

      // If successful, stop polling
      clearInterval(intervalId);

      await ensureLeetCodeAccountCanSync();

      // For v2, query LeetCode API for submission results
      await leetCode.init();

      const probStats = leetCode.parseStats();
      if (!probStats) {
        throw new Error('Could not get submission stats');
      }

      const probStatement = leetCode.parseQuestion();
      if (!probStatement) {
        throw new Error('Could not find problem statement');
      }

      const problemName = leetCode.getProblemNameSlug();
      const language = leetCode.getLanguageExtension();
      if (!language) {
        throw new Error('Could not find language');
      }
      last_language = leetCode.getLanguage();

      /* Upload README */
      const updateReadMe = await chrome.storage.local.get('stats').then(({ stats }) => {
        const shaExists =
          stats?.shas?.[problemName]?.[repositoryFiles.PROBLEM_README_FILENAME] !== undefined;

        if (!shaExists) {
          return uploadGit(
            btoa(unescape(encodeURIComponent(probStatement))),
            problemName,
            repositoryFiles.PROBLEM_README_FILENAME,
            `Create readme : ${problemName}`,
            'upload',
            false,
          );
        }
      });

      /* Upload Notes if any*/
      let notes = leetCode.getNotesIfAny();
      let updateNotes;
      if (notes != undefined && notes.length > 0) {
        updateNotes = uploadGit(
          btoa(unescape(encodeURIComponent(notes))),
          problemName,
          repositoryFiles.NOTES_FILENAME,
          `Attach Notes : ${problemName}`,
          'upload',
          false,
        );
      }
      const updateMemo = uploadScratchpadMemoIfAny(problemName);

      const problemContext = {
        time: `${probStats.time} (${probStats.timePercentile}%)`,
        space: `${probStats.space} (${probStats.spacePercentile}%)`,
        language: language,
        problemName: problemName,
        difficulty: difficulty,
        date: getTodaysDate(),
        problemTopic: probStats.problemTopic,
      };
      const probStatsCommitMsg = `Time: ${probStats.time} (${probStats.timePercentile}%), Space: ${probStats.space} (${probStats.spacePercentile}%) - LeetHub-Neo`; // default commit
      const commitMsg = (await getCustomCommitMessage(problemContext)) || probStatsCommitMsg;

      const { useTimestampFilename = false } =
        await chrome.storage.local.get('useTimestampFilename');

      let fileName;
      if (useTimestampFilename) {
        const timestamp = `${getTodaysDate()}-${getTime()}`.replace(/[:\s]/g, '--');
        fileName = suffix
          ? `${problemName}${suffix}-${timestamp}${language}`
          : `${problemName}-${timestamp}${language}`;
      } else {
        fileName = suffix ? `${problemName}${suffix}${language}` : `${problemName}${language}`;
      }

      /* Upload code to Git */
      const existingSolutionRecord = await getExistingSolutionRecord(problemName, fileName);
      const alreadyCompleted = Boolean(existingSolutionRecord);
      const updateCode = alreadyCompleted
        ? existingSolutionRecord
        : leetCode.findAndUploadCode(problemName, fileName, commitMsg, 'upload');

      const [solutionRecord] = await Promise.all([
        updateCode,
        updateReadMe,
        updateNotes,
        updateMemo,
      ]);
      const updatedTopics = await safeUpdateTopicIndexesForProblem({
        leetCode,
        problemName,
        language: last_language,
        extension: language,
        solutionRecord,
      });

      uploadState.uploading = false;
      leetCode.markUploaded();

      if (!alreadyCompleted) {
        await recordSolvedProblemStats(leetCode, problemName, { preserveLegacyCounts: true });
      }

      await safeUpdateRootReadmeSummary(updatedTopics);
    } catch (err) {
      uploadState.uploading = false;
      leetCode.markUploadFailed();
      clearInterval(intervalId);
      console.log(err);
    }
  }, 1000);
};

// Use MutationObserver to determine when the submit button elements are loaded
const observer = new MutationObserver(function (_mutations, observer) {
  const v1SubmitBtn = document.querySelector('[data-cy="submit-code-btn"]');
  const v2SubmitBtn = document.querySelector('[data-e2e-locator="console-submit-button"]');
  const textareaList = document.getElementsByTagName('textarea');
  const textarea =
    textareaList.length === 4
      ? textareaList[2]
      : textareaList.length === 2
        ? textareaList[0]
        : textareaList[1];

  if (v1SubmitBtn) {
    observer.disconnect();

    const leetCode = new LeetCodeV1();
    v1SubmitBtn.addEventListener('click', () => loader(leetCode));
    return;
  }

  if (v2SubmitBtn && textarea) {
    observer.disconnect();

    new LeetCodeV2();
  }
});

setTimeout(() => {
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}, 2000);

// Function to convert questionSlug to problemName using the same logic as LeetHub-Neo
async function questionSlugToProblemName(questionSlug) {
  // Query LeetCode GraphQL to get question details
  const questionDetailsQuery = {
    query: `
      query questionDetail($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
          questionId
          questionFrontendId
          title
          titleSlug
        }
      }
    `,
    variables: { titleSlug: questionSlug },
    operationName: 'questionDetail',
  };

  const questionDetailsOptions = {
    method: 'POST',
    headers: {
      cookie: document.cookie,
      'content-type': 'application/json',
    },
    body: JSON.stringify(questionDetailsQuery),
  };

  try {
    const response = await fetch('https://leetcode.com/graphql/', questionDetailsOptions);
    const data = await response.json();
    const questionDetails = data.data.question;

    if (questionDetails) {
      const qNum = questionDetails.questionFrontendId;
      const slugTitle = questionDetails.titleSlug;
      return addLeadingZeros(qNum + '-' + slugTitle);
    }
  } catch (error) {
    console.error('Error fetching question details:', error);
  }

  // Fallback: try to extract from current problem name format
  return addLeadingZeros(convertToSlug(questionSlug));
}

// Function to get the last commit message for a problem by fetching from GitHub API
async function getLastCommitMessage(problemName) {
  try {
    const { stats } = await chrome.storage.local.get('stats');
    const { leethub_token } = await chrome.storage.local.get('leethub_token');
    const { leethub_hook } = await chrome.storage.local.get('leethub_hook');
    const { useDifficultyFolder = false } = await chrome.storage.local.get('useDifficultyFolder');
    const { useLanguageFolder = false } = await chrome.storage.local.get('useLanguageFolder');

    if (!stats?.shas || !leethub_token || !leethub_hook) {
      return 'Add solution post - LeetHub-Neo';
    }

    // Try to find the exact problem name, or one that contains the problem name
    let actualProblemName = problemName;
    if (!stats.shas[problemName]) {
      const availableProblems = Object.keys(stats.shas);

      // Try to find a problem that contains the slug or vice versa
      const questionSlugPart = problemName.replace(/^\d{4}-/, ''); // Remove leading number if present
      const matchingProblem = availableProblems.find(
        name =>
          name.includes(questionSlugPart) || questionSlugPart.includes(name.replace(/^\d{4}-/, '')),
      );

      if (matchingProblem) {
        actualProblemName = matchingProblem;
      } else {
        // Use the original problemName for GitHub API call even if not in stats
        actualProblemName = problemName;
      }
    }

    // Even if no solution files are found in local storage, still try to fetch from GitHub
    // because the stats might be incomplete or outdated

    // Construct the path for the problem folder based on user settings
    let folderPath = actualProblemName;

    // If using difficulty folders, we need to know the difficulty
    // For now, let's try to fetch commits for the problem folder regardless of organization
    if (useDifficultyFolder || useLanguageFolder) {
      // For complex folder structures, we'll search commits more broadly
      folderPath = problemName; // We'll search for any commits containing this problem name
    }

    // Fetch commits from GitHub API for this problem folder
    const commitsUrl = `https://api.github.com/repos/${leethub_hook}/commits?path=${folderPath}&per_page=10`;

    const options = {
      method: 'GET',
      headers: {
        Authorization: `token ${leethub_token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    };

    try {
      const response = await fetch(commitsUrl, options);
      if (response.status === 200) {
        const commits = await response.json();

        if (commits && commits.length > 0) {
          // Find the most recent commit that's not for README.md, NOTES.md, or Solution.md
          for (const commit of commits) {
            const message = commit.commit.message;

            // Skip commits for README, NOTES, or previous solution posts
            if (
              message.includes('Create readme') ||
              message.includes('Attach Notes') ||
              message.includes('Prepend discussion') ||
              message.includes('solution post') ||
              message.includes('Add solution post')
            ) {
              continue;
            }

            // Look for commits that contain time/space stats (typical solution commits)
            if (
              message.includes('Time:') &&
              message.includes('Space:') &&
              (message.includes('LeetHub-Neo') || message.includes('LeetHub'))
            ) {
              return message;
            }

            // If it's not a README/NOTES/solution-post and doesn't have stats, it might still be a solution
            // (in case of custom commit messages or older format)
            return message;
          }
        }
      }
    } catch (apiError) {
      // Silently handle API errors
    }
    return 'Add solution post - LeetHub-Neo';
  } catch (error) {
    console.error('Error getting last commit message:', error);
    return 'Add solution post - LeetHub-Neo';
  }
}

// Function to handle solution post upload
LeetCodeV2.prototype.handleSolutionPost = async function (questionSlug, content, title) {
  try {
    // Check if auto-commit solution post is enabled (default: true)
    const { autoCommitSolutionPost = true } =
      await chrome.storage.local.get('autoCommitSolutionPost');

    if (!autoCommitSolutionPost) {
      console.log('Solution post auto-commit is disabled, skipping upload');
      return;
    }

    console.log('Processing solution post for:', questionSlug);

    const problemName = await questionSlugToProblemName(questionSlug);
    const commitMsg = await getLastCommitMessage(problemName);

    // Create the solution content with title
    const solutionContent = `# ${title}\n\n${content}`;

    // Upload the solution as Solution.md
    await uploadGit(
      btoa(unescape(encodeURIComponent(solutionContent))),
      problemName,
      repositoryFiles.SOLUTION_POST_FILENAME,
      commitMsg,
      'upload',
      false,
    );

    console.log('Solution post uploaded successfully for:', problemName);
  } catch (error) {
    console.error('Error uploading solution post:', error);
  }
};

/*
// add url change listener & manual submit button if it does not exist already
setTimeout(() => {
  const leetCode = new LeetCodeV2();
  leetCode.addManualSubmitButton();
  leetCode.addUrlChangeListener();
}, 6000);
*/
