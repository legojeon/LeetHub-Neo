const EXAMPLE_LABEL_PATTERN = /^(?:Example\s+\d+:|예시\s+\d+:|\[[^\]]+:Example\s+\d+:\])$/i;
const CONSTRAINTS_LABEL_PATTERN = /^(?:Constraints:|제약 조건:|\[[^\]]+:Constraints:\])$/i;
const FIELD_LABEL_PATTERN =
  /^(Input:|Output:|Explanation:|입력:|출력:|설명:|\[[^\]]+:(?:Input|Output|Explanation):\])$/i;

function stripHtml(html) {
  return String(html ?? '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function getBlockLabel(blockHtml) {
  return stripHtml(blockHtml).replace(/\s+/g, ' ');
}

function splitTopLevelBlocks(html) {
  const blocks = [];
  const blockPattern = /<(p|pre|ul|ol)\b[^>]*>[\s\S]*?<\/\1>/gi;
  let match;

  while ((match = blockPattern.exec(String(html ?? '')))) {
    blocks.push(match[0]);
  }

  return blocks.length ? blocks : [String(html ?? '')].filter(Boolean);
}

function normalizeFieldKey(label) {
  const text = label.toLowerCase();

  if (text.includes('input') || text.includes('입력')) {
    return 'input';
  }
  if (text.includes('output') || text.includes('출력')) {
    return 'output';
  }
  if (text.includes('explanation') || text.includes('설명')) {
    return 'explanation';
  }

  return 'other';
}

function trimBreaks(html) {
  return String(html ?? '')
    .replace(/^\s*<br\s*\/?>/i, '')
    .replace(/<br\s*\/?>\s*$/i, '')
    .trim();
}

function parseExamplePre(preHtml) {
  const body = String(preHtml ?? '')
    .replace(/^<pre\b[^>]*>/i, '')
    .replace(/<\/pre>$/i, '');
  const segments = body.split(/(<strong>[\s\S]*?<\/strong>)/i).filter(Boolean);
  const fields = [];
  let currentField = null;

  for (const segment of segments) {
    if (/^<strong>[\s\S]*?<\/strong>$/i.test(segment)) {
      const label = getBlockLabel(segment);

      if (FIELD_LABEL_PATTERN.test(label)) {
        currentField = {
          key: normalizeFieldKey(label),
          label,
          html: '',
        };
        fields.push(currentField);
        continue;
      }
    }

    if (currentField) {
      currentField.html += segment;
    }
  }

  return fields.map(field => ({
    ...field,
    html: trimBreaks(field.html),
  }));
}

export function createDescriptionSections(sourceHtml) {
  const blocks = splitTopLevelBlocks(sourceHtml);
  const sections = {
    problemHtml: '',
    examples: [],
    constraintsHtml: '',
    fallbackHtml: String(sourceHtml ?? ''),
  };
  let mode = 'problem';
  let currentExample = null;

  for (const block of blocks) {
    const label = getBlockLabel(block);

    if (EXAMPLE_LABEL_PATTERN.test(label)) {
      currentExample = { title: label, fields: [], extraHtml: '' };
      sections.examples.push(currentExample);
      mode = 'example';
      continue;
    }

    if (CONSTRAINTS_LABEL_PATTERN.test(label)) {
      currentExample = null;
      mode = 'constraints';
      continue;
    }

    if (mode === 'example' && currentExample) {
      if (/^<pre\b/i.test(block)) {
        currentExample.fields.push(...parseExamplePre(block));
      } else {
        currentExample.extraHtml += block;
      }
      continue;
    }

    if (mode === 'constraints') {
      sections.constraintsHtml += block;
      continue;
    }

    sections.problemHtml += block;
  }

  return sections;
}

function renderExampleField(field) {
  if (field.key === 'explanation') {
    return `<div class="example-field example-field-${field.key}"><span class="example-field-value example-field-value-muted">${field.html}</span></div>`;
  }

  return `<div class="example-field example-field-${field.key}"><span class="example-field-label">${field.label}</span><span class="example-field-value">${field.html}</span></div>`;
}

export function renderStructuredDescriptionHtml(sourceHtml) {
  const sections = createDescriptionSections(sourceHtml);
  const cards = [];
  const exampleCards = [];

  if (sections.problemHtml.trim()) {
    cards.push(
      `<section class="description-card description-card-problem"><h3 class="description-card-title">Problem</h3><div class="description-card-body">${sections.problemHtml}</div></section>`,
    );
  }

  for (const example of sections.examples) {
    const fieldsHtml = example.fields.map(renderExampleField).join('');
    const extraHtml = example.extraHtml
      ? `<div class="description-card-body">${example.extraHtml}</div>`
      : '';
    exampleCards.push(
      `<section class="description-card description-card-example"><h3 class="description-card-title">${example.title}</h3>${fieldsHtml}${extraHtml}</section>`,
    );
  }

  if (exampleCards.length) {
    cards.push(`<div class="description-example-group">${exampleCards.join('')}</div>`);
  }

  if (sections.constraintsHtml.trim()) {
    cards.push(
      `<section class="description-card description-card-constraints"><h3 class="description-card-title">Constraints</h3><div class="description-card-body">${sections.constraintsHtml}</div></section>`,
    );
  }

  return cards.length ? cards.join('') : sections.fallbackHtml;
}
