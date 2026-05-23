(function initializeScratchpadMemo(globalObject) {
  function normalizeScratchpadText(text) {
    return String(text ?? '').trim();
  }

  function formatScratchpadMemo(text) {
    const normalizedText = normalizeScratchpadText(text);

    if (!normalizedText) {
      return '';
    }

    return `${normalizedText}\n`;
  }

  globalObject.LeetHubScratchpadMemo = {
    formatScratchpadMemo,
    normalizeScratchpadText,
  };
})(globalThis);
