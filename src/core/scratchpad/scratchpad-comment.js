(function initializeScratchpadComment(globalObject) {
  const LINE_COMMENT_BY_EXTENSION = {
    '.c': '//',
    '.cj': '//',
    '.cpp': '//',
    '.cs': '//',
    '.dart': '//',
    '.ex': '#',
    '.erl': '%',
    '.go': '//',
    '.java': '//',
    '.js': '//',
    '.kt': '//',
    '.lua': '--',
    '.php': '//',
    '.py': '#',
    '.rb': '#',
    '.rkt': ';',
    '.rs': '//',
    '.scala': '//',
    '.sh': '#',
    '.sql': '--',
    '.swift': '//',
    '.ts': '//',
  };

  function normalizeScratchpadText(text) {
    return String(text ?? '').trim();
  }

  function getLineCommentToken(extension) {
    return LINE_COMMENT_BY_EXTENSION[String(extension ?? '').toLowerCase()] ?? '//';
  }

  function formatScratchpadComment(text, extension) {
    const normalizedText = normalizeScratchpadText(text);

    if (!normalizedText) {
      return '';
    }

    const token = getLineCommentToken(extension);
    const lines = normalizedText.split(/\r?\n/);
    return [
      `${token} Scratchpad`,
      ...lines.map(line => (line.trim() ? `${token} ${line}` : token)),
    ].join('\n');
  }

  function appendScratchpadToCode(code, scratchpadText, extension) {
    const scratchpadComment = formatScratchpadComment(scratchpadText, extension);

    if (!scratchpadComment) {
      return String(code ?? '');
    }

    return `${String(code ?? '').trimEnd()}\n\n${scratchpadComment}\n`;
  }

  globalObject.LeetHubScratchpadComment = {
    appendScratchpadToCode,
    formatScratchpadComment,
    getLineCommentToken,
    normalizeScratchpadText,
  };
})(globalThis);
