import { TRANSLATION_SERVER_BASE_URL } from '../config/translation-server.js';

export { TRANSLATION_SERVER_BASE_URL };

function cleanBaseUrl(apiBaseUrl) {
  return String(apiBaseUrl || TRANSLATION_SERVER_BASE_URL).replace(/\/+$/, '');
}

function normalizeProblemField(value) {
  return String(value ?? '').trim();
}

export async function buildTranslationSourceHash(slug, sourceHtml) {
  const source = `${normalizeProblemField(slug)}:${String(sourceHtml ?? '')}`;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(source));
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

async function readErrorMessage(response) {
  try {
    const payload = await response.json();
    return payload?.message || payload?.error || `Translation server returned ${response.status}`;
  } catch {
    return `Translation server returned ${response.status}`;
  }
}

export async function buildProblemTranslationRequestBody(problem, { targetLanguage = 'ko' } = {}) {
  const descriptionHtml = String(problem?.descriptionHtml ?? '');
  const description = problem?.description ?? {
    html: descriptionHtml,
    blocks: problem?.descriptionBlocks ?? null,
    sections: problem?.descriptionSections ?? null,
  };

  return {
    site: normalizeProblemField(problem?.site) || 'leetcode.com',
    slug: normalizeProblemField(problem?.slug),
    frontendId: normalizeProblemField(problem?.frontendId),
    title: normalizeProblemField(problem?.title),
    sourceLanguage: 'en',
    targetLanguage: normalizeProblemField(targetLanguage) || 'ko',
    sourceHash: await buildTranslationSourceHash(problem?.slug, descriptionHtml),
    descriptionHtml,
    description,
  };
}

export async function requestProblemTranslation(
  problem,
  {
    targetLanguage = 'ko',
    fetchImpl = globalThis.fetch,
    apiBaseUrl = TRANSLATION_SERVER_BASE_URL,
  } = {},
) {
  if (!fetchImpl) {
    throw new Error('Fetch API is not available.');
  }

  const body = await buildProblemTranslationRequestBody(problem, { targetLanguage });

  const response = await fetchImpl(`${cleanBaseUrl(apiBaseUrl)}/api/v1/problem-translations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const payload = await response.json();
  if (!payload?.translatedHtml) {
    throw new Error('Translation server response did not include translatedHtml.');
  }

  return payload;
}

export async function requestProblemTranslationReview(
  problem,
  {
    targetLanguage = 'ko',
    translatedHtml = '',
    translatedDescription = null,
    reason = 'bad_translation',
    note = '',
    fetchImpl = globalThis.fetch,
    apiBaseUrl = TRANSLATION_SERVER_BASE_URL,
  } = {},
) {
  if (!fetchImpl) {
    throw new Error('Fetch API is not available.');
  }

  const body = {
    ...(await buildProblemTranslationRequestBody(problem, { targetLanguage })),
    translatedHtml: String(translatedHtml ?? ''),
    translatedDescription,
    reason,
    note,
  };

  const response = await fetchImpl(
    `${cleanBaseUrl(apiBaseUrl)}/api/v1/problem-translations/retry`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response.json();
}
