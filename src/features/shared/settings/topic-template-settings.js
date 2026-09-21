(function initializeTopicTemplateSettings(globalObject) {
  function renderLanguageOptions(select, catalog, selectedLanguage) {
    select.empty();

    for (const language of catalog.languages) {
      select.append(
        $('<option>', {
          value: language.slug,
          text: language.name,
          selected: language.slug === selectedLanguage,
        }),
      );
    }
  }

  function initializeTopicTemplateSettingsPanel() {
    const utils = globalObject.LeetHubTopicTemplateUtils;
    const catalog = globalObject.LeetHubTopicTemplateCatalog;

    if (!utils || !catalog) {
      return;
    }

    const icon = $('#collapsible-topic-template-icon');
    const container = $('#collapsible-topic-template-container');
    const languageSelect = $('#topic-template-language');
    const showTemplatesToggle = $('#show-topic-templates');
    const resetButton = $('#topic-template-reset-btn');
    const status = $('#topic-template-status');

    if (
      !icon.length ||
      !container.length ||
      !languageSelect.length ||
      !showTemplatesToggle.length
    ) {
      return;
    }

    function loadSettings() {
      chrome.storage.local.get(
        [utils.TEMPLATE_LANGUAGE_STORAGE_KEY, utils.SHOW_TEMPLATES_STORAGE_KEY],
        values => {
          const settings = utils.createTemplateSettings(values, catalog);
          renderLanguageOptions(languageSelect, catalog, settings.topicTemplateLanguage);
          showTemplatesToggle.prop('checked', settings.showTopicTemplates);
        },
      );
    }

    icon.click(() => {
      icon.toggleClass('open');
      container.toggle();
      loadSettings();
    });

    languageSelect.change(function () {
      const topicTemplateLanguage = utils.normalizeTemplateLanguage($(this).val(), catalog);
      status.text('Saving template language...');
      chrome.storage.local.set(
        { [utils.TEMPLATE_LANGUAGE_STORAGE_KEY]: topicTemplateLanguage },
        () => {
          status.text(
            chrome.runtime.lastError
              ? 'Could not save template language.'
              : 'Template language saved. Topics update automatically.',
          );
        },
      );
    });

    showTemplatesToggle.change(function () {
      status.text('Saving template visibility...');
      chrome.storage.local.set(
        {
          [utils.SHOW_TEMPLATES_STORAGE_KEY]: $(this).is(':checked'),
        },
        () => {
          status.text(
            chrome.runtime.lastError
              ? 'Could not save template visibility.'
              : 'Template visibility saved. Topics update automatically.',
          );
        },
      );
    });

    resetButton.click(() => {
      chrome.storage.local.set(
        {
          [utils.TEMPLATE_LANGUAGE_STORAGE_KEY]: utils.DEFAULT_TEMPLATE_LANGUAGE,
          [utils.SHOW_TEMPLATES_STORAGE_KEY]: utils.DEFAULT_SHOW_TOPIC_TEMPLATES,
        },
        () => {
          loadSettings();
          status.text('Template settings reset.');
        },
      );
    });

    loadSettings();
  }

  globalObject.LeetHubTopicTemplateSettings = {
    initializeTopicTemplateSettingsPanel,
  };
})(globalThis);
