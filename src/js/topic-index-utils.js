(function initializeTopicIndexUtils(globalObject) {
  const TOPICS_BASE_PATH = 'Topics';
  const LEETCODE_BASE_PATH = 'LeetCode';
  const TOPIC_PROBLEMS_FILENAME = 'problems.json';
  const TOPIC_README_FILENAME = 'README.md';
  const SUMMARY_SECTION_START = '<!---LeetHub Summary Start-->';
  const SUMMARY_SECTION_END = '<!---LeetHub Summary End-->';
  const LEGACY_TOPICS_SECTION_START = '<!---LeetCode Topics Start-->';
  const LEGACY_TOPICS_SECTION_END = '<!---LeetCode Topics End-->';

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
    return ['README.md', 'NOTES.md', 'Solution.md'].includes(filename);
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
    return [
      `# ${topicName}`,
      '',
      '## Concepts',
      '',
      '## Patterns',
      '',
      '## Tips',
      '',
      '## Mistakes',
      '',
    ].join('\n');
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

  function mergeSolutions(existingSolutions = [], incomingSolutions = [], syncedAt) {
    const merged = [...existingSolutions];

    for (const incomingSolution of incomingSolutions) {
      const existingIndex = merged.findIndex(
        solution =>
          solution.language === incomingSolution.language &&
          solution.path === incomingSolution.path,
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
    syncedAt,
  }) {
    return {
      frontendId: String(frontendId ?? ''),
      title: String(title ?? ''),
      slug: String(slug ?? ''),
      problemName,
      difficulty: String(difficulty ?? ''),
      leetcodeUrl: `${leetcodeBaseUrl}/problems/${slug}/`,
      folderPath,
      readmePath,
      solutions: [
        {
          language,
          extension,
          path: solutionPath,
          lastSyncedAt: syncedAt,
        },
      ],
    };
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
    createEmptyTopicProblems,
    createTopicReadme,
    mergeProblemIntoTopicProblems,
    normalizeTopicSlug,
    normalizeTopicTag,
    renderRootReadmeSummary,
    replaceGeneratedSection,
  };
})(globalThis);
