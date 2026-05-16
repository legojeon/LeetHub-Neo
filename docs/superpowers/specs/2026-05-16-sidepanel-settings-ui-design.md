# LeetHub-KR Side Panel Settings UI Design

## Goal

Refine the LeetHub side panel UI in small, reviewable increments while preserving the current LeetHub-KR color identity. The first increment adds an in-tab Settings view for LeetHub controls and leaves the default LeetHub panel focused on solved-count status.

## Scope

### In Scope For This Increment

- Add a settings icon to the default LeetHub side panel.
- Navigate from the default LeetHub panel to a Settings view in the same LeetHub tab.
- Add a Settings back button that returns to the default LeetHub panel without changing browser tabs.
- Keep the default LeetHub panel showing:
  - Total solved count.
  - Easy solved count.
  - Medium solved count.
  - Hard solved count.
  - Existing auth and repository hook states when the user is not fully configured.
- Move commit-mode actions and options from the default panel into the Settings view:
  - Sync Previous.
  - Migrate Repository Structure.
  - Customize Commit Message.
  - Use Difficulty Subfolder.
  - Use Language Subfolder.
  - Enable Timestamped Filenames.
  - Auto-Commit Solution Posts.
  - Topic Templates.
- Render Settings rows consistently with:
  - Setting title.
  - Short descriptive helper text below the title.
  - A consistent right-side affordance.
  - Toggle switches for on/off settings.
- Keep UI and design code organized in focused modules or files rather than continuing to grow `sidepanel.js` and `sidepanel.css` unchecked.

### Out Of Scope For This Increment

- Redesigning the Description tab.
- Redesigning the Topics tab.
- Shrinking the top tab bar.
- Unifying all topic chips and all difficulty badges across the full side panel.
- Changing topic code blocks to the `code-editor-mockup` treatment.
- Changing GitHub sync behavior or repository data formats.

Those items remain follow-up increments so the UI can be checked after each step.

## Approved Visual Direction

Use the selected C-style flow:

```text
LeetHub top tab
  ├─ Default LeetHub panel
  │    ├─ LeetHub-KR title and caption
  │    ├─ Settings icon in the header area
  │    └─ Solved summary with total, Easy, Medium, Hard
  └─ Settings panel
       ├─ Back button
       ├─ Settings title
       └─ Consistent setting rows
```

The settings icon should sit in the LeetHub panel header area, visually close to the LeetHub-KR title but not crowding the tab bar. It should use an icon-only circular button with a tooltip or accessible label.

The default panel should not show configuration controls once the user is in commit mode. It should feel like a concise status surface.

## Visual System

Preserve the existing LeetHub-KR palette:

- Orange accent: `#ff6c0a`.
- Light side panel background: `#f4f4f5`.
- White surfaces: `#ffffff`.
- Ink text: `#222222` or the existing near-black values.
- Hairline borders: `#e7e7e8`.

Borrow structure from `DESIGN.md` without replacing the brand feel:

- Buttons and surfaces use 6px to 8px radii.
- Icon buttons use circular shape.
- Rows use clean borders, restrained spacing, and compact typography.
- Helper text is smaller and muted.
- Do not introduce a new decorative palette.

The solved summary should keep LeetCode-compatible difficulty colors:

- Easy: `#00b8a3`.
- Medium: `#ffc01e`.
- Hard: `#ff375f`.

## Components

### `SidePanelShell`

Keeps the existing side panel tabs:

- Description.
- Editorial.
- Topics.
- LeetHub.

This increment only changes behavior inside the LeetHub tab. The top tab bar should keep its current layout until the later tab-bar increment.

### `LeetHubHomeView`

Responsible for the default LeetHub panel.

Commit mode content:

- LeetHub-KR title.
- Caption.
- Settings icon button.
- Repository link, if available.
- Total solved count.
- Easy, Medium, Hard solved counts.
- Existing feature/social links if they remain visually unobtrusive.

Authentication and hook mode content should remain available because those states are not settings. Users still need to authenticate or set up the repository hook before settings are useful.

### `LeetHubSettingsView`

Responsible for the in-tab settings screen.

Header:

- Back icon button.
- `Settings` title.

Rows:

- `Sync Previous`
  - Helper: sync accepted LeetCode submissions into GitHub.
  - Control: command button.
- `Migrate Repository Structure`
  - Helper: move existing synced files to match current folder settings.
  - Control: command button.
- `Commit Message`
  - Helper: customize the commit message template and insert variables.
  - Control: disclosure/expand affordance.
- `Use Difficulty Subfolder`
  - Helper: organize submissions under Easy, Medium, and Hard folders.
  - Control: toggle.
- `Use Language Subfolder`
  - Helper: organize submissions under language-specific folders.
  - Control: toggle.
- `Timestamped Filenames`
  - Helper: keep multiple accepted versions by adding timestamps to filenames.
  - Control: toggle.
- `Auto-Commit Solution Posts`
  - Helper: commit published LeetCode solution posts as `Solution.md`.
  - Control: toggle.
- `Topic Templates`
  - Helper: choose template language and whether templates appear in the Topics tab.
  - Control: disclosure/expand affordance plus nested controls.

Expanded content should reuse the existing control IDs where practical so storage and message behavior remain stable.

## Code Organization

Introduce focused UI files for the new design layer:

```text
src/css/sidepanel.css
src/css/sidepanel-leethub.css
src/js/sidepanel.js
src/js/sidepanel-leethub-ui.js
```

Responsibilities:

- `sidepanel.css`: existing shared side panel, Description, and Topics styles for now.
- `sidepanel-leethub.css`: LeetHub home, Settings screen, setting rows, switches, stat summary, and LeetHub-specific buttons.
- `sidepanel.js`: side panel orchestration, tab switching, data loading, and existing message behavior.
- `sidepanel-leethub-ui.js`: small helpers for switching between LeetHub home/settings views and applying reusable UI classes or labels.

The first implementation should avoid a full framework or large rewrite. It should keep the existing DOM and jQuery flow where that keeps risk low.

## State And Navigation

Add an internal LeetHub subview state:

```text
leethubSubview = "home" | "settings"
```

Rules:

- Clicking the settings icon sets `leethubSubview` to `settings`.
- Clicking the Settings back button sets `leethubSubview` to `home`.
- Switching to Description or Topics does not destroy the Settings view.
- Clicking the LeetHub top tab should show the most recent LeetHub subview unless this feels confusing in review. If review feedback says the LeetHub tab should always open home, adjust before the next increment.

The requested "same tab" behavior means no new browser tab, no new Chrome extension page, and no separate `settings.html` route for this increment.

## Existing Behavior Preservation

- Existing authentication flow continues to call `oAuth2.begin()`.
- Existing hook link continues to open the welcome/setup page.
- Existing storage keys remain unchanged.
- Existing commit message save/reset behavior remains unchanged.
- Existing Sync Previous and Migration message behavior remains unchanged.
- Existing Topic Template settings initialization remains available after moving the markup.

## Testing And Review

Manual UI review after this increment:

1. Open the side panel in an authenticated commit-mode account.
2. Confirm the default LeetHub panel shows total, Easy, Medium, and Hard solved counts.
3. Confirm configuration controls are no longer on the default panel.
4. Click the settings icon.
5. Confirm Settings appears in the same LeetHub tab.
6. Confirm row titles, helper text, and controls are visually consistent.
7. Toggle each on/off setting and confirm storage behavior still works.
8. Expand commit message and topic template settings and confirm their existing controls still work.
9. Click back and confirm the default LeetHub panel returns.

Automated checks after implementation:

```bash
npm run format-test
npm run lint-test
npm run test:unit
```

## Follow-Up Increment Order

After this increment is reviewed:

1. Move remaining default panel controls fully into Settings if review finds any stragglers.
2. Shrink the Description, Topics, and LeetHub tab bar.
3. Unify topic chip/card styling.
4. Unify all difficulty badges with LeetCode colors.
5. Restyle Topics tab code blocks with the `DESIGN.md` `code-editor-mockup` treatment.
