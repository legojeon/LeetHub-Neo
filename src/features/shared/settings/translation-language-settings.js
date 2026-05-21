(function initializeTranslationLanguageSettings(globalObject) {
  function renderTranslationLanguageOptions(select, selectedLanguage) {
    const utils = globalObject.LeetHubTranslationLanguageUtils;

    if (!utils) {
      return;
    }

    select.empty();

    for (const language of utils.TRANSLATION_LANGUAGE_OPTIONS) {
      select.append(
        $('<option>', {
          value: language.code,
          text: language.name,
          selected: language.code === selectedLanguage,
        }),
      );
    }
  }

  function initializeTranslationLanguageSettingsPanel() {
    const utils = globalObject.LeetHubTranslationLanguageUtils;

    if (!utils) {
      return;
    }

    const languageSelect = $('#translation-language');
    const resetButton = $('#translation-language-reset-btn');
    const status = $('#translation-language-status');
    const icon = $('#collapsible-translation-language-icon');
    const container = $('#collapsible-translation-language-container');

    if (!languageSelect.length) {
      return;
    }

    function loadSettings() {
      chrome.storage.local.get(utils.TRANSLATION_LANGUAGE_STORAGE_KEY, values => {
        const settings = utils.createTranslationLanguageSettings(values);
        renderTranslationLanguageOptions(languageSelect, settings.translationLanguage);
      });
    }

    if (icon.length && container.length) {
      icon.click(() => {
        icon.toggleClass('open');
        container.toggle();
        loadSettings();
      });
    }

    languageSelect.change(function () {
      const translationLanguage = utils.normalizeTranslationLanguage($(this).val());
      chrome.storage.local.set({ [utils.TRANSLATION_LANGUAGE_STORAGE_KEY]: translationLanguage });
      status.text('Translation language saved.');
    });

    resetButton.click(() => {
      chrome.storage.local.set(
        { [utils.TRANSLATION_LANGUAGE_STORAGE_KEY]: utils.DEFAULT_TRANSLATION_LANGUAGE },
        () => {
          loadSettings();
          status.text('Translation language reset.');
        },
      );
    });

    loadSettings();
  }

  globalObject.LeetHubTranslationLanguageSettings = {
    initializeTranslationLanguageSettingsPanel,
    renderTranslationLanguageOptions,
  };
})(globalThis);
