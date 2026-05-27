# Notes Template and Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a code block example to topic notes and add a side-panel-wide dark mode setting without changing tab order.

**Architecture:** Keep tab behavior unchanged. Extend the topic README template, then add `useDarkTheme` storage handling in `sidepanel.js` and CSS variables in `sidepanel.css` plus LeetHub-specific variable usage in `leethub.css`.

**Tech Stack:** Chrome extension JavaScript, CSS custom properties, existing Node assert tests.

---

### Task 1: Topic README Code Block

**Files:**
- Modify: `src/core/templates/topic-readme-template.js`
- Modify: `tests/topic-template-utils.test.mjs`
- Modify: `tests/topic-index-utils.test.mjs`

- [ ] **Step 1: Write failing tests**

Update expected README strings to include:

```md
## Code Notes

```python
# You can write a short example for this topic here.
def example():
    pass
```
```

- [ ] **Step 2: Run focused tests**

Run: `node tests/topic-template-utils.test.mjs && node tests/topic-index-utils.test.mjs`
Expected: FAIL because the template has not been updated.

- [ ] **Step 3: Update template**

Add the `Code Notes` section to `createTopicReadmeTemplate`.

- [ ] **Step 4: Run focused tests**

Run: `node tests/topic-template-utils.test.mjs && node tests/topic-index-utils.test.mjs`
Expected: PASS.

### Task 2: Theme Setting and Styles

**Files:**
- Modify: `src/html/sidepanel.html`
- Modify: `src/js/sidepanel.js`
- Modify: `src/css/sidepanel.css`
- Modify: `src/features/sidepanel/leethub/leethub.css`
- Modify: `tests/sidepanel-leethub-ui.test.mjs`

- [ ] **Step 1: Write failing UI tests**

Add assertions for `use-dark-theme`, `collapsible-theme-icon`, `collapsible-theme-container`, `useDarkTheme`, `applySidepanelTheme`, `body[data-theme='dark']`, and `--lh-brand: #551e9f`.

- [ ] **Step 2: Run focused test**

Run: `node tests/sidepanel-leethub-ui.test.mjs`
Expected: FAIL because the theme setting and CSS variables do not exist.

- [ ] **Step 3: Add theme setting UI and JS**

Add a `Theme` setting block with a `Dark Mode` toggle. Implement `applySidepanelTheme` and `initializeThemeControls` in `sidepanel.js`, load `useDarkTheme`, update `document.body.dataset.theme`, and persist toggle changes.

- [ ] **Step 4: Add CSS variables and theme usage**

Define light/dark variables in `sidepanel.css` and replace core hard-coded colors in `sidepanel.css` and `leethub.css` with variables where the UI is shared or theme-sensitive.

- [ ] **Step 5: Run focused test**

Run: `node tests/sidepanel-leethub-ui.test.mjs`
Expected: PASS.

### Task 3: Verification

**Files:**
- No new files beyond prior tasks.

- [ ] **Step 1: Run unit tests**

Run: `npm run test:unit`
Expected: PASS.

- [ ] **Step 2: Run format and lint checks**

Run: `npm run format-test && npm run lint-test`
Expected: format passes; lint exits 0, allowing existing warnings.

- [ ] **Step 3: Check diff**

Run: `git diff --check`
Expected: no whitespace errors.
