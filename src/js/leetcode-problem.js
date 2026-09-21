function getLeetHubNeoBaseUrl() {
  const hostname = window.location.hostname;
  return `https://${hostname.includes('leetcode.cn') ? 'leetcode.cn' : 'leetcode.com'}`;
}

function getCurrentProblemSlug() {
  const match = window.location.pathname.match(/^\/problems\/([^/]+)(?:\/|$)/);
  return match?.[1] ?? null;
}

function getCurrentLeetCodeSite() {
  return window.location.hostname.includes('leetcode.cn') ? 'leetcode.cn' : 'leetcode.com';
}

function getCurrentEditorLanguage() {
  const languageNames = Object.keys(
    globalThis.LeetHubLeetCodeLanguages?.LEETCODE_LANGUAGE_EXTENSIONS ?? {},
  );
  const languageElements = [
    ...document.querySelectorAll('[data-cy="lang-select"]'),
    ...document.querySelectorAll('button[id^="headlessui-listbox-button"]'),
    ...document.querySelectorAll('.ant-select-selection-selected-value, .Select-value-label'),
  ];

  for (const element of languageElements) {
    const values = [
      element.textContent,
      element.getAttribute('aria-label'),
      element.getAttribute('title'),
      element.getAttribute('data-value'),
    ];

    for (const value of values) {
      const normalizedValue = String(value ?? '')
        .trim()
        .toLowerCase();
      const language = languageNames.find(name => name.toLowerCase() === normalizedValue);
      if (language) {
        return language;
      }
    }
  }

  return '';
}

function detectCurrentEditorLanguage(timeoutMs = 1200) {
  const currentLanguage = getCurrentEditorLanguage();
  if (currentLanguage || !document.documentElement) {
    return Promise.resolve(currentLanguage);
  }

  return new Promise(resolve => {
    let settled = false;
    const finish = language => {
      if (settled) {
        return;
      }
      settled = true;
      observer.disconnect();
      clearTimeout(timeoutId);
      resolve(language);
    };
    const observer = new MutationObserver(() => {
      const language = getCurrentEditorLanguage();
      if (language) {
        finish(language);
      }
    });
    const timeoutId = setTimeout(() => finish(''), timeoutMs);
    observer.observe(document.documentElement, {
      attributes: true,
      characterData: true,
      childList: true,
      subtree: true,
    });
  });
}

function htmlToPlainText(html) {
  const template = document.createElement('template');
  template.innerHTML = html ?? '';
  return template.content.textContent.replace(/\s+\n/g, '\n').replace(/\n\s+/g, '\n').trim();
}

function toAbsoluteLeetCodeUrl(value) {
  const source = String(value ?? '').trim();
  if (!source) {
    return '';
  }

  try {
    return new URL(source, getLeetHubNeoBaseUrl()).href;
  } catch {
    return source;
  }
}

function normalizeSrcset(srcset) {
  return String(srcset ?? '')
    .split(',')
    .map(candidate => {
      const parts = candidate.trim().split(/\s+/);
      if (!parts[0]) {
        return '';
      }

      return [toAbsoluteLeetCodeUrl(parts[0]), ...parts.slice(1)].join(' ');
    })
    .filter(Boolean)
    .join(', ');
}

function removeImageSizingStyles(image) {
  image.removeAttribute('width');
  image.removeAttribute('height');

  const style = image.getAttribute('style');
  if (!style) {
    return;
  }

  const nextStyle = style
    .split(';')
    .map(rule => rule.trim())
    .filter(rule => rule && !/^width\s*:/i.test(rule) && !/^height\s*:/i.test(rule))
    .join('; ');

  if (nextStyle) {
    image.setAttribute('style', nextStyle);
  } else {
    image.removeAttribute('style');
  }
}

function normalizeDescriptionHtml(html) {
  const template = document.createElement('template');
  template.innerHTML = html ?? '';

  for (const image of template.content.querySelectorAll('img')) {
    const source =
      image.getAttribute('src') ||
      image.getAttribute('data-src') ||
      image.getAttribute('data-original') ||
      image.getAttribute('data-actualsrc');
    const srcset = image.getAttribute('srcset') || image.getAttribute('data-srcset');

    if (source) {
      image.setAttribute('src', toAbsoluteLeetCodeUrl(source));
    }
    if (srcset) {
      image.setAttribute('srcset', normalizeSrcset(srcset));
    }
    if (!image.getAttribute('alt')) {
      image.setAttribute('alt', '');
    }
    removeImageSizingStyles(image);
    image.setAttribute('decoding', 'async');
    image.setAttribute('loading', 'lazy');
  }

  return template.innerHTML;
}

async function fetchProblemBySlug(slug) {
  const query = `
query questionDetail($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    title
    titleSlug
    questionFrontendId
    difficulty
    content
    topicTags {
      name
      slug
    }
  }
}`;

  const response = await fetch(`${getLeetHubNeoBaseUrl()}/graphql/`, {
    method: 'POST',
    headers: {
      cookie: document.cookie,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: { titleSlug: slug },
      operationName: 'questionDetail',
    }),
  });

  if (!response.ok) {
    throw new Error(`LeetCode GraphQL request failed: ${response.status}`);
  }

  const payload = await response.json();
  if (payload.errors?.length) {
    throw new Error(payload.errors.map(error => error.message).join('; '));
  }

  const question = payload.data?.question;
  if (!question) {
    throw new Error('LeetCode did not return question data.');
  }

  const descriptionHtml = normalizeDescriptionHtml(question.content ?? '');

  return {
    site: getCurrentLeetCodeSite(),
    slug: question.titleSlug,
    title: question.title,
    frontendId: question.questionFrontendId,
    difficulty: question.difficulty,
    topicTags: question.topicTags ?? [],
    descriptionHtml,
    descriptionText: htmlToPlainText(descriptionHtml),
  };
}

function getProblemFromDomFallback(slug) {
  const metaDescription = document.querySelector('meta[name="description"]')?.content ?? '';
  const pageTitle = document.title.split(' - ')[0] || slug;

  if (!metaDescription) {
    throw new Error('Could not find problem description on the page.');
  }

  return {
    site: getCurrentLeetCodeSite(),
    slug,
    title: pageTitle,
    frontendId: '',
    difficulty: 'unknown',
    topicTags: [],
    descriptionHtml: `<p>${metaDescription}</p>`,
    descriptionText: metaDescription,
  };
}

async function getCurrentLeetCodeProblem() {
  const slug = getCurrentProblemSlug();
  if (!slug) {
    return {
      ok: false,
      error: 'Open a LeetCode problem page to translate the description.',
    };
  }

  const editorLanguagePromise = detectCurrentEditorLanguage();
  try {
    const problem = await fetchProblemBySlug(slug);
    problem.editorLanguage = await editorLanguagePromise;
    return { ok: true, problem };
  } catch (error) {
    try {
      const problem = getProblemFromDomFallback(slug);
      problem.editorLanguage = await editorLanguagePromise;
      return { ok: true, problem };
    } catch {
      return { ok: false, error: error.message };
    }
  }
}

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request?.action !== 'getCurrentLeetCodeProblem') {
    return false;
  }

  getCurrentLeetCodeProblem()
    .then(sendResponse)
    .catch(error => sendResponse({ ok: false, error: error.message }));

  return true;
});
