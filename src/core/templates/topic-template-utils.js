(function initializeTopicTemplateUtils(globalObject) {
  const DEFAULT_TEMPLATE_LANGUAGE = 'python';
  const DEFAULT_SHOW_TOPIC_TEMPLATES = true;
  const TEMPLATE_LANGUAGE_STORAGE_KEY = 'topicTemplateLanguage';
  const SHOW_TEMPLATES_STORAGE_KEY = 'showTopicTemplates';
  const readmeTemplate = globalObject.LeetHubTopicReadmeTemplate;
  const repositoryFiles = globalObject.LeetHubRepositoryFiles;

  function normalizeTemplateLanguage(language, catalog = globalObject.LeetHubTopicTemplateCatalog) {
    const normalizedLanguage = String(language ?? '')
      .trim()
      .toLowerCase();
    const languages = Array.isArray(catalog?.languages) ? catalog.languages : [];
    const exists = languages.some(item => item.slug === normalizedLanguage);

    return exists ? normalizedLanguage : DEFAULT_TEMPLATE_LANGUAGE;
  }

  function normalizeTemplateVisibility(value) {
    return value === undefined ? DEFAULT_SHOW_TOPIC_TEMPLATES : Boolean(value);
  }

  function createTemplateSettings(
    storageValues = {},
    catalog = globalObject.LeetHubTopicTemplateCatalog,
  ) {
    return {
      topicTemplateLanguage: normalizeTemplateLanguage(
        storageValues[TEMPLATE_LANGUAGE_STORAGE_KEY],
        catalog,
      ),
      showTopicTemplates: normalizeTemplateVisibility(storageValues[SHOW_TEMPLATES_STORAGE_KEY]),
    };
  }

  function getTemplateLanguageExtension(
    language,
    catalog = globalObject.LeetHubTopicTemplateCatalog,
  ) {
    const languages = Array.isArray(catalog?.languages) ? catalog.languages : [];
    const normalizedLanguage = normalizeTemplateLanguage(language, catalog);
    return languages.find(item => item.slug === normalizedLanguage)?.extension ?? '.txt';
  }

  function slugifyTemplateName(name, separator) {
    return String(name ?? '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, separator)
      .replace(new RegExp(`${separator}+`, 'g'), separator)
      .replace(new RegExp(`^${separator}|${separator}$`, 'g'), '');
  }

  function createCustomTemplateEntry(
    name,
    language,
    catalog = globalObject.LeetHubTopicTemplateCatalog,
  ) {
    const title = String(name ?? '')
      .trim()
      .replace(/\s+/g, ' ');
    const id = slugifyTemplateName(title, '-');

    if (!id) {
      return null;
    }

    const normalizedLanguage = normalizeTemplateLanguage(language, catalog);
    const filename = `${slugifyTemplateName(title, '_')}${getTemplateLanguageExtension(
      normalizedLanguage,
      catalog,
    )}`;

    return {
      id,
      title,
      path: `templates/${normalizedLanguage}/${filename}`,
    };
  }

  function createCustomTemplateContent(title, language) {
    const normalizedTitle = String(title ?? '')
      .trim()
      .replace(/\s+/g, ' ');
    const commentPrefixByLanguage = {
      cpp: '//',
      java: '//',
      javascript: '//',
      lua: '--',
      python: '#',
      ruby: '#',
    };
    const prefix = commentPrefixByLanguage[language] ?? '#';
    return `${prefix} ${normalizedTitle}\n`;
  }

  function createTemplatesJson(topic, updatedAt = new Date().toISOString()) {
    const templates = Array.isArray(topic.templates) ? topic.templates : [];

    return {
      version: 1,
      topic: {
        slug: topic.slug,
        name: topic.name,
      },
      source: 'leetcode-cheatsheet',
      updatedAt,
      templates: templates.map(template => ({
        id: template.id,
        title: template.title,
        files: Object.fromEntries(
          Object.entries(template.files).map(([language, file]) => [language, file.targetPath]),
        ),
      })),
    };
  }

  function createTemplateReadme(topicName) {
    return readmeTemplate.createTopicReadmeTemplate(topicName);
  }

  function createEmptyProblemsJson(topic, updatedAt = new Date().toISOString()) {
    return {
      version: 1,
      topic: {
        slug: topic.slug,
        name: topic.name,
      },
      updatedAt,
      problems: [],
    };
  }

  function createTopicSeedFileEntries(topic, updatedAt = new Date().toISOString()) {
    const basePath = `${repositoryFiles.TOPICS_BASE_PATH}/${topic.slug}`;
    const entries = [
      {
        path: `${basePath}/${repositoryFiles.PROBLEM_README_FILENAME}`,
        content: createTemplateReadme(topic.name),
        message: `Create ${topic.name} topic notes`,
      },
      {
        path: `${basePath}/${repositoryFiles.TOPIC_PROBLEMS_FILENAME}`,
        content: `${JSON.stringify(createEmptyProblemsJson(topic, updatedAt), null, 2)}\n`,
        message: `Create ${topic.name} topic problems`,
      },
      {
        path: `${basePath}/${repositoryFiles.TOPIC_TEMPLATES_FILENAME}`,
        content: `${JSON.stringify(createTemplatesJson(topic, updatedAt), null, 2)}\n`,
        message: `Create ${topic.name} topic templates`,
      },
    ];

    for (const template of topic.templates ?? []) {
      for (const file of Object.values(template.files)) {
        entries.push({
          path: `${basePath}/${file.targetPath}`,
          sourcePath: file.sourcePath,
          message: `Create ${topic.name} template ${file.targetPath}`,
        });
      }
    }

    return entries;
  }

  globalObject.LeetHubTopicTemplateUtils = {
    DEFAULT_SHOW_TOPIC_TEMPLATES,
    DEFAULT_TEMPLATE_LANGUAGE,
    SHOW_TEMPLATES_STORAGE_KEY,
    TEMPLATE_LANGUAGE_STORAGE_KEY,
    createCustomTemplateContent,
    createCustomTemplateEntry,
    createTemplateReadme,
    createTemplateSettings,
    createTemplatesJson,
    createTopicSeedFileEntries,
    normalizeTemplateLanguage,
    normalizeTemplateVisibility,
  };
})(globalThis);
