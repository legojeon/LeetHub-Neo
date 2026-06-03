(function initializeTopicTemplateSeed(globalObject) {
  const seedUtils = globalObject.LeetHubTopicTemplateUtils;
  const catalog = globalObject.LeetHubTopicTemplateCatalog;

  async function readBundledTemplate(sourcePath) {
    const response = await fetch(chrome.runtime.getURL(sourcePath));

    if (!response.ok) {
      throw new Error(`Could not read bundled template ${sourcePath}`);
    }

    return response.text();
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

  async function seedCuratedTopicTemplates({
    token,
    hook,
    basePath = '',
    onProgress = () => {},
  } = {}) {
    if (!token || !hook) {
      throw new Error('Missing GitHub token or hook');
    }

    if (!seedUtils || !catalog?.topics?.length) {
      throw new Error('Topic template catalog is not available');
    }

    const updatedAt = new Date().toISOString();
    const entries = catalog.topics.flatMap(topic =>
      seedUtils.createTopicSeedFileEntries(topic, updatedAt, basePath),
    );
    const summary = {
      topics: catalog.topics.length,
      total: entries.length,
      created: 0,
      skipped: 0,
    };

    onProgress({ ...summary, current: 0, path: '' });

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
    const existingPaths = new Set((tree.tree ?? []).map(item => item.path));
    const missingEntries = entries.filter(entry => !existingPaths.has(entry.path));

    summary.skipped = entries.length - missingEntries.length;

    if (!missingEntries.length) {
      return summary;
    }

    const treeEntries = [];

    for (let index = 0; index < missingEntries.length; index += 1) {
      const entry = missingEntries[index];
      onProgress({
        ...summary,
        current: index + 1,
        path: entry.path,
      });
      treeEntries.push({
        path: entry.path,
        mode: '100644',
        type: 'blob',
        content: entry.content ?? (await readBundledTemplate(entry.sourcePath)),
      });
    }

    const nextTree = await requestGitHubJson(
      token,
      `https://api.github.com/repos/${hook}/git/trees`,
      {
        method: 'POST',
        body: JSON.stringify({
          base_tree: commit.tree.sha,
          tree: treeEntries,
        }),
      },
    );
    const nextCommit = await requestGitHubJson(
      token,
      `https://api.github.com/repos/${hook}/git/commits`,
      {
        method: 'POST',
        body: JSON.stringify({
          message: 'Seed LeetHub topic templates',
          tree: nextTree.sha,
          parents: [ref.object.sha],
        }),
      },
    );
    await requestGitHubJson(
      token,
      `https://api.github.com/repos/${hook}/git/refs/heads/${branchName}`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          sha: nextCommit.sha,
        }),
      },
    );

    summary.created = missingEntries.length;

    return summary;
  }

  globalObject.LeetHubTopicTemplateSeed = {
    seedCuratedTopicTemplates,
  };
})(globalThis);
