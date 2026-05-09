export function getLeetCodeProblemSlug(url) {
  try {
    const parsedUrl = new URL(url);
    if (!/leetcode\.(com|cn)$/.test(parsedUrl.hostname)) {
      return null;
    }

    const match = parsedUrl.pathname.match(/^\/problems\/([^/]+)(?:\/|$)/);
    return match?.[1] ?? null;
  } catch (_error) {
    return null;
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

export async function buildTranslationCacheKey(slug, sourceHtml) {
  const source = `${slug}:${sourceHtml}`;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(source));
  const hash = [...new Uint8Array(digest)]
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 16);

  return `translation:en-ko:${slug}:${hash}`;
}
