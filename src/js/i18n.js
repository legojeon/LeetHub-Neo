(function initializeLeetHubI18n(globalObject) {
  const STATIC_KEY_BY_TEXT = Object.freeze({
    'Sync your code from LeetCode to GitHub': 'tagline',
    'Automatically sync your code from LeetCode to GitHub': 'taglineAutomatic',
    'requires GitHub authentication.': 'authenticatePrompt',
    Authenticate: 'authenticate',
    'requires a connected GitHub repository.': 'setupRepositoryPrompt',
    'Set up Hook': 'setupRepository',
    Retry: 'retry',
    Problem: 'problemTab',
    Scratchpad: 'scratchpadTab',
    Topics: 'topicsTab',
    LeetHub: 'leethubTab',
    Notes: 'notesTab',
    Templates: 'templatesTab',
    'Request translation review': 'requestTranslationReview',
    Sketch: 'sketch',
    Sketches: 'sketches',
    Empty: 'empty',
    Clear: 'clear',
    'Problems Solved': 'problemsSolved',
    'Problems Solved:': 'problemsSolvedColon',
    Solved: 'solved',
    Current: 'current',
    Best: 'best',
    'Request a feature!': 'requestFeature',
    Settings: 'settings',
    'Sync Previous': 'syncPrevious',
    'Sync accepted LeetCode submissions into GitHub.': 'syncPreviousDescription',
    Sync: 'sync',
    'Migrate Repository Structure': 'migrateRepositoryStructure',
    'Move existing synced files to match current folder settings.': 'migrateDescription',
    Migrate: 'migrate',
    Theme: 'theme',
    'Switch the side panel between light and dark mode.': 'themeDescription',
    'Dark Mode': 'darkMode',
    'Commit Message': 'commitMessage',
    'Customize Commit Message': 'customizeCommitMessage',
    'Customize the commit template and insert variables.': 'commitMessageDescription',
    'Available Variables': 'availableVariables',
    'Time (Time Percentile)': 'timeVariable',
    'Space (Space Percentile)': 'spaceVariable',
    "Today's Date": 'dateVariable',
    'Problem Name': 'problemNameVariable',
    Difficulty: 'difficultyVariable',
    'Solved Language': 'solvedLanguageVariable',
    'Problem Topic': 'problemTopicVariable',
    Reset: 'reset',
    Save: 'save',
    'Commit message saved!': 'commitMessageSaved',
    'Use Difficulty Subfolder': 'useDifficultySubfolder',
    'Organize submissions under Easy, Medium, and Hard folders.': 'difficultySubfolderDescription',
    'Organize files into folders like': 'organizeFilesLike',
    'Use Language Subfolder': 'useLanguageSubfolder',
    "Group each problem's files by solved language.": 'languageSubfolderDescription',
    'Timestamped Filenames': 'timestampedFilenames',
    'Enable Timestamped Filenames': 'enableTimestampedFilenames',
    'Keep multiple accepted versions by adding timestamps to filenames.':
      'timestampedFilenamesDescription',
    'Save submissions like': 'saveSubmissionsLike',
    'to preserve versions.': 'preserveVersions',
    'Add versioned filenames': 'addVersionedFilenames',
    'Add versioned filenames (timestamped)': 'addVersionedFilenames',
    'Auto-Commit Solution Posts': 'autoCommitSolutionPosts',
    'Commit published LeetCode solution posts as Solution.md.': 'solutionPostDescription',
    'Automatically commit your solution posts to GitHub as': 'automaticallyCommitSolutionPosts',
    'files when you publish them on LeetCode.': 'whenPublishedOnLeetCode',
    'Auto-Update Repository README': 'autoUpdateRepositoryReadme',
    'Update the generated progress summary in the synced README.': 'readmeUpdateDescription',
    'Turn this off before editing the synced repository README by hand. Problem files, topics, and stats still sync.':
      'readmeUpdateWarning',
    'Topic Templates': 'topicTemplates',
    'Choose template language and Topics tab visibility.': 'topicTemplatesDescription',
    'Default template language': 'defaultTemplateLanguage',
    'Show templates in side panel': 'showTemplatesInSidePanel',
    'Translation Language': 'translationLanguage',
    'Choose the target language for LeetCode problem descriptions.':
      'translationLanguageDescription',
    'Problem translation language': 'problemTranslationLanguage',
    'Linked the wrong repo?': 'linkedWrongRepository',
    Unlink: 'unlink',
    'To get started with LeetHub-Neo': 'getStartedWithLeetHub',
    'Pick an Option': 'pickOption',
    'Create a new Private Repository': 'createPrivateRepository',
    'Link an Existing Repository': 'linkExistingRepository',
    'Select a Repository': 'selectRepository',
    'Sync folder inside repository': 'syncFolderInsideRepository',
    'Sync accepted submissions after linking GitHub': 'syncAfterLinkingGitHub',
    'Get Started': 'getStarted',
    'Sync Problem Counts': 'syncProblemCounts',
    'Want more features?': 'wantMoreFeatures',
    'Freely sketch notes, edge cases, or ideas...': 'scratchpadPlaceholder',
    'Problem tools': 'problemTools',
    'Refresh translation': 'refreshTranslation',
    'Add a sketch': 'addSketch',
    'Resize sketch': 'resizeSketch',
    'Rename sketch': 'renameSketch',
    'Delete sketch': 'deleteSketch',
    'Add another sketch': 'addAnotherSketch',
    'Sketch tools': 'sketchTools',
    Pan: 'pan',
    Pen: 'pen',
    Rectangle: 'rectangle',
    Ellipse: 'ellipse',
    Arrow: 'arrow',
    Text: 'textTool',
    Eraser: 'eraser',
    Undo: 'undo',
    Redo: 'redo',
    'Clear sketch': 'clearSketch',
    'Sketch canvas': 'sketchCanvas',
    'Sketch text': 'sketchText',
    'Topic content': 'topicContent',
    Topic: 'topic',
    'Edit topic README on GitHub': 'editTopicReadmeGitHub',
    'Edit README on GitHub': 'editReadmeGitHub',
    'Solved problem stats': 'solvedProblemStats',
    'Difficulty distribution': 'difficultyDistribution',
    'LeetHub profile summary': 'leethubProfileSummary',
    'Recent solve activity': 'recentSolveActivity',
    'LeetHub links and settings': 'leethubLinksAndSettings',
    'Sync accepted submissions': 'syncAcceptedSubmissions',
    'Open LeetHub settings': 'openLeetHubSettings',
    'Back to LeetHub panel': 'backToLeetHubPanel',
    'Toggle theme settings': 'toggleThemeSettings',
    'Toggle commit message settings': 'toggleCommitMessageSettings',
    'Toggle difficulty folder settings': 'toggleDifficultyFolderSettings',
    'Toggle language folder settings': 'toggleLanguageFolderSettings',
    'Toggle timestamp filename settings': 'toggleTimestampFilenameSettings',
    'Toggle solution post settings': 'toggleSolutionPostSettings',
    'Toggle repository README settings': 'toggleRepositoryReadmeSettings',
    'Toggle topic template settings': 'toggleTopicTemplateSettings',
    'Toggle translation language settings': 'toggleTranslationLanguageSettings',
    'Repository Name': 'repositoryName',
  });

  function getMessage(key, substitutions, fallback = '') {
    const message = globalObject.chrome?.i18n?.getMessage?.(key, substitutions);
    return message || fallback || key;
  }

  function getUiLanguage() {
    return globalObject.chrome?.i18n?.getUILanguage?.() || globalObject.navigator?.language || 'en';
  }

  function localizeLanguageName(languageCode, fallback = languageCode) {
    try {
      const displayNames = new Intl.DisplayNames([getUiLanguage()], { type: 'language' });
      return displayNames.of(languageCode) || fallback;
    } catch {
      return fallback;
    }
  }

  function replaceTextNode(node) {
    const original = node.nodeValue ?? '';
    const normalized = original.trim().replace(/\s+/g, ' ');
    const key = STATIC_KEY_BY_TEXT[normalized];
    if (!key) {
      return;
    }

    const leading = original.match(/^\s*/)?.[0] ?? '';
    const trailing = original.match(/\s*$/)?.[0] ?? '';
    node.nodeValue = `${leading}${getMessage(key, undefined, normalized)}${trailing}`;
  }

  function localizeDocument(root = globalObject.document) {
    if (!root?.documentElement || !root.body) {
      return;
    }

    root.documentElement.lang = getUiLanguage();
    const walker = root.createTreeWalker(root.body, globalObject.NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) {
      const parent = walker.currentNode.parentElement;
      if (!parent?.closest('script, style, code, pre, [data-i18n-ignore]')) {
        textNodes.push(walker.currentNode);
      }
    }
    textNodes.forEach(replaceTextNode);

    for (const element of root.querySelectorAll('[placeholder], [title], [aria-label]')) {
      for (const attribute of ['placeholder', 'title', 'aria-label']) {
        const value = element.getAttribute(attribute);
        const key = STATIC_KEY_BY_TEXT[value];
        if (key) {
          element.setAttribute(attribute, getMessage(key, undefined, value));
        }
      }
    }

    for (const element of root.querySelectorAll('[data-i18n]')) {
      const key = element.dataset.i18n;
      element.textContent = getMessage(key, undefined, element.textContent.trim());
    }
  }

  const api = {
    getMessage,
    getUiLanguage,
    localizeDocument,
    localizeLanguageName,
  };

  globalObject.LeetHubI18n = api;

  if (globalObject.document) {
    if (globalObject.document.readyState === 'loading') {
      globalObject.document.addEventListener('DOMContentLoaded', () => localizeDocument());
    } else {
      localizeDocument();
    }
  }
})(globalThis);
