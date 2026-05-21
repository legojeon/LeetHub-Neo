const SKIP_TEXT_TAGS = new Set(['code', 'kbd', 'math', 'samp', 'script', 'style', 'svg', 'var']);

const KOREAN_LABEL_TRANSLATIONS = {
  constraints: () => '제약 조건:',
  example: match => `예시 ${match[1]}:`,
  explanation: () => '설명:',
  input: () => '입력:',
  output: () => '출력:',
};

const LABEL_TRANSLATIONS = [
  {
    pattern: /^Example\s+(\d+):$/i,
    key: 'example',
  },
  {
    pattern: /^Constraints:$/i,
    key: 'constraints',
  },
  {
    pattern: /^Input:$/i,
    key: 'input',
  },
  {
    pattern: /^Output:$/i,
    key: 'output',
  },
  {
    pattern: /^Explanation:$/i,
    key: 'explanation',
  },
];

function parseTagName(tagToken) {
  const match = tagToken.match(/^<\/?\s*([a-zA-Z0-9-]+)/);
  return match?.[1]?.toLowerCase() ?? null;
}

function isClosingTag(tagToken) {
  return /^<\//.test(tagToken);
}

function isSelfClosingTag(tagToken) {
  return /\/\s*>$/.test(tagToken) || /^<(br|hr|img|input|meta|link)\b/i.test(tagToken);
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function decodeCommonEntities(text) {
  return String(text)
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function isWhitespaceText(text) {
  return !decodeCommonEntities(text).trim();
}

function splitTextPadding(text) {
  const decodedText = decodeCommonEntities(text);
  const leading = decodedText.match(/^\s*/)[0];
  const trailing = decodedText.match(/\s*$/)[0];
  return {
    leading,
    core: decodedText.slice(leading.length, decodedText.length - trailing.length),
    trailing,
  };
}

function findKnownLabel(text) {
  const { leading, core, trailing } = splitTextPadding(text);

  for (const label of LABEL_TRANSLATIONS) {
    const match = core.match(label.pattern);
    if (match) {
      return {
        labelKey: label.key,
        leading,
        core,
        trailing,
        match,
      };
    }
  }

  return null;
}

async function translateKnownLabel(label, translateText, targetLanguage) {
  const translatedLabel =
    targetLanguage === 'ko'
      ? KOREAN_LABEL_TRANSLATIONS[label.labelKey](label.match)
      : await translateText(label.core);

  return `${escapeHtml(label.leading)}${escapeHtml(translatedLabel)}${escapeHtml(label.trailing)}`;
}

async function translateTextToken(text, translateText, targetLanguage) {
  if (isWhitespaceText(text)) {
    return text;
  }

  const knownLabel = findKnownLabel(text);
  if (knownLabel) {
    return translateKnownLabel(knownLabel, translateText, targetLanguage);
  }

  const { leading, core, trailing } = splitTextPadding(text);
  if (!core) {
    return text;
  }

  const translatedText = await translateText(core);
  return `${escapeHtml(leading)}${escapeHtml(translatedText)}${escapeHtml(trailing)}`;
}

async function translatePreTextToken(text, translateText, preState, targetLanguage) {
  if (isWhitespaceText(text)) {
    return text;
  }

  const knownLabel = findKnownLabel(text);
  if (knownLabel) {
    preState.lastLabel = knownLabel.labelKey;
    return translateKnownLabel(knownLabel, translateText, targetLanguage);
  }

  if (preState.lastLabel !== 'explanation') {
    return text;
  }

  const translated = await translateTextToken(text, translateText, targetLanguage);
  preState.lastLabel = null;
  return translated;
}

function updateTagStack(tagStack, tagToken) {
  const tagName = parseTagName(tagToken);
  if (!tagName || isSelfClosingTag(tagToken)) {
    return;
  }

  if (isClosingTag(tagToken)) {
    const lastIndex = tagStack.lastIndexOf(tagName);
    if (lastIndex >= 0) {
      tagStack.splice(lastIndex, tagStack.length - lastIndex);
    }
    return;
  }

  tagStack.push(tagName);
}

export async function translateDescriptionHtml(
  sourceHtml,
  translateText,
  { targetLanguage = 'ko' } = {},
) {
  if (targetLanguage === 'en') {
    return String(sourceHtml ?? '');
  }

  const tokens = String(sourceHtml ?? '').split(/(<[^>]+>)/g);
  const tagStack = [];
  const preState = { lastLabel: null };
  const output = [];

  for (const token of tokens) {
    if (!token) {
      continue;
    }

    if (token.startsWith('<')) {
      output.push(token);
      updateTagStack(tagStack, token);
      continue;
    }

    if (tagStack.some(tagName => SKIP_TEXT_TAGS.has(tagName))) {
      output.push(token);
      continue;
    }

    if (tagStack.includes('pre')) {
      output.push(await translatePreTextToken(token, translateText, preState, targetLanguage));
      continue;
    }

    output.push(await translateTextToken(token, translateText, targetLanguage));
  }

  return output.join('');
}
