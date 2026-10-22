import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createSketchHistoryStore,
  getSketchHistoryAction,
  getSketchHistoryShortcutLabels,
} from '../src/features/sidepanel/scratchpad/scratchpad-controller.js';

test('sketch histories remain isolated by sketch id', () => {
  const store = createSketchHistoryStore();

  store.getUndoHistory('sketch-a').push(['a']);
  store.getRedoHistory('sketch-a').push(['redo-a']);
  store.getUndoHistory('sketch-b').push(['b']);

  assert.deepEqual(store.getUndoHistory('sketch-a'), [['a']]);
  assert.deepEqual(store.getRedoHistory('sketch-a'), [['redo-a']]);
  assert.deepEqual(store.getUndoHistory('sketch-b'), [['b']]);
  assert.deepEqual(store.getRedoHistory('sketch-b'), []);
});

test('sketch history can be cleared for one sketch or every sketch', () => {
  const store = createSketchHistoryStore();
  store.getUndoHistory('sketch-a').push(['a']);
  store.getRedoHistory('sketch-a').push(['redo-a']);
  store.getUndoHistory('sketch-b').push(['b']);

  store.clear('sketch-a');
  assert.deepEqual(store.getUndoHistory('sketch-a'), []);
  assert.deepEqual(store.getRedoHistory('sketch-a'), []);
  assert.deepEqual(store.getUndoHistory('sketch-b'), [['b']]);

  store.clear();
  assert.deepEqual(store.getUndoHistory('sketch-b'), []);
});

test('history keyboard shortcuts support Windows, Linux, and macOS conventions', () => {
  const target = { tagName: 'SVG', isContentEditable: false };

  assert.equal(getSketchHistoryAction({ target, key: 'z', ctrlKey: true }), 'undo');
  assert.equal(getSketchHistoryAction({ target, key: 'Z', ctrlKey: true, shiftKey: true }), 'redo');
  assert.equal(getSketchHistoryAction({ target, key: 'y', ctrlKey: true }), 'redo');
  assert.equal(getSketchHistoryAction({ target, key: 'z', metaKey: true }), 'undo');
  assert.equal(getSketchHistoryAction({ target, key: 'x', ctrlKey: true }), '');
  assert.equal(getSketchHistoryAction({ target, key: 'z' }), '');
});

test('history shortcuts leave text editing undo and redo untouched', () => {
  for (const target of [
    { tagName: 'INPUT' },
    { tagName: 'TEXTAREA' },
    { tagName: 'SELECT' },
    { tagName: 'DIV', isContentEditable: true },
  ]) {
    assert.equal(getSketchHistoryAction({ target, key: 'z', ctrlKey: true }), '');
  }
});

test('history shortcut labels match the current platform', () => {
  assert.deepEqual(getSketchHistoryShortcutLabels('MacIntel'), {
    undo: '⌘Z',
    redo: '⇧⌘Z',
  });
  assert.deepEqual(getSketchHistoryShortcutLabels('Win32'), {
    undo: 'Ctrl+Z',
    redo: 'Ctrl+Y / Ctrl+Shift+Z',
  });
});
