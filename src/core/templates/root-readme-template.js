(function initializeRootReadmeTemplate(globalObject) {
  const DEFAULT_ROOT_README = 'Contains topicwise list of solved problems.\n\n';
  const ROOT_README_SUMMARY_COMMIT_MESSAGE = 'Update LeetHub summary';

  globalObject.LeetHubRootReadmeTemplate = {
    DEFAULT_ROOT_README,
    ROOT_README_SUMMARY_COMMIT_MESSAGE,
  };
})(globalThis);
