const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
const SAVE_DELAY_MS = 250;
const MAX_HISTORY_LENGTH = 60;
const DEFAULT_INK_COLOR = '#1f2937';
const DEFAULT_STROKE_WIDTH = 6;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function createSvgNode(documentObject, tagName, attributes = {}) {
  const node = documentObject.createElementNS(SVG_NAMESPACE, tagName);
  for (const [name, value] of Object.entries(attributes)) {
    node.setAttribute(name, String(value));
  }
  return node;
}

function pointsToPath(points) {
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
}

function distanceToSegment(point, start, end) {
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;
  const lengthSquared = deltaX * deltaX + deltaY * deltaY;
  if (!lengthSquared) {
    return Math.hypot(point.x - start.x, point.y - start.y);
  }

  const ratio = clamp(
    ((point.x - start.x) * deltaX + (point.y - start.y) * deltaY) / lengthSquared,
    0,
    1,
  );
  const projection = {
    x: start.x + ratio * deltaX,
    y: start.y + ratio * deltaY,
  };
  return Math.hypot(point.x - projection.x, point.y - projection.y);
}

function elementContainsPoint(element, point) {
  const tolerance = 28;

  if (element.type === 'path') {
    return element.points.some((currentPoint, index) => {
      if (!index) {
        return false;
      }
      return distanceToSegment(point, element.points[index - 1], currentPoint) <= tolerance;
    });
  }

  if (element.type === 'arrow') {
    return (
      distanceToSegment(
        point,
        { x: element.x1, y: element.y1 },
        { x: element.x2, y: element.y2 },
      ) <= tolerance
    );
  }

  if (element.type === 'rect') {
    const left = Math.min(element.x1, element.x2) - tolerance;
    const right = Math.max(element.x1, element.x2) + tolerance;
    const top = Math.min(element.y1, element.y2) - tolerance;
    const bottom = Math.max(element.y1, element.y2) + tolerance;
    return point.x >= left && point.x <= right && point.y >= top && point.y <= bottom;
  }

  if (element.type === 'ellipse') {
    const centerX = (element.x1 + element.x2) / 2;
    const centerY = (element.y1 + element.y2) / 2;
    const radiusX = Math.max(tolerance, Math.abs(element.x2 - element.x1) / 2 + tolerance);
    const radiusY = Math.max(tolerance, Math.abs(element.y2 - element.y1) / 2 + tolerance);
    const normalizedX = (point.x - centerX) / radiusX;
    const normalizedY = (point.y - centerY) / radiusY;
    return normalizedX * normalizedX + normalizedY * normalizedY <= 1;
  }

  if (element.type === 'text') {
    const estimatedWidth = Math.max(element.size, element.text.length * element.size * 0.62);
    return (
      point.x >= element.x - tolerance &&
      point.x <= element.x + estimatedWidth + tolerance &&
      point.y >= element.y - element.size - tolerance &&
      point.y <= element.y + tolerance
    );
  }

  return false;
}

function createElementId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return `sketch-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createScratchpadController({
  chromeApi = globalThis.chrome,
  documentObject = globalThis.document,
  windowObject = globalThis.window,
  scratchpadMemo = globalThis.LeetHubScratchpadMemo,
} = {}) {
  const textInput = documentObject.querySelector('#scratchpad-input');
  const addSketchButton = documentObject.querySelector('#scratchpad-add-sketch-btn');
  const saveStatus = documentObject.querySelector('#scratchpad-save-status');
  const sketchCard = documentObject.querySelector('#scratchpad-sketch-card');
  const sketchResizeHandle = documentObject.querySelector('#scratchpad-sketch-resize-handle');
  const sketchToggleButton = documentObject.querySelector('#scratchpad-sketch-toggle-btn');
  const sketchTitle = documentObject.querySelector('#scratchpad-sketch-title');
  const sketchRenameButton = documentObject.querySelector('#scratchpad-sketch-rename-btn');
  const sketchDeleteButton = documentObject.querySelector('#scratchpad-sketch-delete-btn');
  const sketchEditor = documentObject.querySelector('#scratchpad-sketch-editor');
  const sketchTabs = documentObject.querySelector('#scratchpad-sketch-tabs');
  const sketchTabAddButton = documentObject.querySelector('#scratchpad-sketch-tab-add-btn');
  const sketchSummary = documentObject.querySelector('#scratchpad-sketch-summary');
  const sketchChevron = documentObject.querySelector('#scratchpad-sketch-chevron');
  const sketchCanvas = documentObject.querySelector('#scratchpad-sketch-canvas');
  const sketchPreview = documentObject.querySelector('#scratchpad-sketch-preview');
  const sketchSurface = documentObject.querySelector('#scratchpad-sketch-surface');
  const sketchTextInput = documentObject.querySelector('#scratchpad-sketch-text-input');
  const undoButton = documentObject.querySelector('#scratchpad-sketch-undo-btn');
  const redoButton = documentObject.querySelector('#scratchpad-sketch-redo-btn');
  const clearButton = documentObject.querySelector('#scratchpad-sketch-clear-btn');
  const toolButtons = [...documentObject.querySelectorAll('[data-sketch-tool]')];

  if (!textInput || !scratchpadMemo) {
    return {
      activateProblem: async () => {},
      deactivate: async () => {},
      flush: async () => {},
      getDraftForUpload: async () => ({ text: '', sketches: [] }),
    };
  }

  let activeProblemSlug = '';
  let activeProblemSite = '';
  let activeStorageKey = '';
  let activationSequence = 0;
  let draft = scratchpadMemo.normalizeScratchpadDraft(null);
  let currentTool = 'pen';
  let activePointerId = null;
  let activeElementId = '';
  let saveTimer = null;
  let statusTimer = null;
  let undoHistory = [];
  let redoHistory = [];
  let textPlacement = null;
  let resizeState = null;
  let panState = null;
  let renamingSketchId = '';
  let renderedTabsSignature = '';
  let transitionPromise = Promise.resolve();

  function currentSketch() {
    return (
      draft.sketches.find(sketch => sketch.id === draft.activeSketchId) ?? draft.sketches[0] ?? null
    );
  }

  function setSaveStatus(message) {
    if (!saveStatus) {
      return;
    }
    windowObject.clearTimeout(statusTimer);
    saveStatus.textContent = message;
    saveStatus.classList.toggle('visible', Boolean(message));
    if (message === 'Saved') {
      statusTimer = windowObject.setTimeout(() => {
        saveStatus.classList.remove('visible');
      }, 1100);
    }
  }

  function snapshotDraft() {
    return scratchpadMemo.normalizeScratchpadDraft({
      ...draft,
      text: textInput.value,
      updatedAt: Date.now(),
    });
  }

  async function persistDraft(storageKey, nextDraft) {
    if (!storageKey) {
      return;
    }
    if (scratchpadMemo.hasScratchpadContent(nextDraft)) {
      await chromeApi.storage.local.set({ [storageKey]: nextDraft });
    } else {
      await chromeApi.storage.local.remove(storageKey);
    }
  }

  async function flush() {
    windowObject.clearTimeout(saveTimer);
    saveTimer = null;
    if (!activeStorageKey) {
      return;
    }

    const storageKey = activeStorageKey;
    const nextDraft = snapshotDraft();
    draft = nextDraft;
    await persistDraft(storageKey, nextDraft);
    if (storageKey === activeStorageKey) {
      setSaveStatus('Saved');
    }
  }

  function scheduleSave() {
    if (!activeStorageKey) {
      return;
    }
    setSaveStatus('Saving…');
    windowObject.clearTimeout(saveTimer);
    saveTimer = windowObject.setTimeout(() => {
      flush().catch(error => {
        console.error('Could not save scratchpad draft.', error);
        setSaveStatus('Save failed');
      });
    }, SAVE_DELAY_MS);
  }

  function createMarker(target, markerId) {
    const definitions = createSvgNode(documentObject, 'defs');
    const marker = createSvgNode(documentObject, 'marker', {
      id: markerId,
      markerWidth: 32,
      markerHeight: 32,
      refX: 10,
      refY: 6,
      orient: 'auto',
      markerUnits: 'userSpaceOnUse',
      viewBox: '0 0 12 12',
    });
    marker.append(
      createSvgNode(documentObject, 'path', {
        d: 'M 0 0 L 12 6 L 0 12 z',
        fill: DEFAULT_INK_COLOR,
      }),
    );
    definitions.append(marker);
    target.append(definitions);
  }

  function renderElement(target, element, markerId) {
    const common = {
      fill: 'none',
      stroke: element.color,
      'stroke-width': element.width,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      'data-element-id': element.id,
    };
    let node;

    if (element.type === 'path') {
      node = createSvgNode(documentObject, 'path', {
        ...common,
        d: pointsToPath(element.points),
      });
    } else if (element.type === 'rect') {
      node = createSvgNode(documentObject, 'rect', {
        ...common,
        x: Math.min(element.x1, element.x2),
        y: Math.min(element.y1, element.y2),
        width: Math.abs(element.x2 - element.x1),
        height: Math.abs(element.y2 - element.y1),
        rx: 8,
      });
    } else if (element.type === 'ellipse') {
      node = createSvgNode(documentObject, 'ellipse', {
        ...common,
        cx: (element.x1 + element.x2) / 2,
        cy: (element.y1 + element.y2) / 2,
        rx: Math.abs(element.x2 - element.x1) / 2,
        ry: Math.abs(element.y2 - element.y1) / 2,
      });
    } else if (element.type === 'arrow') {
      node = createSvgNode(documentObject, 'line', {
        ...common,
        x1: element.x1,
        y1: element.y1,
        x2: element.x2,
        y2: element.y2,
        'marker-end': `url(#${markerId})`,
      });
    } else if (element.type === 'text') {
      node = createSvgNode(documentObject, 'text', {
        x: element.x,
        y: element.y,
        fill: element.color,
        'font-family': 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        'font-size': element.size,
        'data-element-id': element.id,
      });
      node.textContent = element.text;
    }

    if (node) {
      target.append(node);
    }
  }

  function renderIntoSvg(target, markerId, includeBackground) {
    if (!target) {
      return;
    }
    target.replaceChildren();
    if (includeBackground) {
      target.append(
        createSvgNode(documentObject, 'rect', {
          width: '100%',
          height: '100%',
          fill: '#ffffff',
        }),
      );
    }
    createMarker(target, markerId);
    for (const element of currentSketch()?.elements ?? []) {
      renderElement(target, element, markerId);
    }
  }

  function getCanvasViewportGeometry(zoom = currentSketch()?.viewport?.zoom ?? 1) {
    const sketch = currentSketch();
    const bounds = sketchCanvas.getBoundingClientRect();
    const aspectRatio =
      bounds.width > 0 && bounds.height > 0
        ? bounds.height / bounds.width
        : sketch.height / sketch.width;
    const width = sketch.width / zoom;
    const height = width * aspectRatio;
    return {
      bounds,
      width,
      height,
      x: sketch.viewport.centerX - width / 2,
      y: sketch.viewport.centerY - height / 2,
    };
  }

  function updateCanvasViewBox() {
    if (!currentSketch()) {
      return;
    }
    const viewport = getCanvasViewportGeometry();
    sketchCanvas.setAttribute(
      'viewBox',
      `${viewport.x} ${viewport.y} ${viewport.width} ${viewport.height}`,
    );
    if (viewport.bounds.width && viewport.bounds.height) {
      const gridSize = Math.max(8, (50 / viewport.width) * viewport.bounds.width);
      const gridOffsetX = (-viewport.x / viewport.width) * viewport.bounds.width;
      const gridOffsetY = (-viewport.y / viewport.height) * viewport.bounds.height;
      sketchCanvas.style.backgroundSize = `${gridSize}px ${gridSize}px`;
      sketchCanvas.style.backgroundPosition = `${gridOffsetX}px ${gridOffsetY}px`;
    }
  }

  function resetSketchInteraction() {
    activePointerId = null;
    activeElementId = '';
    panState = null;
    sketchCanvas.classList.remove('panning');
    hideTextInput();
    undoHistory = [];
    redoHistory = [];
  }

  function selectSketch(sketchId) {
    if (!draft.sketches.some(sketch => sketch.id === sketchId)) {
      return;
    }
    if (draft.activeSketchId !== sketchId) {
      resetSketchInteraction();
      draft.activeSketchId = sketchId;
      for (const tab of sketchTabs.querySelectorAll('.scratchpad-sketch-tab')) {
        const isActive = tab.dataset.sketchId === sketchId;
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', String(isActive));
        tab.tabIndex = isActive ? 0 : -1;
      }
      renderedTabsSignature = getSketchTabsSignature();
      renderSketch();
      scheduleSave();
    }
  }

  function finishSketchRename(sketchId, value, shouldSave) {
    if (renamingSketchId !== sketchId) {
      return;
    }
    const sketch = draft.sketches.find(item => item.id === sketchId);
    renamingSketchId = '';
    if (shouldSave && sketch) {
      const title = String(value ?? '')
        .trim()
        .slice(0, 60);
      if (title && title !== sketch.title) {
        sketch.title = title;
        scheduleSave();
      }
    }
    renderedTabsSignature = '';
    renderSketch();
  }

  function beginSketchRename(sketchId = currentSketch()?.id) {
    if (!sketchId || !draft.sketches.some(sketch => sketch.id === sketchId)) {
      return;
    }
    draft.activeSketchId = sketchId;
    renamingSketchId = sketchId;
    renderedTabsSignature = '';
    setExpanded(true);
    renderSketch();
    windowObject.requestAnimationFrame(() => {
      const input = sketchTabs.querySelector('[data-sketch-rename-id]');
      input?.focus();
      input?.select();
    });
  }

  function getSketchTabsSignature() {
    return JSON.stringify({
      activeSketchId: draft.activeSketchId,
      renamingSketchId,
      sketches: draft.sketches.map(sketch => [sketch.id, sketch.title]),
    });
  }

  function renderSketchTabs() {
    if (!sketchTabs) {
      return;
    }
    const signature = getSketchTabsSignature();
    if (signature === renderedTabsSignature) {
      return;
    }
    renderedTabsSignature = signature;
    sketchTabs.replaceChildren();

    for (const sketch of draft.sketches) {
      if (sketch.id === renamingSketchId) {
        const input = documentObject.createElement('input');
        input.className = 'scratchpad-sketch-tab-rename-input';
        input.value = sketch.title;
        input.maxLength = 60;
        input.setAttribute('aria-label', 'Sketch name');
        input.dataset.sketchRenameId = sketch.id;
        input.addEventListener('keydown', event => {
          if (event.key === 'Enter') {
            event.preventDefault();
            finishSketchRename(sketch.id, input.value, true);
          } else if (event.key === 'Escape') {
            event.preventDefault();
            finishSketchRename(sketch.id, sketch.title, false);
          }
        });
        input.addEventListener('blur', () => finishSketchRename(sketch.id, input.value, true));
        sketchTabs.append(input);
        continue;
      }

      const tab = documentObject.createElement('button');
      const isActive = sketch.id === draft.activeSketchId;
      tab.type = 'button';
      tab.className = `scratchpad-sketch-tab${isActive ? ' active' : ''}`;
      tab.dataset.sketchId = sketch.id;
      tab.textContent = sketch.title;
      tab.title = `${sketch.title} — double-click to rename`;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
      tab.addEventListener('click', () => selectSketch(sketch.id));
      tab.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
          return;
        }
        event.preventDefault();
        const currentIndex = draft.sketches.findIndex(item => item.id === sketch.id);
        const nextIndex =
          event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? draft.sketches.length - 1
              : (currentIndex + (event.key === 'ArrowRight' ? 1 : -1) + draft.sketches.length) %
                draft.sketches.length;
        const nextSketch = draft.sketches[nextIndex];
        selectSketch(nextSketch.id);
        [...sketchTabs.querySelectorAll('.scratchpad-sketch-tab')]
          .find(item => item.dataset.sketchId === nextSketch.id)
          ?.focus();
      });
      tab.addEventListener('dblclick', event => {
        event.preventDefault();
        beginSketchRename(sketch.id);
      });
      sketchTabs.append(tab);
    }
  }

  function renderSketch() {
    const sketch = currentSketch();
    const hasSketch = Boolean(sketch);
    sketchCard.hidden = !hasSketch;
    addSketchButton.hidden = hasSketch;

    if (!hasSketch) {
      renderedTabsSignature = '';
      sketchTabs?.replaceChildren();
      return;
    }

    draft.activeSketchId = sketch.id;
    sketchCard.style.flexBasis = `${sketch.panelHeight}px`;
    if (sketchTitle) {
      sketchTitle.textContent = 'Sketches';
    }
    renderSketchTabs();
    const previewBounds = scratchpadMemo.getSketchContentBounds(sketch);
    sketchPreview.setAttribute(
      'viewBox',
      `${previewBounds.x} ${previewBounds.y} ${previewBounds.width} ${previewBounds.height}`,
    );
    sketchCanvas.dataset.tool = currentTool;
    renderIntoSvg(sketchCanvas, 'scratchpad-arrowhead-canvas', false);
    renderIntoSvg(sketchPreview, 'scratchpad-arrowhead-preview', true);
    updateCanvasViewBox();

    const count = sketch.elements.length;
    const sketchCount = draft.sketches.length;
    const elementSummary = count ? `${count} element${count === 1 ? '' : 's'}` : 'Empty';
    sketchSummary.textContent = `${sketchCount} sketch${sketchCount === 1 ? '' : 'es'} · ${elementSummary}`;
    undoButton.disabled = !undoHistory.length;
    redoButton.disabled = !redoHistory.length;
    clearButton.disabled = !count;
    for (const button of toolButtons) {
      const isActive = button.dataset.sketchTool === currentTool;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    }
  }

  function setExpanded(isExpanded) {
    sketchCard.classList.toggle('collapsed', !isExpanded);
    sketchToggleButton.setAttribute('aria-expanded', String(isExpanded));
    if (sketchChevron) {
      sketchChevron.textContent = isExpanded ? '⌄' : '⌃';
    }
    if (isExpanded) {
      windowObject.requestAnimationFrame(() => {
        updateCanvasViewBox();
        sketchCanvas.focus({ preventScroll: true });
      });
    }
  }

  function pushUndoState() {
    undoHistory.push(clone(currentSketch()?.elements ?? []));
    if (undoHistory.length > MAX_HISTORY_LENGTH) {
      undoHistory.shift();
    }
    redoHistory = [];
  }

  function applyHistory(elements) {
    const sketch = currentSketch();
    if (!sketch) {
      return;
    }
    sketch.elements = clone(elements);
    renderSketch();
    scheduleSave();
  }

  function undo() {
    const previous = undoHistory.pop();
    if (!previous) {
      return;
    }
    redoHistory.push(clone(currentSketch().elements));
    applyHistory(previous);
  }

  function redo() {
    const next = redoHistory.pop();
    if (!next) {
      return;
    }
    undoHistory.push(clone(currentSketch().elements));
    applyHistory(next);
  }

  function eventToSketchPoint(event) {
    const viewport = getCanvasViewportGeometry();
    return {
      x:
        viewport.x +
        ((event.clientX - viewport.bounds.left) / viewport.bounds.width) * viewport.width,
      y:
        viewport.y +
        ((event.clientY - viewport.bounds.top) / viewport.bounds.height) * viewport.height,
    };
  }

  function findElementAtPoint(point) {
    const elements = currentSketch()?.elements ?? [];
    for (let index = elements.length - 1; index >= 0; index -= 1) {
      if (elementContainsPoint(elements[index], point)) {
        return elements[index];
      }
    }
    return null;
  }

  function hideTextInput() {
    sketchTextInput.hidden = true;
    sketchTextInput.value = '';
    textPlacement = null;
  }

  function commitTextInput() {
    if (!textPlacement) {
      return;
    }
    const text = sketchTextInput.value.trim();
    const placement = textPlacement;
    hideTextInput();
    if (!text) {
      return;
    }

    pushUndoState();
    currentSketch().elements.push({
      id: createElementId(),
      type: 'text',
      x: placement.x,
      y: placement.y + 32,
      text,
      size: 34,
      color: DEFAULT_INK_COLOR,
      width: DEFAULT_STROKE_WIDTH,
    });
    renderSketch();
    scheduleSave();
  }

  function showTextInput(event, point) {
    const surfaceBounds = sketchSurface.getBoundingClientRect();
    textPlacement = point;
    sketchTextInput.style.left = `${event.clientX - surfaceBounds.left + sketchSurface.scrollLeft}px`;
    sketchTextInput.style.top = `${event.clientY - surfaceBounds.top + sketchSurface.scrollTop}px`;
    sketchTextInput.hidden = false;
    sketchTextInput.value = '';
    windowObject.requestAnimationFrame(() => sketchTextInput.focus());
  }

  function beginDrawing(event) {
    if (event.button !== 0 || !currentSketch()) {
      return;
    }
    const point = eventToSketchPoint(event);

    if (currentTool === 'pan') {
      const viewport = getCanvasViewportGeometry();
      panState = {
        pointerId: event.pointerId,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startCenterX: currentSketch().viewport.centerX,
        startCenterY: currentSketch().viewport.centerY,
        unitsPerPixelX: viewport.width / viewport.bounds.width,
        unitsPerPixelY: viewport.height / viewport.bounds.height,
      };
      activePointerId = event.pointerId;
      sketchCanvas.classList.add('panning');
      sketchCanvas.setPointerCapture(event.pointerId);
      event.preventDefault();
      return;
    }

    if (currentTool === 'eraser') {
      const target = findElementAtPoint(point);
      if (target) {
        pushUndoState();
        currentSketch().elements = currentSketch().elements.filter(
          element => element.id !== target.id,
        );
        renderSketch();
        scheduleSave();
      }
      return;
    }

    if (currentTool === 'text') {
      showTextInput(event, point);
      return;
    }

    pushUndoState();
    const element = {
      id: createElementId(),
      type: currentTool,
      color: DEFAULT_INK_COLOR,
      width: DEFAULT_STROKE_WIDTH,
    };
    if (currentTool === 'pen') {
      element.type = 'path';
      element.points = [point];
    } else {
      Object.assign(element, { x1: point.x, y1: point.y, x2: point.x, y2: point.y });
    }

    currentSketch().elements.push(element);
    activeElementId = element.id;
    activePointerId = event.pointerId;
    sketchCanvas.setPointerCapture(event.pointerId);
    renderSketch();
    event.preventDefault();
  }

  function continueDrawing(event) {
    if (event.pointerId !== activePointerId) {
      return;
    }

    if (panState) {
      currentSketch().viewport.centerX =
        panState.startCenterX - (event.clientX - panState.startClientX) * panState.unitsPerPixelX;
      currentSketch().viewport.centerY =
        panState.startCenterY - (event.clientY - panState.startClientY) * panState.unitsPerPixelY;
      updateCanvasViewBox();
      event.preventDefault();
      return;
    }

    if (!activeElementId) {
      return;
    }
    const element = currentSketch().elements.find(item => item.id === activeElementId);
    if (!element) {
      return;
    }
    const point = eventToSketchPoint(event);
    if (element.type === 'path') {
      const previous = element.points[element.points.length - 1];
      if (Math.hypot(point.x - previous.x, point.y - previous.y) < 3) {
        return;
      }
      element.points.push(point);
    } else {
      element.x2 = point.x;
      element.y2 = point.y;
    }
    renderSketch();
    event.preventDefault();
  }

  function finishDrawing(event) {
    if (event.pointerId !== activePointerId) {
      return;
    }

    if (panState) {
      panState = null;
      activePointerId = null;
      sketchCanvas.classList.remove('panning');
      scheduleSave();
      return;
    }

    if (!activeElementId) {
      return;
    }
    const sketch = currentSketch();
    const element = sketch.elements.find(item => item.id === activeElementId);
    const isTinyPath = element?.type === 'path' && element.points.length < 2;
    const isTinyShape =
      element?.type !== 'path' &&
      element?.type !== 'text' &&
      Math.hypot(element.x2 - element.x1, element.y2 - element.y1) < 8;
    if (isTinyPath || isTinyShape) {
      sketch.elements = sketch.elements.filter(item => item.id !== activeElementId);
      undoHistory.pop();
    } else {
      scheduleSave();
    }
    activeElementId = '';
    activePointerId = null;
    renderSketch();
  }

  function zoomSketch(event) {
    if (!currentSketch()) {
      return;
    }
    event.preventDefault();
    const oldViewport = getCanvasViewportGeometry();
    if (!oldViewport.bounds.width || !oldViewport.bounds.height) {
      return;
    }

    const relativeX = (event.clientX - oldViewport.bounds.left) / oldViewport.bounds.width;
    const relativeY = (event.clientY - oldViewport.bounds.top) / oldViewport.bounds.height;
    const anchorX = oldViewport.x + relativeX * oldViewport.width;
    const anchorY = oldViewport.y + relativeY * oldViewport.height;
    const zoomFactor = Math.exp(-event.deltaY * 0.0015);
    const nextZoom = clamp(currentSketch().viewport.zoom * zoomFactor, 0.25, 4);
    const nextViewport = getCanvasViewportGeometry(nextZoom);

    currentSketch().viewport.zoom = nextZoom;
    currentSketch().viewport.centerX = anchorX + (0.5 - relativeX) * nextViewport.width;
    currentSketch().viewport.centerY = anchorY + (0.5 - relativeY) * nextViewport.height;
    updateCanvasViewBox();
    scheduleSave();
  }

  async function performActivateProblem(problem) {
    const nextSlug = scratchpadMemo.normalizeProblemSlug(problem?.slug);
    const nextSite = scratchpadMemo.normalizeLeetCodeSite(problem?.site);
    if (!nextSlug || (nextSlug === activeProblemSlug && nextSite === activeProblemSite)) {
      return;
    }

    windowObject.clearTimeout(saveTimer);
    saveTimer = null;
    const previousStorageKey = activeStorageKey;
    const previousDraft = previousStorageKey ? snapshotDraft() : null;
    const sequence = ++activationSequence;
    activeProblemSlug = nextSlug;
    activeProblemSite = nextSite;
    activeStorageKey = scratchpadMemo.createScratchpadStorageKey(nextSlug, nextSite);
    if (previousStorageKey) {
      await persistDraft(previousStorageKey, previousDraft);
    }
    const values = await chromeApi.storage.local.get(activeStorageKey);
    if (sequence !== activationSequence) {
      return;
    }

    draft = scratchpadMemo.normalizeScratchpadDraft(values[activeStorageKey]);
    textInput.value = draft.text;
    undoHistory = [];
    redoHistory = [];
    renamingSketchId = '';
    renderedTabsSignature = '';
    hideTextInput();
    setExpanded(true);
    renderSketch();
    setSaveStatus('');
  }

  async function performDeactivate() {
    windowObject.clearTimeout(saveTimer);
    saveTimer = null;
    const previousStorageKey = activeStorageKey;
    const previousDraft = previousStorageKey ? snapshotDraft() : null;
    activationSequence += 1;
    activeProblemSlug = '';
    activeProblemSite = '';
    activeStorageKey = '';
    draft = scratchpadMemo.normalizeScratchpadDraft(null);
    textInput.value = '';
    undoHistory = [];
    redoHistory = [];
    renamingSketchId = '';
    renderedTabsSignature = '';
    renderSketch();
    if (previousStorageKey) {
      await persistDraft(previousStorageKey, previousDraft);
    }
  }

  async function getDraftForUpload(problemSlug, problemSite) {
    await transitionPromise;
    const normalizedSlug = scratchpadMemo.normalizeProblemSlug(problemSlug);
    const normalizedSite = scratchpadMemo.normalizeLeetCodeSite(problemSite);
    let uploadDraft;
    if (
      normalizedSlug &&
      normalizedSlug === activeProblemSlug &&
      normalizedSite === activeProblemSite
    ) {
      await flush();
      uploadDraft = snapshotDraft();
    } else {
      const storageKey = scratchpadMemo.createScratchpadStorageKey(normalizedSlug, normalizedSite);
      const values = storageKey ? await chromeApi.storage.local.get(storageKey) : {};
      uploadDraft = scratchpadMemo.normalizeScratchpadDraft(values[storageKey]);
    }

    return {
      text: uploadDraft.text,
      sketches: uploadDraft.sketches
        .map(sketch => ({
          filename: sketch.filename,
          title: sketch.title,
          content: scratchpadMemo.serializeSketchToSvg(sketch),
        }))
        .filter(sketch => sketch.content),
    };
  }

  function queueTransition(callback) {
    transitionPromise = transitionPromise.catch(() => {}).then(callback);
    return transitionPromise;
  }

  function activateProblem(problem) {
    return queueTransition(() => performActivateProblem(problem));
  }

  function deactivate() {
    return queueTransition(performDeactivate);
  }

  textInput.addEventListener('input', () => {
    draft.text = textInput.value;
    scheduleSave();
  });

  function addSketch() {
    const sketchNumber = draft.nextSketchNumber;
    const sketch = scratchpadMemo.createEmptySketch(sketchNumber);
    draft.nextSketchNumber += 1;
    draft.sketches.push(sketch);
    draft.activeSketchId = sketch.id;
    resetSketchInteraction();
    renderedTabsSignature = '';
    setExpanded(true);
    renderSketch();
    scheduleSave();
  }

  addSketchButton.addEventListener('click', addSketch);
  sketchTabAddButton.addEventListener('click', addSketch);

  sketchToggleButton.addEventListener('click', () => {
    setExpanded(sketchCard.classList.contains('collapsed'));
  });

  sketchRenameButton.addEventListener('click', () => beginSketchRename());

  sketchDeleteButton.addEventListener('click', () => {
    if (
      currentSketch()?.elements.length &&
      !windowObject.confirm('Delete this sketch? This cannot be undone after it is saved.')
    ) {
      return;
    }
    const activeIndex = draft.sketches.findIndex(sketch => sketch.id === draft.activeSketchId);
    draft.sketches = draft.sketches.filter(sketch => sketch.id !== draft.activeSketchId);
    draft.activeSketchId =
      draft.sketches[Math.min(activeIndex, draft.sketches.length - 1)]?.id || '';
    renamingSketchId = '';
    renderedTabsSignature = '';
    resetSketchInteraction();
    renderSketch();
    scheduleSave();
  });

  for (const button of toolButtons) {
    button.addEventListener('click', () => {
      currentTool = button.dataset.sketchTool;
      hideTextInput();
      renderSketch();
      sketchCanvas.focus({ preventScroll: true });
    });
  }

  undoButton.addEventListener('click', undo);
  redoButton.addEventListener('click', redo);
  clearButton.addEventListener('click', () => {
    if (!currentSketch()?.elements.length || !windowObject.confirm('Clear every sketch element?')) {
      return;
    }
    pushUndoState();
    currentSketch().elements = [];
    renderSketch();
    scheduleSave();
  });

  sketchCanvas.addEventListener('pointerdown', beginDrawing);
  sketchCanvas.addEventListener('pointermove', continueDrawing);
  sketchCanvas.addEventListener('pointerup', finishDrawing);
  sketchCanvas.addEventListener('pointercancel', finishDrawing);
  sketchCanvas.addEventListener('wheel', zoomSketch, { passive: false });

  sketchTextInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commitTextInput();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      hideTextInput();
      sketchCanvas.focus({ preventScroll: true });
    }
  });
  sketchTextInput.addEventListener('blur', commitTextInput);

  sketchEditor.addEventListener('keydown', event => {
    if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'z') {
      return;
    }
    event.preventDefault();
    if (event.shiftKey) {
      redo();
    } else {
      undo();
    }
  });

  sketchResizeHandle.addEventListener('pointerdown', event => {
    if (sketchCard.classList.contains('collapsed')) {
      return;
    }
    resizeState = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startHeight: sketchCard.getBoundingClientRect().height,
    };
    sketchResizeHandle.setPointerCapture(event.pointerId);
    event.preventDefault();
  });
  sketchResizeHandle.addEventListener('pointermove', event => {
    if (!resizeState || resizeState.pointerId !== event.pointerId) {
      return;
    }
    const maximumHeight = Math.max(260, windowObject.innerHeight - 150);
    const height = clamp(
      resizeState.startHeight - (event.clientY - resizeState.startY),
      240,
      maximumHeight,
    );
    sketchCard.style.flexBasis = `${height}px`;
    currentSketch().panelHeight = Math.round(height);
  });
  sketchResizeHandle.addEventListener('pointerup', event => {
    if (!resizeState || resizeState.pointerId !== event.pointerId) {
      return;
    }
    resizeState = null;
    scheduleSave();
  });
  sketchResizeHandle.addEventListener('keydown', event => {
    if (!['ArrowUp', 'ArrowDown'].includes(event.key) || !currentSketch()) {
      return;
    }
    event.preventDefault();
    const direction = event.key === 'ArrowUp' ? 20 : -20;
    currentSketch().panelHeight = clamp(currentSketch().panelHeight + direction, 240, 720);
    renderSketch();
    scheduleSave();
  });

  windowObject.addEventListener('pagehide', () => {
    flush().catch(error => console.error('Could not flush scratchpad draft.', error));
  });

  const canvasResizeObserver = new ResizeObserver(() => updateCanvasViewBox());
  canvasResizeObserver.observe(sketchCanvas);

  renderSketch();

  return {
    activateProblem,
    deactivate,
    flush,
    getDraftForUpload,
  };
}
