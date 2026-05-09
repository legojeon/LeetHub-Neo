# LeetHub-KR Side Panel Translation Design

## Goal

Convert the current LeetHub-KR popup into a Chrome side panel and add a stable first version of LeetCode problem description translation. The first implementation should keep the existing popup UI content mostly intact, centered inside the side panel, while adding a minimal translation area that appears on LeetCode problem pages.

## Scope

### In Scope

- Replace the default popup behavior with a side panel opened from the extension action.
- Reuse the current popup content as the default LeetHub panel.
- Center the existing LeetHub UI inside the side panel for the initial version.
- Detect LeetCode problem pages such as `https://leetcode.com/problems/two-sum/` and `https://leetcode.com/problems/two-sum/description/`.
- Fetch or expose the current problem title, slug, difficulty, tags, and description content from the LeetCode page context.
- Translate the problem description from English to Korean with Chrome's Translator API.
- Cache translated descriptions in `chrome.storage.local` by problem slug and source content hash or version key.
- Show translation state clearly: unsupported browser, unavailable language model, model downloading, translating, complete, failed.

### Out of Scope For First Version

- Editorial translation.
- A dedicated settings screen.
- Language selection UI.
- Full visual redesign of the LeetHub panel.
- New solved-count visualizations.
- Replacing LeetCode's original page HTML with translated content.
- AI explanation, solution hints, or problem-solving guidance beyond direct translation.

These are planned follow-up improvements:

- Move options into a settings screen, including translation language settings.
- Redesign the logo, solved-count area, and general UI.
- Add Description and Editorial views that can be selected similarly to LeetCode's own panel.

## Recommended Architecture

Use the content script as the LeetCode problem data provider, and use the side panel as the UI and translation owner.

The content script already runs on LeetCode and already has helper code for LeetCode GraphQL and problem data. Keeping problem extraction there avoids making the side panel depend on LeetCode DOM access or page cookies directly. The side panel remains responsible for rendering, translation state, and cache behavior.

## Components

### Manifest

- Add the `sidePanel` permission.
- Add `side_panel.default_path` pointing to the new side panel HTML.
- Remove or stop relying on `action.default_popup`.
- Keep the extension action icon.

### Background Service Worker

- Configure `chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })` so clicking the extension icon opens the persistent side panel.
- Optionally listen for tab updates and notify the side panel when the active tab changes, if needed by the implementation.

### Side Panel HTML/CSS/JS

- Start by reusing the current popup content.
- Use side-panel-specific CSS so the existing content sits centered in the panel.
- Keep existing authentication, hook setup, stats, sync previous, and option controls working.
- Add a compact problem translation area that is visible only when the active tab is a LeetCode problem page.
- Request current problem data from the content script.
- Translate description blocks with Chrome Translator API.
- Save and load cached translations from `chrome.storage.local`.

### Content Script

- Add a message handler for side panel requests such as `getCurrentLeetCodeProblem`.
- Detect the current problem slug from the URL.
- Prefer LeetCode GraphQL `question(titleSlug)` for title, difficulty, topic tags, and HTML description content.
- Fall back to existing DOM/meta-description parsing only if GraphQL fails.
- Return a structured payload:

```json
{
  "ok": true,
  "problem": {
    "slug": "two-sum",
    "title": "Two Sum",
    "difficulty": "Easy",
    "topicTags": ["Array", "Hash Table"],
    "descriptionHtml": "...",
    "descriptionText": "..."
  }
}
```

## Data Flow

1. User clicks the LeetHub-KR extension icon.
2. Chrome opens the side panel.
3. The side panel renders the existing LeetHub UI in the center.
4. The side panel checks the active tab.
5. If the active tab is a LeetCode problem page, it sends `getCurrentLeetCodeProblem` to the content script.
6. The content script fetches or extracts problem data and returns it.
7. The side panel checks `chrome.storage.local` for a cached Korean translation.
8. If cached translation exists, it displays immediately.
9. If no cache exists, the side panel checks Translator API support and availability.
10. If a model download is needed, the side panel shows download progress.
11. The side panel translates the description and caches the result.
12. The side panel displays the Korean description while keeping the LeetCode page unchanged.

## Translation Strategy

Use Chrome's Translator API as the first translation provider:

- Source language: `en`
- Target language: `ko`
- Run translation from the side panel, not the content script.
- Detect `Translator` support before rendering translation controls.
- Use model availability checks before creating a translator.
- Show model download progress if the browser needs to download language resources.

The first implementation can translate normalized text rather than attempting perfect HTML preservation. It should preserve readability for paragraphs, lists, examples, and constraints. Fine-grained HTML-preserving translation can be improved later.

## Error Handling

- If the active tab is not a LeetCode problem page, hide or disable the translation area.
- If the content script is not reachable, show a message asking the user to refresh the LeetCode page.
- If GraphQL fails, try the DOM/meta-description fallback.
- If Translator API is unsupported, show that Chrome 138+ desktop is required.
- If model download or translation fails, show a retry button.
- If cached translation exists, keep showing it even if a refresh translation attempt fails.

## Testing

Manual verification should cover:

- Extension icon opens a side panel instead of a popup.
- Existing LeetHub authentication and hook modes still render.
- Existing commit mode controls still render centered in the side panel.
- On a LeetCode problem page, the side panel detects the problem slug and title.
- Description translation works on `https://leetcode.com/problems/two-sum/description/`.
- Non-problem LeetCode pages do not show a broken translation UI.
- Translator API unsupported path shows a clear message.
- Cached translation is reused on a second visit to the same problem.

Run the existing project checks after implementation:

```bash
npm run format-test
npm run lint-test
```
