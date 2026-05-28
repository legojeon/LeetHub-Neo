(function initializeTopicIndexUtils(globalObject) {
  const repositoryFiles = globalObject.LeetHubRepositoryFiles;
  const TOPICS_BASE_PATH = repositoryFiles.TOPICS_BASE_PATH;
  const LEETCODE_BASE_PATH = '';
  const TOPIC_PROBLEMS_FILENAME = repositoryFiles.TOPIC_PROBLEMS_FILENAME;
  const TOPIC_README_FILENAME = repositoryFiles.PROBLEM_README_FILENAME;
  const SUMMARY_SECTION_START = '<!---LeetHub Summary Start-->';
  const SUMMARY_SECTION_END = '<!---LeetHub Summary End-->';
  const LEGACY_TOPICS_SECTION_START = '<!---LeetCode Topics Start-->';
  const LEGACY_TOPICS_SECTION_END = '<!---LeetCode Topics End-->';
  const PROBLEM_METADATA_FILENAMES = repositoryFiles.PROBLEM_METADATA_FILENAMES;
  const LEGACY_PROBLEM_BASE_PATHS = repositoryFiles.LEGACY_PROBLEM_BASE_PATHS;
  const readmeTemplate = globalObject.LeetHubTopicReadmeTemplate;

  function normalizeTopicSlug(value) {
    return String(value ?? '')
      .trim()
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function normalizeTopicTag(tag) {
    const name = String(tag?.name ?? tag?.translatedName ?? '').trim();
    const slug = normalizeTopicSlug(tag?.slug || name);

    if (!name || !slug) {
      return null;
    }

    return { slug, name };
  }

  function normalizeTopicTags(...tagGroups) {
    for (const tagGroup of tagGroups) {
      if (!Array.isArray(tagGroup)) {
        continue;
      }

      const seenTopicSlugs = new Set();
      const topics = [];

      for (const tag of tagGroup) {
        const topic = normalizeTopicTag(tag);

        if (!topic || seenTopicSlugs.has(topic.slug)) {
          continue;
        }

        seenTopicSlugs.add(topic.slug);
        topics.push(topic);
      }

      if (topics.length) {
        return topics;
      }
    }

    return [];
  }

  function getProblemNumber(problemName) {
    const match = String(problemName ?? '').match(/^(\d+)/);
    return match ? Number.parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER;
  }

  function buildRepoPath({
    basePath = LEETCODE_BASE_PATH,
    difficulty = '',
    problemName = '',
    filename = '',
    language = '',
    useDifficultyFolder = false,
    useLanguageFolder = false,
  }) {
    const segments = [];

    if (basePath) {
      segments.push(basePath);
    }

    if (useDifficultyFolder && difficulty) {
      segments.push(difficulty);
    }

    if (problemName) {
      segments.push(problemName);
    }

    if (useLanguageFolder && language && filename && !isProblemMetadataFile(filename)) {
      segments.push(language);
    }

    if (filename) {
      segments.push(filename);
    }

    return segments.join('/');
  }

  function isProblemMetadataFile(filename) {
    return PROBLEM_METADATA_FILENAMES.includes(filename);
  }

  function buildProblemFolderPath(options) {
    return `${buildRepoPath({ ...options, filename: '' })}/`;
  }

  function buildTopicReadmePath(topicSlug) {
    return `${TOPICS_BASE_PATH}/${topicSlug}/${TOPIC_README_FILENAME}`;
  }

  function buildTopicProblemsPath(topicSlug) {
    return `${TOPICS_BASE_PATH}/${topicSlug}/${TOPIC_PROBLEMS_FILENAME}`;
  }

  function createTopicReadme(topicName) {
    return readmeTemplate.createTopicReadmeTemplate(topicName);
  }

  function createEmptyTopicProblems(topic) {
    return {
      version: 1,
      topic,
      updatedAt: new Date().toISOString(),
      problems: [],
    };
  }

  function normalizeTopicProblemsDocument(rawDocument, topic) {
    if (!rawDocument || typeof rawDocument !== 'object' || !Array.isArray(rawDocument.problems)) {
      return createEmptyTopicProblems(topic);
    }

    return {
      version: 1,
      topic,
      updatedAt: rawDocument.updatedAt || new Date().toISOString(),
      problems: rawDocument.problems.map(problem => ({
        ...problem,
        solutions: Array.isArray(problem.solutions) ? problem.solutions : [],
      })),
    };
  }

  function mergeProblemIntoTopicProblems(rawDocument, topic, problemEntry, syncedAt) {
    const document = normalizeTopicProblemsDocument(rawDocument, topic);
    const updatedAt = syncedAt || new Date().toISOString();
    const problems = [...document.problems];
    const existingIndex = problems.findIndex(
      problem => problem.problemName === problemEntry.problemName,
    );
    const incomingSolutions = Array.isArray(problemEntry.solutions) ? problemEntry.solutions : [];

    if (existingIndex === -1) {
      problems.push({
        ...problemEntry,
        solutions: sortSolutions(
          incomingSolutions.map(solution => ({
            ...solution,
            lastSyncedAt: solution.lastSyncedAt || updatedAt,
          })),
        ),
      });
    } else {
      const existingProblem = problems[existingIndex];
      const mergedSolutions = mergeSolutions(
        existingProblem.solutions,
        incomingSolutions,
        updatedAt,
      );
      problems[existingIndex] = {
        ...existingProblem,
        ...problemEntry,
        solutions: mergedSolutions,
      };
    }

    return {
      version: 1,
      topic,
      updatedAt,
      problems: sortProblems(problems),
    };
  }

  function mergeProblemIntoTopicProblemsContent(content, topic, problemEntry, syncedAt) {
    let rawDocument = null;

    if (content) {
      try {
        rawDocument = JSON.parse(content);
      } catch {
        rawDocument = null;
      }
    }

    const document = mergeProblemIntoTopicProblems(rawDocument, topic, problemEntry, syncedAt);
    return `${JSON.stringify(document, null, 2)}\n`;
  }

  function mergeTopicUpdates(...topicGroups) {
    const merged = [];
    const indexBySlug = new Map();

    for (const topicGroup of topicGroups) {
      if (!Array.isArray(topicGroup)) {
        continue;
      }

      for (const topic of topicGroup) {
        const normalizedTopic = normalizeTopicTag(topic);

        if (!normalizedTopic) {
          continue;
        }

        const nextTopic = {
          ...topic,
          ...normalizedTopic,
        };
        const existingIndex = indexBySlug.get(nextTopic.slug);

        if (existingIndex === undefined) {
          indexBySlug.set(nextTopic.slug, merged.length);
          merged.push(nextTopic);
        } else {
          merged[existingIndex] = {
            ...merged[existingIndex],
            ...nextTopic,
          };
        }
      }
    }

    return merged;
  }

  function mergeSolutions(existingSolutions = [], incomingSolutions = [], syncedAt) {
    const merged = [...existingSolutions];

    for (const incomingSolution of incomingSolutions) {
      const existingIndex = merged.findIndex(
        solution => getSolutionMergeKey(solution) === getSolutionMergeKey(incomingSolution),
      );

      if (existingIndex === -1) {
        merged.push({
          ...incomingSolution,
          lastSyncedAt: incomingSolution.lastSyncedAt || syncedAt,
        });
      } else {
        merged[existingIndex] = {
          ...merged[existingIndex],
          ...incomingSolution,
          lastSyncedAt: syncedAt,
        };
      }
    }

    return sortSolutions(merged);
  }

  function getSolutionMergeKey(solution) {
    const filename = String(solution?.filename || solution?.path?.split('/').pop() || '').trim();
    const language = String(solution?.language ?? '').trim();

    return `${language}\0${filename || solution?.path || ''}`;
  }

  function sortProblems(problems) {
    return [...problems].sort((a, b) => {
      const numberDiff = getProblemNumber(a.problemName) - getProblemNumber(b.problemName);
      if (numberDiff !== 0) {
        return numberDiff;
      }
      return String(a.problemName).localeCompare(String(b.problemName));
    });
  }

  function sortSolutions(solutions) {
    return [...solutions].sort((a, b) => {
      const languageDiff = String(a.language).localeCompare(String(b.language));
      if (languageDiff !== 0) {
        return languageDiff;
      }
      return String(a.path).localeCompare(String(b.path));
    });
  }

  function buildProblemEntry({
    frontendId,
    title,
    slug,
    problemName,
    difficulty,
    leetcodeBaseUrl,
    folderPath,
    readmePath,
    language,
    extension,
    solutionPath,
    solutionSha,
    solutionFilename,
    syncedAt,
  }) {
    const solutions = solutionPath
      ? [
          {
            language,
            extension,
            filename: solutionFilename || solutionPath.split('/').pop() || '',
            path: solutionPath,
            sha: solutionSha || '',
            lastSyncedAt: syncedAt,
          },
        ]
      : [];

    return {
      frontendId: String(frontendId ?? ''),
      title: String(title ?? ''),
      slug: String(slug ?? ''),
      problemName,
      difficulty: String(difficulty ?? ''),
      leetcodeUrl: `${leetcodeBaseUrl}/problems/${slug}/`,
      folderPath,
      readmePath,
      solutions,
    };
  }

  function createRepositoryStructureMigrationPlan({
    treeFiles = [],
    topicDocuments = [],
    folderOptions = {},
    syncedAt = new Date().toISOString(),
  } = {}) {
    const blobFiles = treeFiles.filter(file => file?.type === 'blob' && file.path);
    const treeByPath = new Map(blobFiles.map(file => [file.path, file]));
    const moves = [];
    const moveKeys = new Set();
    const plannedTargetByPath = new Map();
    const conflicts = [];
    const missing = [];
    const solutionPathUpdates = [];
    const plannedSolutionPaths = new Map();
    const changedProblemNames = new Set();
    const conflictedProblemNames = new Set();
    const problemByName = collectProblemsByName(topicDocuments);
    const useDifficultyFolder = Boolean(folderOptions.useDifficultyFolder);
    const useLanguageFolder = Boolean(folderOptions.useLanguageFolder);

    function addMove({ sourcePath, targetPath, problemName, filename }) {
      if (!sourcePath || !targetPath || sourcePath === targetPath) {
        return Boolean(targetPath && treeByPath.has(targetPath));
      }

      const source = treeByPath.get(sourcePath);

      if (!source) {
        missing.push({ problemName, filename, path: sourcePath });
        return false;
      }

      const target = treeByPath.get(targetPath);
      if (target && target.sha !== source.sha) {
        conflictedProblemNames.add(problemName);
        conflicts.push({
          problemName,
          filename,
          sourcePath,
          targetPath,
        });
        return false;
      }

      const plannedTarget = plannedTargetByPath.get(targetPath);
      if (plannedTarget && plannedTarget.sha !== source.sha) {
        conflictedProblemNames.add(problemName);
        conflicts.push({
          problemName,
          filename,
          sourcePath,
          targetPath,
        });
        return false;
      }

      if (!plannedTarget) {
        plannedTargetByPath.set(targetPath, source);
      }

      const key = `${sourcePath}\0${targetPath}`;
      if (!moveKeys.has(key)) {
        moveKeys.add(key);
        moves.push({
          problemName,
          sourcePath,
          targetPath,
          sha: source.sha,
        });
      }

      return true;
    }

    for (const problem of problemByName.values()) {
      const problemName = problem.problemName;

      for (const solution of Array.isArray(problem.solutions) ? problem.solutions : []) {
        const filename = solution.filename || getPathFilename(solution.path);
        const sourceFile = findProblemFile(blobFiles, solution.path, problemName, filename);
        const targetPath = buildRepoPath({
          difficulty: problem.difficulty,
          problemName,
          filename,
          language: solution.language,
          useDifficultyFolder,
          useLanguageFolder,
        });
        const canUseTarget = addMove({
          sourcePath: sourceFile?.path || solution.path,
          targetPath,
          problemName,
          filename,
        });

        if (canUseTarget) {
          plannedSolutionPaths.set(getSolutionDocumentKey(problemName, solution), targetPath);
          changedProblemNames.add(problemName);
          if (solution.path !== targetPath) {
            solutionPathUpdates.push({
              problemName,
              filename,
              path: targetPath,
            });
          }
        }
      }

      for (const filename of PROBLEM_METADATA_FILENAMES) {
        const sourceFiles = findProblemMetadataFiles(blobFiles, problemName, filename);
        const targetPath = buildRepoPath({
          difficulty: problem.difficulty,
          problemName,
          filename,
          useDifficultyFolder,
          useLanguageFolder: false,
        });

        for (const sourceFile of sourceFiles) {
          if (
            addMove({
              sourcePath: sourceFile.path,
              targetPath,
              problemName,
              filename,
            })
          ) {
            changedProblemNames.add(problemName);
          }
        }
      }
    }

    const updatedTopicDocuments = [];
    for (const topicDocument of topicDocuments) {
      const document = cloneJson(topicDocument.document);
      let changed = false;

      document.problems = (Array.isArray(document.problems) ? document.problems : []).map(
        problem => {
          if (
            !changedProblemNames.has(problem.problemName) ||
            conflictedProblemNames.has(problem.problemName)
          ) {
            return problem;
          }

          const nextProblem = {
            ...problem,
            folderPath: buildProblemFolderPath({
              difficulty: problem.difficulty,
              problemName: problem.problemName,
              useDifficultyFolder,
              useLanguageFolder: false,
            }),
            readmePath: buildRepoPath({
              difficulty: problem.difficulty,
              problemName: problem.problemName,
              filename: TOPIC_README_FILENAME,
              useDifficultyFolder,
              useLanguageFolder: false,
            }),
            solutions: (Array.isArray(problem.solutions) ? problem.solutions : []).map(solution => {
              const plannedPath = plannedSolutionPaths.get(
                getSolutionDocumentKey(problem.problemName, solution),
              );

              if (!plannedPath || plannedPath === solution.path) {
                return solution;
              }

              changed = true;
              return {
                ...solution,
                path: plannedPath,
                filename: solution.filename || getPathFilename(plannedPath),
                lastSyncedAt: syncedAt,
              };
            }),
          };

          if (
            nextProblem.folderPath !== problem.folderPath ||
            nextProblem.readmePath !== problem.readmePath
          ) {
            changed = true;
          }

          return nextProblem;
        },
      );

      if (changed) {
        document.updatedAt = syncedAt;
        updatedTopicDocuments.push({
          path: topicDocument.path,
          content: `${JSON.stringify(document, null, 2)}\n`,
        });
      }
    }

    return {
      moves: moves.filter(move => !conflictedProblemNames.has(move.problemName)),
      conflicts,
      missing,
      solutionPathUpdates: solutionPathUpdates.filter(
        update => !conflictedProblemNames.has(update.problemName),
      ),
      topicDocuments: updatedTopicDocuments,
    };
  }

  function collectProblemsByName(topicDocuments) {
    const problemByName = new Map();

    for (const topicDocument of topicDocuments) {
      const problems = Array.isArray(topicDocument?.document?.problems)
        ? topicDocument.document.problems
        : [];

      for (const problem of problems) {
        if (problem?.problemName && !problemByName.has(problem.problemName)) {
          problemByName.set(problem.problemName, problem);
        }
      }
    }

    return problemByName;
  }

  function cloneJson(value) {
    return JSON.parse(JSON.stringify(value ?? {}));
  }

  function getPathFilename(path) {
    return (
      String(path ?? '')
        .split('/')
        .pop() || ''
    );
  }

  function getFilenameExtension(filename) {
    const match = String(filename ?? '').match(/(\.[^.]+)$/);
    return match ? match[1].toLowerCase() : '';
  }

  function isProblemSolutionFilename(actualFilename, problemName, expectedFilename) {
    const actual = String(actualFilename ?? '');
    const expected = String(expectedFilename ?? '');
    const expectedExtension = getFilenameExtension(expected);

    if (actual === expected) {
      return true;
    }

    return (
      expectedExtension &&
      getFilenameExtension(actual) === expectedExtension &&
      actual.startsWith(`${problemName}-`)
    );
  }

  function hasProblemSegment(path, problemName) {
    return String(path ?? '')
      .split('/')
      .includes(problemName);
  }

  function findProblemFile(blobFiles, preferredPath, problemName, filename) {
    const exact = blobFiles.find(file => file.path === preferredPath);

    if (exact) {
      return exact;
    }

    return blobFiles.find(
      file => hasProblemSegment(file.path, problemName) && getPathFilename(file.path) === filename,
    );
  }

  function findProblemMetadataFiles(blobFiles, problemName, filename) {
    return blobFiles.filter(
      file =>
        hasProblemSegment(file.path, problemName) &&
        getPathFilename(file.path) === filename &&
        isProblemRepositoryPath(file.path),
    );
  }

  function findProblemRepositoryFile({
    treeFiles = [],
    problemName,
    filename,
    preferredPath = '',
    allowSolutionFilenameFallback = false,
  }) {
    const candidates = treeFiles
      .filter(
        file =>
          file?.type === 'blob' &&
          hasProblemSegment(file.path, problemName) &&
          (allowSolutionFilenameFallback
            ? isProblemSolutionFilename(getPathFilename(file.path), problemName, filename)
            : getPathFilename(file.path) === filename) &&
          isProblemRepositoryPath(file.path),
      )
      .sort((a, b) => {
        const filenameDiff =
          getProblemFilenameRank(getPathFilename(a.path), filename) -
          getProblemFilenameRank(getPathFilename(b.path), filename);

        if (filenameDiff !== 0) {
          return filenameDiff;
        }

        return (
          getProblemPathRank(a.path, preferredPath) - getProblemPathRank(b.path, preferredPath)
        );
      });

    return candidates[0] ?? null;
  }

  function findProblemSolutionFile({ treeFiles = [], problemName, filename, preferredPath = '' }) {
    return findProblemRepositoryFile({
      treeFiles,
      problemName,
      filename,
      preferredPath,
      allowSolutionFilenameFallback: true,
    });
  }

  function getProblemFilenameRank(actualFilename, expectedFilename) {
    return actualFilename === expectedFilename ? 0 : 1;
  }

  function isProblemRepositoryPath(path) {
    const segments = String(path ?? '').split('/');

    return segments[0] !== TOPICS_BASE_PATH;
  }

  function getProblemPathRank(path, preferredPath) {
    const firstSegment = String(path ?? '').split('/')[0] || '';

    if (path === preferredPath && !LEGACY_PROBLEM_BASE_PATHS.includes(firstSegment)) {
      return -1;
    }

    if (!LEGACY_PROBLEM_BASE_PATHS.includes(firstSegment)) {
      return 0;
    }

    return path === preferredPath ? 1 : 2;
  }

  function getSolutionDocumentKey(problemName, solution) {
    return [
      problemName,
      solution.language || '',
      solution.filename || getPathFilename(solution.path),
      solution.path || '',
    ].join('\0');
  }

  function normalizeSolvedDate(value) {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }

    const numericValue = Number(value);
    const date =
      Number.isFinite(numericValue) && String(value).trim() !== ''
        ? new Date(numericValue < 100000000000 ? numericValue * 1000 : numericValue)
        : new Date(value || Date.now());

    if (Number.isNaN(date.getTime())) {
      return formatDate(new Date());
    }

    return formatDate(date);
  }

  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  function createSolvedProblemRecord(problem) {
    const problemName = String(problem?.problemName ?? '').trim();

    if (!problemName) {
      return null;
    }

    return {
      problemName,
      title: String(problem?.title ?? problemName),
      slug: String(problem?.slug ?? ''),
      difficulty: String(problem?.difficulty ?? ''),
      solvedAt: normalizeSolvedDate(problem?.solvedAt ?? problem?.timestamp),
      topicTags: normalizeTopicTags(problem?.topicTags),
    };
  }

  function recordSolvedProblemInStats(
    stats = {},
    problem,
    currentDate = new Date(),
    { preserveLegacyCounts = false } = {},
  ) {
    const record = createSolvedProblemRecord(problem);
    const hasProfileRecords = Boolean(stats.problemStats || stats.solvedProblems);
    const solvedProblems = {
      ...(stats.problemStats ?? stats.solvedProblems ?? {}),
    };
    const shouldInsert = record && !solvedProblems[record.problemName];

    if (shouldInsert) {
      solvedProblems[record.problemName] = record;
    }

    const rebuiltStats = rebuildProfileStats(
      {
        ...stats,
        problemStats: solvedProblems,
      },
      currentDate,
    );

    if (!preserveLegacyCounts || hasProfileRecords || !shouldInsert) {
      return rebuiltStats;
    }

    return {
      ...rebuiltStats,
      solved: (stats.solved ?? 0) + 1,
      easy: (stats.easy ?? 0) + (record.difficulty === 'Easy' ? 1 : 0),
      medium: (stats.medium ?? 0) + (record.difficulty === 'Medium' ? 1 : 0),
      hard: (stats.hard ?? 0) + (record.difficulty === 'Hard' ? 1 : 0),
    };
  }

  function rebuildProfileStats(stats = {}, currentDate = new Date()) {
    const solvedProblems = stats.problemStats ?? stats.solvedProblems ?? {};
    const records = Object.values(solvedProblems).filter(Boolean);
    const activityByDate = {};
    const tagStats = {};
    const difficultyCounts = {
      easy: 0,
      medium: 0,
      hard: 0,
    };

    for (const record of records) {
      const difficultyKey = String(record.difficulty ?? '').toLowerCase();
      if (difficultyKey === 'easy' || difficultyKey === 'medium' || difficultyKey === 'hard') {
        difficultyCounts[difficultyKey] += 1;
      }

      const solvedDate = normalizeSolvedDate(record.solvedAt);
      activityByDate[solvedDate] = (activityByDate[solvedDate] ?? 0) + 1;

      for (const topic of normalizeTopicTags(record.topicTags)) {
        if (!tagStats[topic.slug]) {
          tagStats[topic.slug] = {
            slug: topic.slug,
            name: topic.name,
            count: 0,
            easy: 0,
            medium: 0,
            hard: 0,
          };
        }

        tagStats[topic.slug].count += 1;
        if (difficultyKey === 'easy' || difficultyKey === 'medium' || difficultyKey === 'hard') {
          tagStats[topic.slug][difficultyKey] += 1;
        }
      }
    }

    const topTags = Object.values(tagStats).sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }

      return a.name.localeCompare(b.name);
    });
    const streaks = calculateStreaks(activityByDate, currentDate);

    return {
      ...stats,
      solved: records.length,
      easy: difficultyCounts.easy,
      medium: difficultyCounts.medium,
      hard: difficultyCounts.hard,
      problemStats: solvedProblems,
      activityByDate,
      tagStats,
      topTags,
      currentStreak: streaks.currentStreak,
      bestStreak: streaks.bestStreak,
    };
  }

  function calculateStreaks(activityByDate = {}, currentDate = new Date()) {
    const activeDates = Object.keys(activityByDate)
      .filter(date => activityByDate[date] > 0)
      .sort();
    let bestStreak = 0;
    let run = 0;
    let previousDate = null;

    for (const date of activeDates) {
      if (previousDate && daysBetween(previousDate, date) === 1) {
        run += 1;
      } else {
        run = 1;
      }

      bestStreak = Math.max(bestStreak, run);
      previousDate = date;
    }

    let currentStreak = 0;
    let cursor = normalizeSolvedDate(currentDate);

    while (activityByDate[cursor] > 0) {
      currentStreak += 1;
      cursor = addDays(cursor, -1);
    }

    return {
      currentStreak,
      bestStreak,
    };
  }

  function daysBetween(leftDate, rightDate) {
    const left = new Date(`${leftDate}T00:00:00`);
    const right = new Date(`${rightDate}T00:00:00`);

    return Math.round((right.getTime() - left.getTime()) / 86400000);
  }

  function addDays(dateString, days) {
    const date = new Date(`${dateString}T00:00:00`);
    date.setDate(date.getDate() + days);

    return formatDate(date);
  }

  function renderActivitySummary(stats) {
    const activityByDate = stats.activityByDate ?? {};
    const activeDays = Object.keys(activityByDate).filter(date => activityByDate[date] > 0);
    const recentRows = activeDays
      .sort()
      .slice(-14)
      .map(date => `| ${date} | ${activityByDate[date]} |`);

    return [
      '## Activity',
      '',
      '| Current Streak | Best Streak | Active Days |',
      '| ---: | ---: | ---: |',
      `| ${stats.currentStreak ?? 0} days | ${stats.bestStreak ?? 0} days | ${activeDays.length} |`,
      '',
      '| Date | Problems |',
      '| --- | ---: |',
      ...(recentRows.length ? recentRows : ['| - | 0 |']),
    ];
  }

  function renderTopTagsSummary(stats) {
    const solved = stats.solved || 0;
    const rows = (stats.topTags ?? []).slice(0, 10).map(tag => {
      const percentage = solved ? Math.round((tag.count / solved) * 100) : 0;
      return `| ${tag.name} | ${tag.count} | ${percentage}% |`;
    });

    return [
      '## Top Tags',
      '',
      '| Tag | Problems | Coverage |',
      '| --- | ---: | ---: |',
      ...(rows.length ? rows : ['| - | 0 | 0% |']),
    ];
  }

  function renderRootReadmeSummary({ stats, topics }) {
    const safeStats = stats || {};
    const sortedTopics = [...topics].sort((a, b) => a.name.localeCompare(b.name));
    const topicRows = sortedTopics.map(
      topic => `| [${topic.name}](${TOPICS_BASE_PATH}/${topic.slug}/) | ${topic.problemCount} |`,
    );

    return [
      SUMMARY_SECTION_START,
      '## LeetHub Summary',
      '',
      '| Total Solved | Easy | Medium | Hard |',
      '| ---: | ---: | ---: | ---: |',
      `| ${safeStats.solved ?? 0} | ${safeStats.easy ?? 0} | ${safeStats.medium ?? 0} | ${safeStats.hard ?? 0} |`,
      '',
      ...renderActivitySummary(safeStats),
      '',
      ...renderTopTagsSummary(safeStats),
      '',
      '## Topics',
      '',
      '| Topic | Problems |',
      '| --- | ---: |',
      ...topicRows,
      SUMMARY_SECTION_END,
    ].join('\n');
  }

  function replaceGeneratedSection(readme, summary) {
    const source = String(readme ?? '').trimEnd();

    if (source.includes(SUMMARY_SECTION_START) && source.includes(SUMMARY_SECTION_END)) {
      return replaceBetweenMarkers(source, SUMMARY_SECTION_START, SUMMARY_SECTION_END, summary);
    }

    if (
      source.includes(LEGACY_TOPICS_SECTION_START) &&
      source.includes(LEGACY_TOPICS_SECTION_END)
    ) {
      return replaceBetweenMarkers(
        source,
        LEGACY_TOPICS_SECTION_START,
        LEGACY_TOPICS_SECTION_END,
        summary,
      );
    }

    return `${source}${source ? '\n\n' : ''}${summary}\n`;
  }

  function replaceBetweenMarkers(source, startMarker, endMarker, replacement) {
    const startIndex = source.indexOf(startMarker);
    const endIndex = source.indexOf(endMarker);

    if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
      return `${source.trimEnd()}\n\n${replacement}\n`;
    }

    const before = source.slice(0, startIndex).trimEnd();
    const after = source.slice(endIndex + endMarker.length).trimStart();
    return [before, replacement, after].filter(Boolean).join('\n\n') + '\n';
  }

  globalObject.LeetHubTopicIndexUtils = {
    LEETCODE_BASE_PATH,
    SUMMARY_SECTION_END,
    SUMMARY_SECTION_START,
    TOPICS_BASE_PATH,
    TOPIC_PROBLEMS_FILENAME,
    TOPIC_README_FILENAME,
    buildProblemEntry,
    buildProblemFolderPath,
    buildRepoPath,
    buildTopicProblemsPath,
    buildTopicReadmePath,
    createRepositoryStructureMigrationPlan,
    createEmptyTopicProblems,
    createTopicReadme,
    findProblemRepositoryFile,
    findProblemSolutionFile,
    mergeProblemIntoTopicProblems,
    mergeProblemIntoTopicProblemsContent,
    mergeTopicUpdates,
    normalizeTopicSlug,
    normalizeTopicTag,
    normalizeTopicTags,
    rebuildProfileStats,
    recordSolvedProblemInStats,
    renderRootReadmeSummary,
    replaceGeneratedSection,
  };
})(globalThis);
