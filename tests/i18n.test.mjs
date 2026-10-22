import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = relativePath =>
  JSON.parse(readFileSync(path.join(projectRoot, relativePath), 'utf8'));

const englishMessages = readJson('_locales/en/messages.json');
const koreanMessages = readJson('_locales/ko/messages.json');

function placeholderNames(entry) {
  return Object.keys(entry.placeholders ?? {}).sort();
}

function messagePlaceholderNames(entry) {
  return [...entry.message.matchAll(/\$([A-Z0-9_]+)\$/g)]
    .map(match => match[1].toLowerCase())
    .sort();
}

test('English and Korean locale catalogs have matching messages and placeholders', () => {
  assert.deepEqual(Object.keys(koreanMessages).sort(), Object.keys(englishMessages).sort());

  for (const [key, englishEntry] of Object.entries(englishMessages)) {
    const koreanEntry = koreanMessages[key];
    assert.ok(englishEntry.message, `${key} is missing an English message`);
    assert.ok(koreanEntry.message, `${key} is missing a Korean message`);
    assert.deepEqual(
      placeholderNames(koreanEntry),
      placeholderNames(englishEntry),
      `${key} has different locale placeholders`,
    );
    assert.deepEqual(
      messagePlaceholderNames(englishEntry),
      placeholderNames(englishEntry),
      `${key} has an invalid English placeholder declaration`,
    );
    assert.deepEqual(
      messagePlaceholderNames(koreanEntry),
      placeholderNames(koreanEntry),
      `${key} has an invalid Korean placeholder declaration`,
    );
  }
});

test('manifest enables Chrome extension localization', () => {
  const manifest = readJson('manifest.json');

  assert.equal(manifest.default_locale, 'en');
  assert.equal(manifest.name, '__MSG_extensionName__');
  assert.equal(manifest.description, '__MSG_extensionDescription__');
  assert.equal(manifest.action.default_title, '__MSG_actionTitle__');
});

test('literal UI message keys referenced by the localization layer exist', () => {
  const sourceFiles = [
    'src/js/i18n.js',
    'src/js/sidepanel.js',
    'src/js/popup.js',
    'src/js/welcome.js',
    'src/features/shared/settings/topic-template-settings.js',
    'src/features/shared/settings/translation-language-settings.js',
    'src/features/sidepanel/scratchpad/scratchpad-controller.js',
  ];
  const referencedKeys = new Set();

  for (const relativePath of sourceFiles) {
    const source = readFileSync(path.join(projectRoot, relativePath), 'utf8');
    for (const match of source.matchAll(/\b(?:t|getMessage)\(\s*['"]([A-Za-z0-9_]+)['"]/g)) {
      referencedKeys.add(match[1]);
    }
  }

  const staticSource = readFileSync(path.join(projectRoot, 'src/js/i18n.js'), 'utf8');
  const staticMap = staticSource.slice(
    staticSource.indexOf('const STATIC_KEY_BY_TEXT'),
    staticSource.indexOf('\n  });'),
  );
  for (const match of staticMap.matchAll(/:\s*['"]([A-Za-z0-9_]+)['"]/g)) {
    referencedKeys.add(match[1]);
  }

  const missingKeys = [...referencedKeys].filter(key => !englishMessages[key]).sort();
  assert.deepEqual(missingKeys, []);
});
