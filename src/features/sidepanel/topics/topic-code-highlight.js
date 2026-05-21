import Prism, { loadLanguages } from '../../../vendor/prism-v2/index.js';

const SUPPORTED_TOPIC_CODE_LANGUAGES = ['cpp', 'java', 'javascript', 'lua', 'python', 'ruby'];
const SUPPORTED_LANGUAGE_SET = new Set(SUPPORTED_TOPIC_CODE_LANGUAGES);
const LANGUAGE_ALIASES = {
  cplusplus: 'cpp',
  'c++': 'cpp',
  cpp: 'cpp',
  java: 'java',
  javascript: 'javascript',
  js: 'javascript',
  lua: 'lua',
  python: 'python',
  python3: 'python',
  py: 'python',
  ruby: 'ruby',
  rb: 'ruby',
};
const EXTENSION_LANGUAGES = {
  '.cpp': 'cpp',
  '.java': 'java',
  '.js': 'javascript',
  '.lua': 'lua',
  '.py': 'python',
  '.rb': 'ruby',
};

const prismLanguageReady = loadLanguages(
  Prism,
  SUPPORTED_TOPIC_CODE_LANGUAGES,
  new URL('../../../vendor/prism-v2', import.meta.url).href,
);

function normalizeLanguageToken(language) {
  return String(language ?? '')
    .trim()
    .toLowerCase()
    .replace(/^language-/, '')
    .replace(/^lang-/, '');
}

export function normalizeTopicCodeLanguage(language) {
  const normalized = normalizeLanguageToken(language);
  const alias = LANGUAGE_ALIASES[normalized] ?? normalized;

  return SUPPORTED_LANGUAGE_SET.has(alias) ? alias : '';
}

export function isSupportedTopicCodeLanguage(language) {
  return Boolean(normalizeTopicCodeLanguage(language));
}

export function getTopicCodeLanguageForPath(path, fallbackLanguage = '') {
  const fallback = normalizeTopicCodeLanguage(fallbackLanguage);

  if (fallback) {
    return fallback;
  }

  const extension =
    String(path ?? '')
      .match(/\.[^./\\]+$/)?.[0]
      ?.toLowerCase() ?? '';

  return EXTENSION_LANGUAGES[extension] ?? '';
}

function getCodeElementLanguage(codeElement) {
  for (const className of codeElement.classList) {
    const language = normalizeTopicCodeLanguage(className);

    if (language) {
      return language;
    }
  }

  return normalizeTopicCodeLanguage(codeElement.dataset.language);
}

function setCodeElementLanguage(codeElement, language) {
  if (!language) {
    return;
  }

  codeElement.classList.add(`language-${language}`);
  codeElement.dataset.language = language;

  if (codeElement.parentElement?.tagName === 'PRE') {
    codeElement.parentElement.classList.add(`language-${language}`);
    codeElement.parentElement.dataset.language = language;
  }
}

export function applyTopicCodeLanguage(codeElement, language) {
  const normalizedLanguage = normalizeTopicCodeLanguage(language);
  setCodeElementLanguage(codeElement, normalizedLanguage);

  return normalizedLanguage;
}

export async function highlightTopicCodeBlocks(root = document) {
  await prismLanguageReady;

  const codeBlocks = root.querySelectorAll('pre code');
  for (const codeElement of codeBlocks) {
    const language = getCodeElementLanguage(codeElement);

    if (!language) {
      continue;
    }

    setCodeElementLanguage(codeElement, language);
    Prism.highlightElement(codeElement);
  }
}
