(function initializeScratchpadMemo(globalObject) {
  const SCRATCHPAD_DRAFT_VERSION = 1;
  const SCRATCHPAD_STORAGE_PREFIX = 'scratchpadDraft:v1:';
  const DEFAULT_SKETCH_WIDTH = 1000;
  const DEFAULT_SKETCH_HEIGHT = 600;

  function normalizeScratchpadText(text) {
    return String(text ?? '').trim();
  }

  function formatScratchpadMemo(text) {
    const normalizedText = normalizeScratchpadText(text);

    if (!normalizedText) {
      return '';
    }

    return `${normalizedText}\n`;
  }

  function normalizeProblemSlug(problemSlug) {
    return String(problemSlug ?? '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function normalizeLeetCodeSite(site) {
    return String(site ?? '').includes('leetcode.cn') ? 'leetcode.cn' : 'leetcode.com';
  }

  function createScratchpadStorageKey(problemSlug, site = 'leetcode.com') {
    const normalizedSlug = normalizeProblemSlug(problemSlug);
    return normalizedSlug
      ? `${SCRATCHPAD_STORAGE_PREFIX}${normalizeLeetCodeSite(site)}:${normalizedSlug}`
      : '';
  }

  function finiteNumber(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function normalizePoint(point) {
    return {
      x: finiteNumber(point?.x, 0),
      y: finiteNumber(point?.y, 0),
    };
  }

  function normalizeSketchElement(element, index) {
    const type = ['path', 'rect', 'ellipse', 'arrow', 'text'].includes(element?.type)
      ? element.type
      : '';
    if (!type) {
      return null;
    }

    const normalized = {
      id: String(element.id || `element-${index + 1}`),
      type,
      color: String(element.color || '#1f2937'),
      width: Math.max(1, finiteNumber(element.width, 6)),
    };

    if (type === 'path') {
      const points = Array.isArray(element.points) ? element.points.map(normalizePoint) : [];
      return points.length > 1 ? { ...normalized, points } : null;
    }

    if (type === 'text') {
      const text = String(element.text ?? '').trim();
      return text
        ? {
            ...normalized,
            x: finiteNumber(element.x, 0),
            y: finiteNumber(element.y, 0),
            text,
            size: Math.max(12, finiteNumber(element.size, 34)),
          }
        : null;
    }

    return {
      ...normalized,
      x1: finiteNumber(element.x1, 0),
      y1: finiteNumber(element.y1, 0),
      x2: finiteNumber(element.x2, 0),
      y2: finiteNumber(element.y2, 0),
    };
  }

  function getSketchFilename(sketchNumber) {
    const normalizedNumber = Math.max(1, Math.floor(finiteNumber(sketchNumber, 1)));
    return normalizedNumber === 1 ? 'sketch.svg' : `sketch-${normalizedNumber}.svg`;
  }

  function getSketchNumber(sketch, fallback) {
    const filenameMatch = String(sketch?.filename ?? '').match(/^sketch(?:-(\d+))?\.svg$/);
    if (filenameMatch) {
      return filenameMatch[1] ? Number.parseInt(filenameMatch[1], 10) : 1;
    }

    const idMatch = String(sketch?.id ?? '').match(/^sketch-(\d+)$/);
    return idMatch ? Number.parseInt(idMatch[1], 10) : fallback;
  }

  function createEmptySketch(sketchNumber = 1) {
    const normalizedNumber = Math.max(1, Math.floor(finiteNumber(sketchNumber, 1)));
    return {
      id: `sketch-${normalizedNumber}`,
      filename: getSketchFilename(normalizedNumber),
      title: `Sketch ${normalizedNumber}`,
      width: DEFAULT_SKETCH_WIDTH,
      height: DEFAULT_SKETCH_HEIGHT,
      panelHeight: 360,
      viewport: {
        centerX: DEFAULT_SKETCH_WIDTH / 2,
        centerY: DEFAULT_SKETCH_HEIGHT / 2,
        zoom: 1,
      },
      elements: [],
    };
  }

  function normalizeSketch(sketch, index = 0) {
    const sketchNumber = getSketchNumber(sketch, index + 1);
    const emptySketch = createEmptySketch(sketchNumber);
    const title = String(sketch?.title ?? '').trim();
    return {
      id: String(sketch?.id || emptySketch.id),
      filename: getSketchFilename(sketchNumber),
      title: title || emptySketch.title,
      width: Math.max(100, finiteNumber(sketch?.width, emptySketch.width)),
      height: Math.max(100, finiteNumber(sketch?.height, emptySketch.height)),
      panelHeight: Math.min(720, Math.max(240, finiteNumber(sketch?.panelHeight, 360))),
      viewport: {
        centerX: finiteNumber(sketch?.viewport?.centerX, emptySketch.viewport.centerX),
        centerY: finiteNumber(sketch?.viewport?.centerY, emptySketch.viewport.centerY),
        zoom: Math.min(4, Math.max(0.25, finiteNumber(sketch?.viewport?.zoom, 1))),
      },
      elements: Array.isArray(sketch?.elements)
        ? sketch.elements.map(normalizeSketchElement).filter(Boolean)
        : [],
    };
  }

  function normalizeScratchpadDraft(draft) {
    const sketches = Array.isArray(draft?.sketches) ? draft.sketches.map(normalizeSketch) : [];
    const activeSketchId = sketches.some(sketch => sketch.id === draft?.activeSketchId)
      ? String(draft.activeSketchId)
      : sketches[0]?.id || '';
    const highestSketchNumber = sketches.reduce(
      (highest, sketch, index) => Math.max(highest, getSketchNumber(sketch, index + 1)),
      0,
    );

    return {
      version: SCRATCHPAD_DRAFT_VERSION,
      text: String(draft?.text ?? ''),
      sketches,
      activeSketchId,
      nextSketchNumber: Math.max(
        highestSketchNumber + 1,
        Math.floor(finiteNumber(draft?.nextSketchNumber, 1)),
      ),
      updatedAt: finiteNumber(draft?.updatedAt, 0),
    };
  }

  function hasSketchContent(sketch) {
    return normalizeSketch(sketch).elements.length > 0;
  }

  function hasScratchpadContent(draft) {
    const normalized = normalizeScratchpadDraft(draft);
    return Boolean(normalizeScratchpadText(normalized.text) || normalized.sketches.length);
  }

  function escapeXml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  function pointsToPath(points) {
    return points
      .map(
        (point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`,
      )
      .join(' ');
  }

  function getSketchContentBounds(sketch) {
    const normalized = normalizeSketch(sketch);
    let minX = 0;
    let minY = 0;
    let maxX = normalized.width;
    let maxY = normalized.height;
    const includePoint = (x, y) => {
      minX = Math.min(minX, x - 30);
      minY = Math.min(minY, y - 30);
      maxX = Math.max(maxX, x + 30);
      maxY = Math.max(maxY, y + 30);
    };

    for (const element of normalized.elements) {
      if (element.type === 'path') {
        element.points.forEach(point => includePoint(point.x, point.y));
      } else if (element.type === 'text') {
        includePoint(element.x, element.y - element.size);
        includePoint(element.x + element.text.length * element.size * 0.62, element.y);
      } else {
        includePoint(element.x1, element.y1);
        includePoint(element.x2, element.y2);
      }
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  function serializeElement(element) {
    const color = escapeXml(element.color);
    const common = `fill="none" stroke="${color}" stroke-width="${element.width}" stroke-linecap="round" stroke-linejoin="round"`;

    if (element.type === 'path') {
      return `<path d="${pointsToPath(element.points)}" ${common} />`;
    }

    if (element.type === 'rect') {
      const x = Math.min(element.x1, element.x2);
      const y = Math.min(element.y1, element.y2);
      const width = Math.abs(element.x2 - element.x1);
      const height = Math.abs(element.y2 - element.y1);
      return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="8" ${common} />`;
    }

    if (element.type === 'ellipse') {
      const cx = (element.x1 + element.x2) / 2;
      const cy = (element.y1 + element.y2) / 2;
      const rx = Math.abs(element.x2 - element.x1) / 2;
      const ry = Math.abs(element.y2 - element.y1) / 2;
      return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" ${common} />`;
    }

    if (element.type === 'arrow') {
      return `<line x1="${element.x1}" y1="${element.y1}" x2="${element.x2}" y2="${element.y2}" ${common} marker-end="url(#arrowhead)" />`;
    }

    if (element.type === 'text') {
      return `<text x="${element.x}" y="${element.y}" fill="${color}" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="${element.size}">${escapeXml(element.text)}</text>`;
    }

    return '';
  }

  function serializeSketchToSvg(sketch) {
    const normalized = normalizeSketch(sketch);
    if (!normalized.elements.length) {
      return '';
    }

    const bounds = getSketchContentBounds(normalized);
    const elements = normalized.elements.map(serializeElement).join('\n  ');
    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      `<svg xmlns="http://www.w3.org/2000/svg" width="${bounds.width}" height="${bounds.height}" viewBox="${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}">`,
      `  <rect x="${bounds.x}" y="${bounds.y}" width="${bounds.width}" height="${bounds.height}" fill="#ffffff" />`,
      '  <defs><marker id="arrowhead" markerWidth="32" markerHeight="32" refX="10" refY="6" orient="auto" markerUnits="userSpaceOnUse" viewBox="0 0 12 12"><path d="M 0 0 L 12 6 L 0 12 z" fill="#1f2937" /></marker></defs>',
      `  ${elements}`,
      '</svg>',
      '',
    ].join('\n');
  }

  globalObject.LeetHubScratchpadMemo = {
    DEFAULT_SKETCH_HEIGHT,
    DEFAULT_SKETCH_WIDTH,
    SCRATCHPAD_DRAFT_VERSION,
    SCRATCHPAD_STORAGE_PREFIX,
    createEmptySketch,
    createScratchpadStorageKey,
    formatScratchpadMemo,
    getSketchContentBounds,
    hasScratchpadContent,
    hasSketchContent,
    normalizeLeetCodeSite,
    normalizeProblemSlug,
    normalizeScratchpadDraft,
    normalizeSketch,
    normalizeScratchpadText,
    serializeSketchToSvg,
  };
})(globalThis);
