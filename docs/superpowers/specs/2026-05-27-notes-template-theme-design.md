# Notes Template and Theme Design

## Goal

Keep the existing side panel tab order, add a code block example to the default topic notes template, and add a side-panel-wide dark mode setting using LeetCode-inspired theme colors.

## Requirements

- Do not change the current tab order: `Description`, `Scratchpad`, `Topics`, `LeetHub`.
- Do not change the current non-problem-page behavior: hide the tab bar and show only the LeetHub main panel.
- Keep the existing topic README copy and append a concise code block example that shows users they can record snippets in notes.
- Define global side panel CSS variables in the existing UI stylesheet.
- Add a Settings toggle matching the existing setting toggle style.
- Store theme preference as a boolean setting.
- Apply the theme across the side panel, including tabs, scratchpad, description, topic notes/templates, LeetHub home, and LeetHub settings.

## Design

The topic README template will keep its current introductory copy and add a `Code Notes` section with a fenced Python code block. The example comment will say users can write a short example for the topic in their notes.

The theme system will live in `src/css/sidepanel.css` because that file already provides global side panel layout and base UI styles. It will define CSS custom properties on `body`, override them on `body[data-theme='dark']`, and use LeetCode-oriented colors:

- Brand: `#551E9F`
- Success: `#44bd32`
- Error: `#e84118`
- Light background: `#ffffff`, `#f7f7f8`
- Dark background: `#1a1a1a`, `#212121`
- Dark text: `#d4d4d4`

The setting will be a `Dark Mode` row in LeetHub Settings using the same collapsible setting block and Semantic UI toggle checkbox pattern as other toggles. `src/js/sidepanel.js` will load `useDarkTheme`, apply `data-theme`, initialize the checkbox, and update the theme immediately when toggled.

## Testing

- Update topic README template tests for the new code block.
- Update sidepanel UI tests for theme markup, script behavior, and CSS variables.
- Run unit tests, formatting, and lint checks.
