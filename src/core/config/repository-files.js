(function initializeRepositoryFiles(globalObject) {
  const ROOT_README_FILENAME = 'README.md';
  const PROBLEM_README_FILENAME = 'README.md';
  const NOTES_FILENAME = 'NOTES.md';
  const SOLUTION_POST_FILENAME = 'Solution.md';
  const SCRATCHPAD_MEMO_FILENAME = 'memo.txt';
  const TOPICS_BASE_PATH = 'Topics';
  const TOPIC_PROBLEMS_FILENAME = 'problems.json';
  const TOPIC_TEMPLATES_FILENAME = 'templates.json';
  const LEETHUB_BASE_PATH_STORAGE_KEY = 'leethub_base_path';
  const LEGACY_PROBLEM_BASE_PATHS = ['LeetCode', 'LeetHub', 'Leethub'];
  const PROBLEM_METADATA_FILENAMES = [
    PROBLEM_README_FILENAME,
    NOTES_FILENAME,
    SOLUTION_POST_FILENAME,
    SCRATCHPAD_MEMO_FILENAME,
  ];

  function isProblemMetadataFile(filename) {
    return PROBLEM_METADATA_FILENAMES.includes(filename);
  }

  function isSolutionUpload(filename) {
    return !isProblemMetadataFile(filename);
  }

  function normalizeRepositoryBasePath(path) {
    return String(path ?? '')
      .replace(/\\/g, '/')
      .split('/')
      .map(segment => segment.trim())
      .filter(segment => segment && segment !== '.' && segment !== '..')
      .join('/');
  }

  function joinRepositoryPath(...segments) {
    return segments
      .flatMap(segment =>
        String(segment ?? '')
          .replace(/\\/g, '/')
          .split('/'),
      )
      .map(segment => segment.trim())
      .filter(segment => segment && segment !== '.' && segment !== '..')
      .join('/');
  }

  function withRepositoryBasePath(basePath, path) {
    return joinRepositoryPath(normalizeRepositoryBasePath(basePath), path);
  }

  globalObject.LeetHubRepositoryFiles = {
    LEGACY_PROBLEM_BASE_PATHS,
    LEETHUB_BASE_PATH_STORAGE_KEY,
    NOTES_FILENAME,
    PROBLEM_METADATA_FILENAMES,
    PROBLEM_README_FILENAME,
    ROOT_README_FILENAME,
    SCRATCHPAD_MEMO_FILENAME,
    SOLUTION_POST_FILENAME,
    TOPICS_BASE_PATH,
    TOPIC_PROBLEMS_FILENAME,
    TOPIC_TEMPLATES_FILENAME,
    joinRepositoryPath,
    normalizeRepositoryBasePath,
    isProblemMetadataFile,
    isSolutionUpload,
    withRepositoryBasePath,
  };
})(globalThis);
