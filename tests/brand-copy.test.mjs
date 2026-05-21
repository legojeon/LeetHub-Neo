import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { extname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('../', import.meta.url));
const textExtensions = new Set(['.css', '.html', '.js', '.json', '.md', '.mjs']);
const skippedDirectories = new Set(['.git', '.superpowers', 'node_modules']);
const skippedPrefixes = [
  ['src', 'js', 'static'].join(sep),
  ['src', 'templates'].join(sep),
  ['src', 'vendor'].join(sep),
];

const brandRoot = 'LeetHub';
const oldSuffix = 'KR';
const oldDashedBrand = [brandRoot, oldSuffix].join('-');
const oldCompactBrand = [brandRoot, oldSuffix].join('');
const oldLowerDashedBrand = oldDashedBrand.toLowerCase();
const oldUpperDashedBrand = oldDashedBrand.toUpperCase();

const oldBrandPatterns = [
  new RegExp(oldDashedBrand),
  new RegExp([brandRoot, 'Kr'].join('-')),
  new RegExp(oldUpperDashedBrand),
  new RegExp(oldLowerDashedBrand),
  new RegExp(oldCompactBrand),
  new RegExp(['get', oldCompactBrand].join('')),
  new RegExp(['ping', oldCompactBrand].join('')),
  new RegExp(`<\\/span>${['', oldSuffix].join('-')}`),
];

async function collectTextFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (skippedDirectories.has(entry.name)) {
        continue;
      }

      const childDirectory = join(directory, entry.name);
      const relativeDirectory = relative(repoRoot, childDirectory);
      if (skippedPrefixes.some(prefix => relativeDirectory.startsWith(prefix))) {
        continue;
      }

      files.push(...(await collectTextFiles(childDirectory)));
      continue;
    }

    if (entry.name === 'brand-copy.test.mjs') {
      continue;
    }

    if (entry.isFile() && textExtensions.has(extname(entry.name))) {
      files.push(join(directory, entry.name));
    }
  }

  return files;
}

const textFiles = await collectTextFiles(repoRoot);
let sawNeoBrand = false;

for (const filePath of textFiles) {
  const content = await readFile(filePath, 'utf8');
  const displayPath = relative(repoRoot, filePath);

  if (
    content.includes('LeetHub-Neo') ||
    content.includes('leethub-neo') ||
    content.includes('</span>-Neo')
  ) {
    sawNeoBrand = true;
  }

  for (const pattern of oldBrandPatterns) {
    assert.doesNotMatch(
      content,
      pattern,
      `${displayPath} still contains old ${oldDashedBrand} branding`,
    );
  }
}

assert.equal(sawNeoBrand, true);

console.log('brand copy tests passed');
