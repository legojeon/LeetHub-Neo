export function isLeetCodeUrl(url) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'https:' && /^leetcode\.(com|cn)$/.test(parsedUrl.hostname);
  } catch {
    return false;
  }
}

export function getLeetCodeProblemSlug(url) {
  try {
    const parsedUrl = new URL(url);
    if (!isLeetCodeUrl(url)) {
      return null;
    }

    const match = parsedUrl.pathname.match(/^\/problems\/([^/]+)(?:\/|$)/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

export function isLeetCodeProblemTabUrl(url) {
  try {
    const parsedUrl = new URL(url);
    if (!isLeetCodeUrl(url)) {
      return false;
    }

    return /^\/problems\/[^/]+\/(?:description\/?)?$/.test(parsedUrl.pathname);
  } catch {
    return false;
  }
}

export function normalizeTranslationText(text) {
  return String(text ?? '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{2,}/g, '\n')
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    .trim();
}

export function chunkTextForTranslation(text, maxChunkLength = 3500) {
  const normalizedText = normalizeTranslationText(text);
  if (!normalizedText) {
    return [];
  }

  const paragraphs = normalizedText.split('\n');
  const chunks = [];
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    const nextChunk = currentChunk ? `${currentChunk}\n${paragraph}` : paragraph;
    if (currentChunk && nextChunk.length > maxChunkLength) {
      chunks.push(currentChunk);
      currentChunk = paragraph;
    } else {
      currentChunk = nextChunk;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

export async function buildTranslationCacheKey(slug, sourceHtml, targetLanguage = 'ko') {
  const source = `${slug}:${sourceHtml}`;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(source));
  const hash = [...new Uint8Array(digest)]
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 16);
  const language = String(targetLanguage || 'ko').trim() || 'ko';

  return `translation-html:en-${language}:${slug}:${hash}`;
}
