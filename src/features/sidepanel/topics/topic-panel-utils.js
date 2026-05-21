(function initializeTopicPanelUtils(globalObject) {
  const repositoryFiles = globalObject.LeetHubRepositoryFiles;
  const TOPICS_BASE_PATH = repositoryFiles.TOPICS_BASE_PATH;
  const DEFAULT_LEETCODE_BASE_URL = 'https://leetcode.com';

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function normalizeSlug(value) {
    return String(value ?? '')
      .trim()
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function normalizePanelTopics(topicTags = [], catalogTopics = []) {
    const catalogBySlug = new Map(catalogTopics.map(topic => [topic.slug, topic]));
    const topics = [];
    const seen = new Set();

    for (const tag of topicTags) {
      const slug = normalizeSlug(tag?.slug || tag?.name);

      if (!slug || seen.has(slug)) {
        continue;
      }

      const catalogTopic = catalogBySlug.get(slug);
      topics.push({
        slug,
        name: catalogTopic?.name || tag.name || slug,
      });
      seen.add(slug);
    }

    return topics;
  }

  function createTopicGithubPaths(topicSlug) {
    const basePath = `${TOPICS_BASE_PATH}/${topicSlug}`;

    return {
      readme: `${basePath}/${repositoryFiles.PROBLEM_README_FILENAME}`,
      problems: `${basePath}/${repositoryFiles.TOPIC_PROBLEMS_FILENAME}`,
      templates: `${basePath}/${repositoryFiles.TOPIC_TEMPLATES_FILENAME}`,
    };
  }

  function normalizePanelProblems(
    document,
    leetcodeBaseUrl = DEFAULT_LEETCODE_BASE_URL,
    { currentSlug = '', currentProblemName = '' } = {},
  ) {
    const problems = Array.isArray(document?.problems) ? document.problems : [];
    const normalizedCurrentSlug = String(currentSlug ?? '').trim();
    const normalizedCurrentProblemName = String(currentProblemName ?? '').trim();

    return problems
      .map(problem => {
        const slug = String(problem.slug ?? '').trim();
        const solutions = Array.isArray(problem.solutions)
          ? problem.solutions
              .map(solution => ({
                language: String(solution.language ?? ''),
                path: String(solution.path ?? ''),
              }))
              .filter(solution => solution.path)
          : [];

        return {
          frontendId: String(problem.frontendId ?? ''),
          title: String(problem.title ?? problem.problemName ?? slug),
          problemName: String(problem.problemName ?? ''),
          slug,
          difficulty: String(problem.difficulty ?? ''),
          leetcodeUrl:
            problem.leetcodeUrl ||
            (slug ? `${leetcodeBaseUrl.replace(/\/$/, '')}/problems/${slug}/` : ''),
          solutions,
        };
      })
      .filter(
        problem =>
          (!normalizedCurrentSlug || problem.slug !== normalizedCurrentSlug) &&
          (!normalizedCurrentProblemName || problem.problemName !== normalizedCurrentProblemName),
      )
      .sort((a, b) => {
        const aNumber = Number.parseInt(a.frontendId, 10);
        const bNumber = Number.parseInt(b.frontendId, 10);

        if (Number.isFinite(aNumber) && Number.isFinite(bNumber) && aNumber !== bNumber) {
          return aNumber - bNumber;
        }

        return a.title.localeCompare(b.title);
      });
  }

  function getTemplateEntriesForLanguage(templatesDocument, language) {
    const templates = Array.isArray(templatesDocument?.templates)
      ? templatesDocument.templates
      : [];

    return templates
      .map(template => ({
        id: String(template.id ?? template.title ?? ''),
        title: String(template.title ?? template.id ?? ''),
        path: template.files?.[language] ?? '',
      }))
      .filter(template => template.path);
  }

  function flushParagraph(paragraphLines, htmlParts) {
    if (!paragraphLines.length) {
      return;
    }

    htmlParts.push(`<p>${escapeHtml(paragraphLines.join(' '))}</p>`);
    paragraphLines.length = 0;
  }

  function flushList(listItems, htmlParts) {
    if (!listItems.length) {
      return;
    }

    htmlParts.push(`<ul>${listItems.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`);
    listItems.length = 0;
  }

  function renderMarkdownToHtml(markdown) {
    const lines = String(markdown ?? '').split(/\r?\n/);
    const htmlParts = [];
    const paragraphLines = [];
    const listItems = [];
    let inCodeBlock = false;
    let codeLanguage = '';
    let codeLines = [];

    for (const line of lines) {
      const fence = line.match(/^```([A-Za-z0-9_-]*)\s*$/);

      if (fence && !inCodeBlock) {
        flushParagraph(paragraphLines, htmlParts);
        flushList(listItems, htmlParts);
        inCodeBlock = true;
        codeLanguage = fence[1] || '';
        codeLines = [];
        continue;
      }

      if (fence && inCodeBlock) {
        const languageClass = codeLanguage ? ` class="language-${escapeHtml(codeLanguage)}"` : '';
        htmlParts.push(
          `<pre><code${languageClass}>${escapeHtml(codeLines.join('\n'))}</code></pre>`,
        );
        inCodeBlock = false;
        codeLanguage = '';
        codeLines = [];
        continue;
      }

      if (inCodeBlock) {
        codeLines.push(line);
        continue;
      }

      const heading = line.match(/^(#{1,3})\s+(.+)$/);
      if (heading) {
        flushParagraph(paragraphLines, htmlParts);
        flushList(listItems, htmlParts);
        const level = heading[1].length;
        htmlParts.push(`<h${level}>${escapeHtml(heading[2])}</h${level}>`);
        continue;
      }

      const listItem = line.match(/^\s*[-*]\s+(.+)$/);
      if (listItem) {
        flushParagraph(paragraphLines, htmlParts);
        listItems.push(listItem[1]);
        continue;
      }

      if (!line.trim()) {
        flushParagraph(paragraphLines, htmlParts);
        flushList(listItems, htmlParts);
        continue;
      }

      flushList(listItems, htmlParts);
      paragraphLines.push(line.trim());
    }

    if (inCodeBlock) {
      const languageClass = codeLanguage ? ` class="language-${escapeHtml(codeLanguage)}"` : '';
      htmlParts.push(`<pre><code${languageClass}>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
    }

    flushParagraph(paragraphLines, htmlParts);
    flushList(listItems, htmlParts);

    return htmlParts.join('');
  }

  globalObject.LeetHubTopicPanelUtils = {
    createTopicGithubPaths,
    escapeHtml,
    getTemplateEntriesForLanguage,
    normalizePanelProblems,
    normalizePanelTopics,
    renderMarkdownToHtml,
  };
})(globalThis);
