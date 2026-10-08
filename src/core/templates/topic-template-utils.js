(function initializeTopicTemplateUtils(globalObject) {
  const DEFAULT_TEMPLATE_LANGUAGE = 'python';
  const DEFAULT_SHOW_TOPIC_TEMPLATES = true;
  const TEMPLATE_LANGUAGE_STORAGE_KEY = 'topicTemplateLanguage';
  const SHOW_TEMPLATES_STORAGE_KEY = 'showTopicTemplates';
  const USER_TEMPLATE_SCHEMA_VERSION = 2;
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

  function normalizeProblemTemplateLanguage(
    language,
    catalog = globalObject.LeetHubTopicTemplateCatalog,
  ) {
    const value = String(language ?? '')
      .trim()
      .toLowerCase();
    let normalizedLanguage = '';

    if (/^(?:gnu\s*)?c\+\+|^cpp/.test(value)) {
      normalizedLanguage = 'cpp';
    } else if (value.includes('javascript') || /^(?:js|node\.js)\b/.test(value)) {
      normalizedLanguage = 'javascript';
    } else if (/^java\b/.test(value)) {
      normalizedLanguage = 'java';
    } else if (/^(?:python|python3|pandas)\b/.test(value)) {
      normalizedLanguage = 'python';
    } else if (/^lua\b/.test(value)) {
      normalizedLanguage = 'lua';
    } else if (/^ruby\b/.test(value)) {
      normalizedLanguage = 'ruby';
    }

    const languages = Array.isArray(catalog?.languages) ? catalog.languages : [];
    return languages.some(item => item.slug === normalizedLanguage) ? normalizedLanguage : '';
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

  function createUserTemplateId() {
    const uuid = globalObject.crypto?.randomUUID?.();

    if (uuid) {
      return `user:${uuid}`;
    }

    return `user:${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  }

  function createCustomTemplateEntry(
    name,
    language,
    catalog = globalObject.LeetHubTopicTemplateCatalog,
  ) {
    const title = String(name ?? '')
      .trim()
      .replace(/\s+/g, ' ');

    if (!title) {
      return null;
    }

    const filenameBase = (slugifyTemplateName(title, '_') || 'template')
      .slice(0, 80)
      .replace(/_+$/g, '');
    const normalizedLanguage = normalizeTemplateLanguage(language, catalog);
    const id = createUserTemplateId();
    const suffix = id
      .replace(/^user:/, '')
      .replace(/[^a-z0-9]/gi, '')
      .slice(0, 8);
    const filename = `${filenameBase}_${suffix}${getTemplateLanguageExtension(
      normalizedLanguage,
      catalog,
    )}`;

    return {
      id,
      title,
      files: {
        [normalizedLanguage]: `templates/${normalizedLanguage}/${filename}`,
      },
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

  function createUserTemplateManifest(topic, updatedAt = new Date().toISOString()) {
    return {
      schemaVersion: USER_TEMPLATE_SCHEMA_VERSION,
      topic: {
        ...(topic.tagId !== undefined && topic.tagId !== null
          ? { tagId: String(topic.tagId) }
          : {}),
        slug: topic.slug,
        name: topic.name,
      },
      updatedAt,
      templates: {},
    };
  }

  function createTemplatesJson(topic, updatedAt = new Date().toISOString()) {
    return createUserTemplateManifest(topic, updatedAt);
  }

  function createBuiltinTemplateId(topicSlug, templateId) {
    return `builtin:${topicSlug}/${templateId}`;
  }

  function buildBuiltinTemplateRegistry(catalog = globalObject.LeetHubTopicTemplateCatalog) {
    const registry = new Map();

    for (const topic of catalog?.topics ?? []) {
      for (const template of topic.templates ?? []) {
        const id = createBuiltinTemplateId(topic.slug, template.id);
        registry.set(id, {
          ...template,
          id,
          legacyId: template.id,
          groupSlug: topic.slug,
          origin: 'builtin',
        });
      }
    }

    return registry;
  }

  function normalizeTopicSlug(value) {
    return String(value ?? '')
      .trim()
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function findTopicMapping(topic, mappings = globalObject.LeetHubTopicTemplateMappings) {
    const entries = Object.entries(mappings?.topics ?? {});
    const tagId = String(topic?.tagId ?? '').trim();

    if (tagId && mappings?.topics?.[tagId]) {
      return { key: tagId, mapping: mappings.topics[tagId] };
    }

    const slug = normalizeTopicSlug(topic?.slug || topic?.name);
    const match = entries.find(([, mapping]) => {
      const candidates = [mapping.slug, ...(mapping.aliases ?? [])].map(normalizeTopicSlug);
      return candidates.includes(slug);
    });

    return match ? { key: match[0], mapping: match[1] } : null;
  }

  function resolveTopicStorageSlug(topic, mappings = globalObject.LeetHubTopicTemplateMappings) {
    const matched = findTopicMapping(topic, mappings);
    return (
      normalizeTopicSlug(matched?.mapping?.storageSlug || matched?.mapping?.slug) ||
      normalizeTopicSlug(topic?.slug || topic?.name)
    );
  }

  function resolveBuiltinTemplates(
    selectedTopic,
    problemTopics = [],
    catalog = globalObject.LeetHubTopicTemplateCatalog,
    mappings = globalObject.LeetHubTopicTemplateMappings,
  ) {
    const registry = buildBuiltinTemplateRegistry(catalog);
    const selectedMapping = findTopicMapping(selectedTopic, mappings);
    let templateIds = [];

    if (selectedMapping) {
      const activeMappingKeys = new Set(
        problemTopics.map(topic => findTopicMapping(topic, mappings)?.key).filter(Boolean),
      );
      const matchedContexts = (selectedMapping.mapping.contexts ?? []).filter(context =>
        (context.anyOf ?? []).some(key => activeMappingKeys.has(String(key))),
      );

      templateIds = matchedContexts.length
        ? matchedContexts.flatMap(context => context.templates ?? [])
        : (selectedMapping.mapping.templates ?? []);
    }

    return [...new Set(templateIds)].map(id => registry.get(id)).filter(Boolean);
  }

  function normalizeUserTemplateFiles(files, catalog = globalObject.LeetHubTopicTemplateCatalog) {
    const languages = new Set((catalog?.languages ?? []).map(language => language.slug));

    return Object.fromEntries(
      Object.entries(files ?? {})
        .map(([language, path]) => [language, String(path ?? '').trim()])
        .filter(
          ([language, path]) =>
            languages.has(language) &&
            path &&
            path.startsWith(`templates/${language}/`) &&
            !path.startsWith('/') &&
            !path.includes('\\') &&
            !path.split('/').includes('..'),
        ),
    );
  }

  function normalizeUserTemplateEntry(
    id,
    entry,
    catalog = globalObject.LeetHubTopicTemplateCatalog,
  ) {
    const normalizedId = String(id ?? entry?.id ?? '').trim();
    const title = String(entry?.title ?? '').trim();
    const files = normalizeUserTemplateFiles(entry?.files, catalog);

    if (!normalizedId.startsWith('user:') || !title || !Object.keys(files).length) {
      return null;
    }

    const forkedFrom = String(entry?.forkedFrom ?? '').trim();
    return {
      id: normalizedId,
      title,
      ...(forkedFrom.startsWith('builtin:') ? { forkedFrom } : {}),
      files,
    };
  }

  function createLegacyUserTemplateId(topicSlug, legacyId, index) {
    const topicPart = slugifyTemplateName(topicSlug, '-') || 'topic';
    const idPart = slugifyTemplateName(legacyId, '-') || `template-${index + 1}`;
    return `user:legacy-${topicPart}-${idPart}-${index + 1}`;
  }

  function normalizeUserTemplateManifest(
    document,
    topic,
    catalog = globalObject.LeetHubTopicTemplateCatalog,
    updatedAt = new Date().toISOString(),
  ) {
    const manifest = createUserTemplateManifest(topic, document?.updatedAt || updatedAt);

    if (
      document?.schemaVersion !== undefined &&
      document.schemaVersion !== USER_TEMPLATE_SCHEMA_VERSION
    ) {
      manifest.unsupportedSchemaVersion = document.schemaVersion;
      return manifest;
    }

    if (document?.schemaVersion === USER_TEMPLATE_SCHEMA_VERSION) {
      const sourceEntries = Array.isArray(document.templates)
        ? document.templates.map(entry => [entry?.id, entry])
        : Object.entries(document.templates ?? {});
      let invalidTemplateCount = 0;

      for (const [id, entry] of sourceEntries) {
        const normalized = normalizeUserTemplateEntry(id, entry, catalog);
        if (normalized) {
          manifest.templates[normalized.id] = normalized;
        } else {
          invalidTemplateCount += 1;
        }
      }

      if (invalidTemplateCount) {
        manifest.invalidTemplateCount = invalidTemplateCount;
      }

      return manifest;
    }

    const legacyTemplates = Array.isArray(document?.templates) ? document.templates : [];
    const legacyTopic = (catalog?.topics ?? []).find(
      item => item.slug === normalizeTopicSlug(topic?.slug),
    );
    const legacyBuiltins = new Set((legacyTopic?.templates ?? []).map(template => template.id));
    let invalidTemplateCount = 0;

    legacyTemplates.forEach((entry, index) => {
      const legacyId = String(entry?.id ?? entry?.title ?? '').trim();
      const files = normalizeUserTemplateFiles(entry?.files, catalog);
      const title = String(entry?.title ?? legacyId).trim();

      if (!legacyId || !title || !Object.keys(files).length) {
        invalidTemplateCount += 1;
        return;
      }

      const id = createLegacyUserTemplateId(topic?.slug, legacyId, index);
      manifest.templates[id] = {
        id,
        title,
        ...(legacyBuiltins.has(legacyId)
          ? { forkedFrom: createBuiltinTemplateId(legacyTopic.slug, legacyId) }
          : {}),
        files,
      };
    });

    if (invalidTemplateCount) {
      manifest.invalidTemplateCount = invalidTemplateCount;
    }

    return manifest;
  }

  function upsertUserTemplate(manifest, topic, entry, updatedAt = new Date().toISOString()) {
    if (manifest?.unsupportedSchemaVersion !== undefined) {
      throw new Error(
        `Unsupported topic template schema version: ${manifest.unsupportedSchemaVersion}`,
      );
    }

    return {
      ...createUserTemplateManifest(topic, updatedAt),
      templates: {
        ...(manifest?.templates ?? {}),
        [entry.id]: entry,
      },
    };
  }

  function mergeCustomTemplateEntry(manifest, generatedEntry, language) {
    const titleKey = String(generatedEntry?.title ?? '')
      .trim()
      .toLowerCase();
    const matchingTemplate = Object.values(manifest?.templates ?? {}).find(
      template =>
        !template.forkedFrom &&
        String(template.title ?? '')
          .trim()
          .toLowerCase() === titleKey,
    );

    if (matchingTemplate?.files?.[language]) {
      throw new Error(`${matchingTemplate.title} already exists for ${language}.`);
    }

    return matchingTemplate
      ? {
          ...matchingTemplate,
          files: {
            ...matchingTemplate.files,
            [language]: generatedEntry.files[language],
          },
        }
      : generatedEntry;
  }

  function createForkedTemplateEntry(
    builtinTemplate,
    language,
    catalog = globalObject.LeetHubTopicTemplateCatalog,
  ) {
    const entry = createCustomTemplateEntry(builtinTemplate?.title, language, catalog);

    return entry
      ? {
          ...entry,
          forkedFrom: builtinTemplate.id,
        }
      : null;
  }

  function resolveEffectiveTemplateEntries(builtinTemplates, manifest, language) {
    const userTemplates = Object.values(manifest?.templates ?? {}).filter(
      template => template.files?.[language],
    );
    const forks = new Map();
    const usedUserTemplateIds = new Set();

    for (const template of userTemplates) {
      if (template.forkedFrom && !forks.has(template.forkedFrom)) {
        forks.set(template.forkedFrom, template);
      }
    }

    const entries = builtinTemplates.map(template => {
      const fork = forks.get(template.id);

      if (fork) {
        usedUserTemplateIds.add(fork.id);
        return {
          ...fork,
          origin: 'user',
          path: fork.files[language],
        };
      }

      const file = template.files?.[language];
      return {
        id: template.id,
        title: template.title,
        origin: 'builtin',
        path: file?.targetPath ?? '',
        sourcePath: file?.sourcePath ?? '',
      };
    });
    const customEntries = userTemplates
      .filter(template => !usedUserTemplateIds.has(template.id))
      .map(template => ({
        ...template,
        origin: 'user',
        path: template.files[language],
      }));

    return [...entries, ...customEntries].filter(entry => entry.path || entry.sourcePath);
  }

  function validateTopicTemplateMappings(
    catalog = globalObject.LeetHubTopicTemplateCatalog,
    mappings = globalObject.LeetHubTopicTemplateMappings,
  ) {
    const registry = buildBuiltinTemplateRegistry(catalog);
    const errors = [];
    const slugs = new Set();
    const topicIds = new Set(Object.keys(mappings?.topics ?? {}));

    for (const [tagId, mapping] of Object.entries(mappings?.topics ?? {})) {
      for (const slug of [mapping.slug, ...(mapping.aliases ?? [])].map(normalizeTopicSlug)) {
        if (!slug) {
          errors.push(`Topic ${tagId} has an empty slug or alias.`);
        } else if (slugs.has(slug)) {
          errors.push(`Topic slug or alias is duplicated: ${slug}`);
        } else {
          slugs.add(slug);
        }
      }

      const referenced = [
        ...(mapping.templates ?? []),
        ...(mapping.contexts ?? []).flatMap(context => context.templates ?? []),
      ];
      for (const templateId of referenced) {
        if (!registry.has(templateId)) {
          errors.push(`Topic ${tagId} references missing template ${templateId}.`);
        }
      }

      for (const contextTagId of (mapping.contexts ?? []).flatMap(context => context.anyOf ?? [])) {
        if (!topicIds.has(String(contextTagId))) {
          errors.push(`Topic ${tagId} references missing context topic ${contextTagId}.`);
        }
      }
    }

    return errors;
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

  function createTopicSeedFileEntries(topic, updatedAt = new Date().toISOString(), basePath = '') {
    const topicBasePath = repositoryFiles.joinRepositoryPath(
      basePath,
      repositoryFiles.TOPICS_BASE_PATH,
      topic.slug,
    );
    const entries = [
      {
        path: `${topicBasePath}/${repositoryFiles.PROBLEM_README_FILENAME}`,
        content: createTemplateReadme(topic.name),
        message: `Create ${topic.name} topic notes`,
      },
      {
        path: `${topicBasePath}/${repositoryFiles.TOPIC_PROBLEMS_FILENAME}`,
        content: `${JSON.stringify(createEmptyProblemsJson(topic, updatedAt), null, 2)}\n`,
        message: `Create ${topic.name} topic problems`,
      },
      {
        path: `${topicBasePath}/${repositoryFiles.TOPIC_TEMPLATES_FILENAME}`,
        content: `${JSON.stringify(createTemplatesJson(topic, updatedAt), null, 2)}\n`,
        message: `Create ${topic.name} topic templates`,
      },
    ];

    return entries;
  }

  globalObject.LeetHubTopicTemplateUtils = {
    DEFAULT_SHOW_TOPIC_TEMPLATES,
    DEFAULT_TEMPLATE_LANGUAGE,
    SHOW_TEMPLATES_STORAGE_KEY,
    TEMPLATE_LANGUAGE_STORAGE_KEY,
    USER_TEMPLATE_SCHEMA_VERSION,
    buildBuiltinTemplateRegistry,
    createBuiltinTemplateId,
    createCustomTemplateContent,
    createCustomTemplateEntry,
    createForkedTemplateEntry,
    createTemplateReadme,
    createTemplateSettings,
    createTemplatesJson,
    createTopicSeedFileEntries,
    createUserTemplateManifest,
    findTopicMapping,
    mergeCustomTemplateEntry,
    normalizeProblemTemplateLanguage,
    normalizeTemplateLanguage,
    normalizeTemplateVisibility,
    normalizeUserTemplateManifest,
    resolveBuiltinTemplates,
    resolveEffectiveTemplateEntries,
    resolveTopicStorageSlug,
    upsertUserTemplate,
    validateTopicTemplateMappings,
  };
})(globalThis);
