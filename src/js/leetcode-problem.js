function getLeetHubKRBaseUrl() {
  const hostname = window.location.hostname;
  return `https://${hostname.includes('leetcode.cn') ? 'leetcode.cn' : 'leetcode.com'}`;
}

function getCurrentProblemSlug() {
  const match = window.location.pathname.match(/^\/problems\/([^/]+)(?:\/|$)/);
  return match?.[1] ?? null;
}

function htmlToPlainText(html) {
  const template = document.createElement('template');
  template.innerHTML = html ?? '';
  return template.content.textContent.replace(/\s+\n/g, '\n').replace(/\n\s+/g, '\n').trim();
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

  const response = await fetch(`${getLeetHubKRBaseUrl()}/graphql/`, {
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

  return {
    slug: question.titleSlug,
    title: question.title,
    frontendId: question.questionFrontendId,
    difficulty: question.difficulty,
    topicTags: question.topicTags ?? [],
    descriptionHtml: question.content ?? '',
    descriptionText: htmlToPlainText(question.content ?? ''),
  };
}

function getProblemFromDomFallback(slug) {
  const metaDescription = document.querySelector('meta[name="description"]')?.content ?? '';
  const pageTitle = document.title.split(' - ')[0] || slug;

  if (!metaDescription) {
    throw new Error('Could not find problem description on the page.');
  }

  return {
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

  try {
    const problem = await fetchProblemBySlug(slug);
    return { ok: true, problem };
  } catch (error) {
    try {
      return { ok: true, problem: getProblemFromDomFallback(slug) };
    } catch (_fallbackError) {
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
