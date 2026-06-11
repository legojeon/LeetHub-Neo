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
  const source = String(html ?? '');
  const blocks = [];
  const blockPattern = /<(p|pre|ul|ol)\b[^>]*>[\s\S]*?<\/\1>|<img\b[^>]*>/gi;
  let match;
  let lastIndex = 0;

  function pushIfContent(block) {
    if (stripHtml(block) || /<img\b/i.test(block)) {
      blocks.push(block);
    }
  }

  while ((match = blockPattern.exec(source))) {
    pushIfContent(source.slice(lastIndex, match.index));
    blocks.push(match[0]);
    lastIndex = blockPattern.lastIndex;
  }

  pushIfContent(source.slice(lastIndex));

  return blocks.length ? blocks : [source].filter(Boolean);
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

function createExampleContentBlock(block) {
  if (/^<pre\b/i.test(block)) {
    return {
      type: 'example_io',
      fields: parseExamplePre(block),
      html: block,
    };
  }

  if (/^<img\b/i.test(block)) {
    return {
      type: 'image',
      html: block,
    };
  }

  return {
    type: 'example_extra',
    html: block,
  };
}

function cloneExampleBlockForSections(block) {
  if (block.type === 'example_io') {
    return { type: 'fields', fields: block.fields };
  }
  if (block.type === 'image') {
    return { type: 'image', html: block.html };
  }

  return { type: 'html', html: block.html };
}

export function createDescriptionBlocks(sourceHtml) {
  const sourceBlocks = splitTopLevelBlocks(sourceHtml);
  const descriptionBlocks = [];
  let mode = 'problem';
  let exampleIndex = -1;

  for (const block of sourceBlocks) {
    const label = getBlockLabel(block);

    if (EXAMPLE_LABEL_PATTERN.test(label)) {
      exampleIndex += 1;
      mode = 'example';
      descriptionBlocks.push({
        type: 'example_title',
        exampleIndex,
        title: label,
        html: block,
      });
      continue;
    }

    if (CONSTRAINTS_LABEL_PATTERN.test(label)) {
      mode = 'constraints';
      descriptionBlocks.push({
        type: 'constraints_title',
        title: label,
        html: block,
      });
      continue;
    }

    if (mode === 'example') {
      descriptionBlocks.push({
        ...createExampleContentBlock(block),
        exampleIndex,
      });
      continue;
    }

    if (mode === 'constraints') {
      descriptionBlocks.push({
        type: 'constraints',
        html: block,
      });
      continue;
    }

    descriptionBlocks.push({
      type: 'problem',
      html: block,
    });
  }

  return descriptionBlocks.length
    ? descriptionBlocks
    : [
        {
          type: 'problem',
          html: String(sourceHtml ?? ''),
        },
      ];
}

export function createDescriptionSections(sourceHtml) {
  const blocks = createDescriptionBlocks(sourceHtml);
  const sections = {
    problemHtml: '',
    examples: [],
    constraintsHtml: '',
    fallbackHtml: String(sourceHtml ?? ''),
  };
  let currentExample = null;

  for (const block of blocks) {
    if (block.type === 'example_title') {
      currentExample = { title: block.title, fields: [], extraHtml: '' };
      Object.defineProperty(currentExample, 'contentBlocks', {
        value: [],
        enumerable: false,
      });
      sections.examples.push(currentExample);
      continue;
    }

    if (block.type === 'constraints_title') {
      currentExample = null;
      continue;
    }

    if (block.type === 'example_io' && currentExample) {
      currentExample.fields.push(...block.fields);
      currentExample.contentBlocks.push(cloneExampleBlockForSections(block));
      continue;
    }

    if ((block.type === 'image' || block.type === 'example_extra') && currentExample) {
      currentExample.extraHtml += block.html;
      currentExample.contentBlocks.push(cloneExampleBlockForSections(block));
      continue;
    }

    if (block.type === 'constraints') {
      sections.constraintsHtml += block.html;
      continue;
    }

    if (block.type === 'problem') {
      sections.problemHtml += block.html;
      continue;
    }

    if (block.html) {
      if (currentExample) {
        currentExample.extraHtml += block.html;
        currentExample.contentBlocks.push({ type: 'html', html: block.html });
      } else {
        sections.problemHtml += block.html;
      }
    }
  }

  return sections;
}

function renderExampleField(field) {
  if (field.key === 'explanation') {
    return `<div class="example-field example-field-${field.key}"><span class="example-field-value example-field-value-muted">${field.html}</span></div>`;
  }

  return `<div class="example-field example-field-${field.key}"><span class="example-field-label">${field.label}</span><span class="example-field-value">${field.html}</span></div>`;
}

function renderExampleContentBlock(block) {
  if (block.type === 'fields') {
    return block.fields.map(renderExampleField).join('');
  }
  if (block.type === 'image') {
    return block.html ? `<div class="description-card-media">${block.html}</div>` : '';
  }

  return block.html ? `<div class="description-card-body">${block.html}</div>` : '';
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
    const orderedContentHtml = example.contentBlocks.length
      ? example.contentBlocks.map(renderExampleContentBlock).join('')
      : `${example.fields.map(renderExampleField).join('')}${
          example.extraHtml ? `<div class="description-card-body">${example.extraHtml}</div>` : ''
        }`;
    exampleCards.push(
      `<section class="description-card description-card-example"><h3 class="description-card-title">${example.title}</h3>${orderedContentHtml}</section>`,
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
