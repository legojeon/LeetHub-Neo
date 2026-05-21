(function initializeTranslationLanguageUtils(globalObject) {
  const DEFAULT_TRANSLATION_LANGUAGE = 'ko';
  const TRANSLATION_LANGUAGE_STORAGE_KEY = 'translationLanguage';

  const SUPPORTED_TRANSLATION_LANGUAGES = [
    { code: 'ar', name: 'Arabic' },
    { code: 'bg', name: 'Bulgarian' },
    { code: 'bn', name: 'Bengali' },
    { code: 'cs', name: 'Czech' },
    { code: 'da', name: 'Danish' },
    { code: 'de', name: 'German' },
    { code: 'el', name: 'Greek' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fi', name: 'Finnish' },
    { code: 'fr', name: 'French' },
    { code: 'hi', name: 'Hindi' },
    { code: 'hr', name: 'Croatian' },
    { code: 'hu', name: 'Hungarian' },
    { code: 'id', name: 'Indonesian' },
    { code: 'it', name: 'Italian' },
    { code: 'iw', name: 'Hebrew' },
    { code: 'ja', name: 'Japanese' },
    { code: 'kn', name: 'Kannada' },
    { code: 'ko', name: 'Korean' },
    { code: 'lt', name: 'Lithuanian' },
    { code: 'mr', name: 'Marathi' },
    { code: 'nl', name: 'Dutch' },
    { code: 'no', name: 'Norwegian' },
    { code: 'pl', name: 'Polish' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ro', name: 'Romanian' },
    { code: 'ru', name: 'Russian' },
    { code: 'sk', name: 'Slovak' },
    { code: 'sl', name: 'Slovenian' },
    { code: 'sv', name: 'Swedish' },
    { code: 'ta', name: 'Tamil' },
    { code: 'te', name: 'Telugu' },
    { code: 'th', name: 'Thai' },
    { code: 'tr', name: 'Turkish' },
    { code: 'uk', name: 'Ukrainian' },
    { code: 'vi', name: 'Vietnamese' },
    { code: 'zh', name: 'Chinese' },
    { code: 'zh-Hant', name: 'Chinese (Traditional)' },
  ];

  const TRANSLATION_LANGUAGE_OPTIONS = SUPPORTED_TRANSLATION_LANGUAGES;

  function findTranslationLanguage(language) {
    const normalizedLanguage = String(language ?? '')
      .trim()
      .toLowerCase();

    return TRANSLATION_LANGUAGE_OPTIONS.find(
      option => option.code.toLowerCase() === normalizedLanguage,
    );
  }

  function normalizeTranslationLanguage(language) {
    return findTranslationLanguage(language)?.code ?? DEFAULT_TRANSLATION_LANGUAGE;
  }

  function getTranslationLanguageName(language) {
    const normalizedLanguage = normalizeTranslationLanguage(language);
    return (
      TRANSLATION_LANGUAGE_OPTIONS.find(option => option.code === normalizedLanguage)?.name ??
      'Korean'
    );
  }

  function createTranslationLanguageSettings(values = {}) {
    return {
      translationLanguage: normalizeTranslationLanguage(values[TRANSLATION_LANGUAGE_STORAGE_KEY]),
    };
  }

  globalObject.LeetHubTranslationLanguageUtils = {
    DEFAULT_TRANSLATION_LANGUAGE,
    TRANSLATION_LANGUAGE_STORAGE_KEY,
    SUPPORTED_TRANSLATION_LANGUAGES,
    TRANSLATION_LANGUAGE_OPTIONS,
    createTranslationLanguageSettings,
    getTranslationLanguageName,
    normalizeTranslationLanguage,
  };
})(globalThis);
