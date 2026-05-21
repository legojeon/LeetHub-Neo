<div align="center">
    <img src="assets/logo.png" alt="LeetHub-Neo">
</div>

<p align="center">
  <a href="https://github.com/legojeon/LeetHub-Neo/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="license"/>
  </a>
</p>

## What is LeetHub-Neo?

LeetHub-Neo is a Chrome extension for keeping your LeetCode practice organized in
GitHub. It syncs accepted submissions automatically, gives you a side panel while
you solve problems, and helps turn solved problems into a searchable study space
with notes, topic indexes, templates, and optional translated problem statements.

LeetHub-Neo supports both [LeetCode.com](https://leetcode.com/) and
[LeetCode.cn](https://leetcode.cn/).

LeetHub-Neo is a fork of
[LeetHub-3.0](https://github.com/raphaelheinz/LeetHub-3.0), with additional
features and maintenance for this project.

## Features

- **Automatic GitHub sync**: push accepted LeetCode submissions to your selected
  GitHub repository.
- **LeetCode side panel**: open LeetHub-Neo beside the problem page without
  leaving your current solve flow.
- **Problem description translation**: translate English problem descriptions
  with Chrome's built-in Translator API in supported Chrome versions.
- **Scratchpad**: keep solve notes in the side panel and optionally append them
  to synced code as language-aware comments.
- **Topic workspace**: browse a problem's topic tags, create topic notes, and
  keep related solved problems grouped under `Topics/`.
- **Reusable templates**: seed topic folders with algorithm and data-structure
  templates for C++, Java, JavaScript, Lua, Python, and Ruby.
- **Previous submission sync**: import accepted submissions that were solved
  before installing or configuring LeetHub-Neo.
- **Repository organization options**: choose difficulty folders, language
  folders, timestamped filenames, custom commit messages, and automatic
  `Solution.md` uploads for published solution posts.
- **Progress dashboard**: review solved counts, difficulty distribution, recent
  activity, streaks, and top tags from the LeetHub panel.

## Screenshots

The side panel brings the main study workflow into the LeetCode problem page:
dashboard progress, solve notes, topic workspaces, and sync settings.

<table>
  <tr>
    <td align="center">
      <img src="assets/extension/home.png" alt="LeetHub-Neo side panel dashboard" width="420">
      <br>
      <sub>Dashboard and recent progress</sub>
    </td>
    <td align="center">
      <img src="assets/extension/notes.png" alt="LeetHub-Neo user notes" width="420">
      <br>
      <sub>User notes</sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="assets/extension/topics.png" alt="LeetHub-Neo topic workspace" width="420">
      <br>
      <sub>Topic workspace and templates</sub>
    </td>
    <td align="center">
      <img src="assets/extension/settings.png" alt="LeetHub-Neo repository settings" width="420">
      <br>
      <sub>Repository sync settings</sub>
    </td>
  </tr>
</table>

## Installation

LeetHub-Neo has not been published to the Chrome Web Store yet. Store
installation is planned; for now, install it as an unpacked extension from this
repository.

### Manual installation

1. Clone this repository or download [Release](https://github.com/legojeon/LeetHub-Neo/releases/tag/v1.0.0) as a ZIP.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the root `LeetHub-Neo` folder.

No build step is required for a local unpacked install.

### Optional local development setup

Install npm dependencies only if you want to run formatting, linting, or tests:

```bash
npm run setup
```

### Optional GitHub OAuth setup

The unpacked extension can be loaded without creating a new OAuth app. If you
are preparing your own fork or replacing the GitHub OAuth app used by the
extension, create an OAuth app at
[github.com/settings/applications/new](https://github.com/settings/applications/new).

Use these values:

- **Application name**: any name you want, such as `LeetHub-Neo Local`
- **Homepage URL**: `https://github.com/legojeon/LeetHub-Neo`
- **Authorization callback URL**: `https://github.com/`

Then update the OAuth constants in:

- `src/js/authorize.js`
- `src/js/oauth2.js`

Do not commit real client secrets from a personal OAuth app.

## Setup

1. Open the extension and authenticate with GitHub.
2. Link LeetHub-Neo to an existing repository or create a new one.
3. Open a LeetCode problem and solve it as usual.
4. After an accepted submission, let LeetHub-Neo finish syncing before changing
   the editor or switching pages.
5. Use the side panel for translations, scratchpad notes, topic notes,
   templates, previous submission sync, and repository settings.

## Translation Requirements

Problem translation uses Chrome's built-in Translator API. It does not send text
through a custom LeetHub-Neo translation server. Chrome 138+ desktop is expected
for this feature.

Translation availability depends on your Chrome version, profile, language pair,
and local model availability. If Chrome reports that translation is unavailable,
LeetHub-Neo reports the limitation in the side panel while the rest of the
extension remains usable.

## Repository Layout

LeetHub-Neo can keep the original LeetHub-style problem folders, or organize
submissions with optional difficulty and language folders.

Topic features create a study-oriented structure like this:

```text
Topics/
  array/
    README.md
    problems.json
    templates.json
    templates/
      python/
        prefix_sum.py
```

The root `README.md` in your synced repository can also be updated with a
generated summary of solved problems by topic.

## Supported LeetCode UI

LeetHub-Neo is designed for LeetCode's old layout and the newer dynamic layout.
The non-dynamic layout may still have issues because LeetCode changes its page
structure frequently.

## Development

```bash
npm run               # Show available commands
npm run setup         # Install dependencies
npm run format        # Auto-format JavaScript, HTML/CSS
npm run format-test   # Check formatting
npm run lint          # Lint and fix JavaScript
npm run lint-test     # Check lint rules
npm run test:unit     # Run unit tests
```

## Acknowledgements

LeetHub-Neo builds on the work of
[LeetHub-3.0](https://github.com/raphaelheinz/LeetHub-3.0) and the broader
LeetHub project family.

The topic template catalog is adapted from
[leetcode-cheatsheet](https://github.com/jwl-7/leetcode-cheatsheet). Templates
are bundled so LeetHub-Neo can create topic study files directly in a user's
GitHub repository.

Syntax highlighting in the Topics panel uses a local
[PrismJS](https://github.com/PrismJS/prism) v2 bundle, limited to the languages
used by the bundled template catalog. See `src/vendor/prism-v2/README.md` and
`src/vendor/prism-v2/LICENSE` for details.

See `THIRD_PARTY_NOTICES.md` for bundled third-party license notices.

## Contribution

Issues and pull requests are welcome. If you want to request a feature, open an
issue with the `feature` label or start a discussion with the use case you want
LeetHub-Neo to support.
