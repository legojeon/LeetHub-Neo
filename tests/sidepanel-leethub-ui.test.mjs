import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import {
  createActivityGridItems,
  createDifficultyDonutStyle,
  createDifficultyStatItems,
  createTopTagItems,
  getLeetHubSubviewVisibility,
  normalizeLeetHubSubview,
} from '../src/features/sidepanel/leethub/leethub-view-state.js';

assert.equal(normalizeLeetHubSubview('home'), 'home');
assert.equal(normalizeLeetHubSubview('settings'), 'settings');
assert.equal(normalizeLeetHubSubview('unknown'), 'home');
assert.equal(normalizeLeetHubSubview(undefined), 'home');

assert.deepEqual(getLeetHubSubviewVisibility('home'), {
  homeHidden: false,
  settingsHidden: true,
});
assert.deepEqual(getLeetHubSubviewVisibility('settings'), {
  homeHidden: true,
  settingsHidden: false,
});
assert.deepEqual(getLeetHubSubviewVisibility('unknown'), {
  homeHidden: false,
  settingsHidden: true,
});

assert.deepEqual(createDifficultyStatItems({ easy: 2, medium: 3, hard: 4 }), [
  { key: 'easy', label: 'Easy', value: 2 },
  { key: 'medium', label: 'Med', value: 3 },
  { key: 'hard', label: 'Hard', value: 4 },
]);

assert.deepEqual(createDifficultyStatItems({}), [
  { key: 'easy', label: 'Easy', value: 0 },
  { key: 'medium', label: 'Med', value: 0 },
  { key: 'hard', label: 'Hard', value: 0 },
]);

assert.equal(
  createDifficultyDonutStyle({ easy: 2, medium: 1, hard: 1 }),
  'conic-gradient(var(--lh-easy) 0% 50%, var(--lh-medium) 50% 75%, var(--lh-hard) 75% 100%)',
);
assert.equal(createDifficultyDonutStyle({}), 'conic-gradient(var(--lh-border) 0% 100%)');

assert.deepEqual(
  createActivityGridItems(
    {
      '2026-05-11': 1,
      '2026-05-12': 2,
      '2026-05-13': 4,
    },
    {
      endDate: new Date('2026-05-13T12:00:00.000Z'),
      weeks: 1,
    },
  ),
  [
    { date: '2026-05-07', count: 0, level: 0 },
    { date: '2026-05-08', count: 0, level: 0 },
    { date: '2026-05-09', count: 0, level: 0 },
    { date: '2026-05-10', count: 0, level: 0 },
    { date: '2026-05-11', count: 1, level: 1 },
    { date: '2026-05-12', count: 2, level: 2 },
    { date: '2026-05-13', count: 4, level: 4 },
  ],
);

assert.deepEqual(
  createTopTagItems(
    {
      solved: 4,
      topTags: [
        { slug: 'array', name: 'Array', count: 3 },
        { slug: 'dynamic-programming', name: 'Dynamic Programming', count: 2 },
        { slug: 'graph', name: 'Graph', count: 1 },
      ],
    },
    2,
  ),
  [
    { slug: 'array', name: 'Array', count: 3, percentage: 75 },
    { slug: 'dynamic-programming', name: 'Dynamic Programming', count: 2, percentage: 50 },
  ],
);

const sidepanelHtml = await readFile(
  new URL('../src/html/sidepanel.html', import.meta.url),
  'utf8',
);
const welcomeHtml = await readFile(new URL('../src/html/welcome.html', import.meta.url), 'utf8');
const welcomeJs = await readFile(new URL('../src/js/welcome.js', import.meta.url), 'utf8');
const sidepanelJs = await readFile(new URL('../src/js/sidepanel.js', import.meta.url), 'utf8');
const sidepanelCss = await readFile(new URL('../src/css/sidepanel.css', import.meta.url), 'utf8');
const leethubCss = await readFile(
  new URL('../src/features/sidepanel/leethub/leethub.css', import.meta.url),
  'utf8',
);

assert.match(sidepanelHtml, /id="collapsible-translation-language-icon"/);
assert.match(sidepanelHtml, /id="collapsible-translation-language-container"/);
assert.match(sidepanelHtml, /id="collapsible-theme-icon"/);
assert.match(sidepanelHtml, /id="collapsible-theme-container"/);
assert.match(sidepanelHtml, /<input type="checkbox" id="use-dark-theme" \/>/);
assert.match(
  sidepanelHtml,
  /id="collapsible-translation-language-container"[\s\S]*class="collapsible-container leethub-setting-panel"/,
);
assert.match(sidepanelHtml, /<select id="translation-language" class="leethub-select">/);
assert.match(sidepanelHtml, /<select id="topic-template-language" class="leethub-select">/);
assert.match(sidepanelHtml, /id="problem-meta" class="translation-meta"/);
assert.match(sidepanelHtml, /id="scratchpad-tab"[\s\S]*>Scratchpad<\/button>/);
assert.match(sidepanelHtml, /id="scratchpad_mode"[\s\S]*id="scratchpad-input"/);
assert.match(
  sidepanelHtml,
  /id="scratchpad-input"[\s\S]*placeholder="Freely sketch notes, edge cases, or ideas\.\.\."/,
);
assert.match(sidepanelHtml, /id="translate-refresh-btn"[\s\S]*class="translation-icon-btn"/);
assert.match(sidepanelHtml, /id="topic-readme-edit-btn"[\s\S]*class="topic-readme-edit-btn"/);
assert.match(sidepanelHtml, /id="leethub_profile_summary"/);
assert.match(sidepanelHtml, /id="leethub_difficulty_donut"/);
assert.match(sidepanelHtml, /id="leethub_difficulty_donut"[\s\S]*id="p_solved"/);
assert.doesNotMatch(sidepanelHtml, /id="p_solved" class="leethub-stat-total"/);
assert.match(sidepanelHtml, /id="leethub_activity_grid"/);
assert.match(sidepanelHtml, /id="leethub_top_tags"/);
assert.match(leethubCss, /#title\s*\{[^}]*font-weight: 500;/);
assert.match(leethubCss, /\.leethub-difficulty-donut\s*\{[\s\S]*width: 190px;/);
assert.match(leethubCss, /\.leethub-difficulty-donut::after\s*\{[\s\S]*inset: 24px;/);
assert.match(leethubCss, /\.leethub-donut-value\s*\{[\s\S]*color: var\(--lh-brand\);/);
assert.match(leethubCss, /\.leethub-donut-value\s*\{[\s\S]*font-size: 44px;/);
assert.match(leethubCss, /\.leethub-difficulty-pill\.easy\s*\{[\s\S]*color: var\(--lh-easy\);/);
assert.match(leethubCss, /\.leethub-difficulty-pill\.medium\s*\{[\s\S]*color: var\(--lh-medium\);/);
assert.match(leethubCss, /\.leethub-difficulty-pill\.hard\s*\{[\s\S]*color: var\(--lh-hard\);/);
assert.match(leethubCss, /\.leethub-activity-grid\s*\{[\s\S]*width: 100%;/);
assert.match(leethubCss, /\.leethub-activity-grid\s*\{[\s\S]*grid-auto-columns: minmax\(0, 1fr\);/);
assert.match(welcomeHtml, /id="sync-accepted-submissions-after-hook"/);
assert.match(welcomeHtml, /Sync accepted submissions/);
assert.match(welcomeJs, /selectedInitialSyncEnabled/);
assert.match(
  welcomeJs,
  /if \(selectedInitialSyncEnabled\(\)\) \{[\s\S]*syncPreviousAfterInitialHook\(\);/,
);
assert.match(sidepanelJs, /text: 'Open on LeetCode'/);
assert.doesNotMatch(sidepanelJs, /Go to \$\{problem\.title\}/);
assert.match(sidepanelJs, /function renderCustomTemplateCreateForm/);
assert.match(sidepanelJs, /function createCustomTopicTemplate/);
assert.match(sidepanelJs, /function applySidepanelTheme/);
assert.match(sidepanelJs, /function initializeThemeControls/);
assert.match(sidepanelJs, /useDarkTheme/);
assert.match(sidepanelJs, /document\.body\.dataset\.theme/);
assert.match(sidepanelJs, /class: 'topic-template-edit-btn'/);
assert.match(sidepanelJs, /shouldRefreshTopicOnFocus = true/);
assert.match(sidepanelJs, /window\.addEventListener\('focus', refreshTopicOnFocus\)/);
assert.match(sidepanelJs, /text: 'No custom templates yet\.'/);
assert.match(sidepanelJs, /text: 'New template'/);
assert.match(sidepanelJs, /renderCustomTemplateCreateForm\(container\);\s+if \(!entries\.length\)/);
assert.match(sidepanelCss, /\.description-view\s*\{[\s\S]*padding: 20px 16px 32px;/);
assert.match(sidepanelCss, /\.translation-header\s*\{[\s\S]*gap: 16px;/);
assert.match(sidepanelCss, /\.translation-icon-btn\s*\{[\s\S]*width: 36px;[\s\S]*height: 36px;/);
assert.match(
  sidepanelCss,
  /\.translation-content\s*\{[\s\S]*margin-top: 16px;[\s\S]*gap: 18px;[\s\S]*line-height: 1.65;/,
);
assert.match(sidepanelCss, /\.description-card\s*\{[\s\S]*padding: 12px 12px;/);
assert.match(sidepanelCss, /\.description-example-group\s*\{[^}]*display: grid;[^}]*gap: 6px;/);
assert.doesNotMatch(sidepanelCss, /\.description-card-example \+ \.description-card-example/);
assert.match(sidepanelCss, /\.scratchpad-input\s*\{[\s\S]*background: var\(--lh-bg\);/);
assert.match(sidepanelCss, /\.topic-readme-edit-btn\s*\{[\s\S]*width: 26px;[\s\S]*height: 26px;/);
assert.match(sidepanelCss, /\.topic-template-edit-btn\s*\{[\s\S]*width: 26px;[\s\S]*height: 26px;/);
assert.match(
  sidepanelCss,
  /\.topic-template-header\s*\{[\s\S]*min-height: 32px;[\s\S]*align-items: center;/,
);
assert.match(sidepanelCss, /\.topic-template-header h3\s*\{[\s\S]*margin: 0;/);
assert.match(sidepanelCss, /\.topic-template-block pre\s*\{[\s\S]*margin-top: 4px;/);
assert.match(sidepanelCss, /--lh-code-mockup-bg: #f7f8fa;/);
assert.match(sidepanelCss, /--lh-code-mockup-text: #24292f;/);
assert.match(
  sidepanelCss,
  /body\[data-theme='dark'\]\s*\{[\s\S]*--lh-code-mockup-bg: #111111;[\s\S]*--lh-code-mockup-text: #d4d4d4;/,
);
assert.match(sidepanelCss, /\.topic-markdown pre,[\s\S]*background: var\(--lh-code-mockup-bg\);/);
assert.match(sidepanelCss, /\.topic-markdown pre,[\s\S]*color: var\(--lh-code-mockup-text\);/);
assert.match(sidepanelCss, /\.topic-template-create-toolbar\s*\{[\s\S]*justify-content: center;/);
assert.match(
  sidepanelCss,
  /\.topic-template-create-btn\s*\{[\s\S]*width: 100%;[\s\S]*border-color: var\(--lh-brand-soft\);/,
);
assert.match(sidepanelCss, /\.topic-template-create-form\s*\{[\s\S]*display: grid;/);
assert.match(sidepanelCss, /\.topic-template-create-actions\s*\{[\s\S]*justify-content: center;/);
assert.match(sidepanelCss, /\.sidepanel-tabs\[hidden\]\s*\{[\s\S]*display: none !important;/);
assert.match(sidepanelCss, /html,\s*body\s*\{[\s\S]*height: 100%;[\s\S]*overflow: hidden;/);
assert.match(sidepanelCss, /\.sidepanel-shell\s*\{[\s\S]*height: 100vh;[\s\S]*padding: 0;/);
assert.match(sidepanelCss, /\.sidepanel-view\s*\{[\s\S]*flex: 1 1 auto;[\s\S]*overflow-y: auto;/);
assert.match(
  leethubCss,
  /\.leethub-settings-view \.ui\.checkbox label\s*\{[\s\S]*color: var\(--lh-heading\) !important;/,
);
assert.match(
  leethubCss,
  /\.leethub-settings-view \.ui\.toggle\.checkbox input:checked ~ label,[\s\S]*color: var\(--lh-heading\) !important;/,
);
assert.match(leethubCss, /\.commit-variable\s*\{[\s\S]*color: var\(--lh-heading\);/);
assert.match(leethubCss, /#custom-commit-msg\s*\{[\s\S]*color: var\(--lh-heading\);/);
assert.match(sidepanelCss, /--lh-brand: #ff6c0a;/);
assert.match(sidepanelCss, /--lh-brand-strong: #c44f05;/);
assert.match(sidepanelCss, /--lh-easy: #00b8a3;/);
assert.match(sidepanelCss, /--lh-medium: #ffc01e;/);
assert.match(sidepanelCss, /--lh-hard: #ff375f;/);
assert.match(sidepanelCss, /--lh-success: #44bd32;/);
assert.match(sidepanelCss, /--lh-error: #e84118;/);
assert.doesNotMatch(sidepanelCss, /--lh-brand: #551e9f;/);
assert.match(sidepanelCss, /body\[data-theme='dark'\]\s*\{[\s\S]*--lh-bg: #1a1a1a;/);
assert.match(sidepanelCss, /body\s*\{[\s\S]*background-color: var\(--lh-bg\) !important;/);
assert.doesNotMatch(sidepanelHtml, /id="editorial-tab"/);
assert.doesNotMatch(sidepanelHtml, /id="translate-retry-btn"/);
assert.doesNotMatch(sidepanelHtml, /id="show-source-toggle"/);
assert.doesNotMatch(sidepanelHtml, /id="source-description"/);
assert.doesNotMatch(sidepanelHtml, /translation-toggle/);
