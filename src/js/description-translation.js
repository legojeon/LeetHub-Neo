const SKIP_TEXT_TAGS = new Set(['code', 'kbd', 'math', 'samp', 'script', 'style', 'svg', 'var']);

const LABEL_TRANSLATIONS = [
  {
    pattern: /^Example\s+(\d+):$/i,
    translate: match => `예시 ${match[1]}:`,
    key: 'example',
  },
  {
    pattern: /^Constraints:$/i,
    translate: () => '제약 조건:',
    key: 'constraints',
  },
  {
    pattern: /^Input:$/i,
    translate: () => '입력:',
    key: 'input',
  },
  {
    pattern: /^Output:$/i,
    translate: () => '출력:',
    key: 'output',
  },
  {
    pattern: /^Explanation:$/i,
    translate: () => '설명:',
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

function translateKnownLabel(text) {
  const { leading, core, trailing } = splitTextPadding(text);

  for (const label of LABEL_TRANSLATIONS) {
    const match = core.match(label.pattern);
    if (match) {
      return {
        labelKey: label.key,
        html: `${escapeHtml(leading)}${escapeHtml(label.translate(match))}${escapeHtml(trailing)}`,
      };
    }
  }

  return null;
}

async function translateTextToken(text, translateText) {
  if (isWhitespaceText(text)) {
    return text;
  }

  const knownLabel = translateKnownLabel(text);
  if (knownLabel) {
    return knownLabel.html;
  }

  const { leading, core, trailing } = splitTextPadding(text);
  if (!core) {
    return text;
  }

  const translatedText = await translateText(core);
  return `${escapeHtml(leading)}${escapeHtml(translatedText)}${escapeHtml(trailing)}`;
}

async function translatePreTextToken(text, translateText, preState) {
  if (isWhitespaceText(text)) {
    return text;
  }

  const knownLabel = translateKnownLabel(text);
  if (knownLabel) {
    preState.lastLabel = knownLabel.labelKey;
    return knownLabel.html;
  }

  if (preState.lastLabel !== 'explanation') {
    return text;
  }

  const translated = await translateTextToken(text, translateText);
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

export async function translateDescriptionHtml(sourceHtml, translateText) {
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
      output.push(await translatePreTextToken(token, translateText, preState));
      continue;
    }

    output.push(await translateTextToken(token, translateText));
  }

  return output.join('');
}
