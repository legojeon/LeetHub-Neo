# Scratchpad Memo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Save scratchpad content as `memo.txt` in the problem folder while leaving submitted solution code unchanged.

**Architecture:** Treat `memo.txt` as problem metadata, parallel to README/NOTES/Solution.md. Replace code-comment formatting with a small scratchpad memo helper, then upload memo content separately in both V1 and V2 upload flows.

**Tech Stack:** Chrome extension JavaScript, Node `assert` unit tests, existing `npm run test:unit` suite.

---

## File Structure

- Modify `src/core/config/repository-files.js`: export `SCRATCHPAD_MEMO_FILENAME` and include it in problem metadata.
- Rename or replace `src/core/scratchpad/scratchpad-comment.js`: expose `LeetHubScratchpadMemo` helpers for memo content.
- Modify `manifest.json`: load the scratchpad memo helper.
- Modify `src/js/leetcode.js`: upload memo separately and stop mutating code.
- Modify tests under `tests/`: update scratchpad helper tests and add metadata/path assertions.

### Task 1: Repository Metadata

**Files:**
- Modify: `src/core/config/repository-files.js`
- Modify: `tests/topic-index-utils.test.mjs`

- [ ] **Step 1: Write failing metadata/path assertions**

Add assertions that `SCRATCHPAD_MEMO_FILENAME` equals `memo.txt`, that `memo.txt` is a problem metadata file, and that language-folder paths keep `memo.txt` at the problem-folder root.

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/topic-index-utils.test.mjs`
Expected: FAIL because `SCRATCHPAD_MEMO_FILENAME` is undefined.

- [ ] **Step 3: Add repository filename constant**

Add `SCRATCHPAD_MEMO_FILENAME = 'memo.txt'`, include it in `PROBLEM_METADATA_FILENAMES`, and export it.

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/topic-index-utils.test.mjs`
Expected: PASS.

### Task 2: Scratchpad Memo Helper

**Files:**
- Move/modify: `src/core/scratchpad/scratchpad-comment.js` to `src/core/scratchpad/scratchpad-memo.js`
- Modify: `manifest.json`
- Move/modify: `tests/scratchpad-comment.test.mjs` to `tests/scratchpad-memo.test.mjs`
- Modify: `package.json`

- [ ] **Step 1: Write failing helper tests**

Test `normalizeScratchpadText`, `formatScratchpadMemo`, and empty memo handling through `LeetHubScratchpadMemo`.

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/scratchpad-memo.test.mjs`
Expected: FAIL until the helper exists and the manifest points to it.

- [ ] **Step 3: Implement memo helper**

Expose `LeetHubScratchpadMemo` with `normalizeScratchpadText` and `formatScratchpadMemo`. The formatter returns trimmed text plus one trailing newline, or an empty string for blank content.

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/scratchpad-memo.test.mjs`
Expected: PASS.

### Task 3: Upload Flow

**Files:**
- Modify: `src/js/leetcode.js`
- Add: `tests/leetcode-upload-classification.test.mjs`
- Modify: `package.json`

- [ ] **Step 1: Write failing upload classification test**

Extract or expose filename classification so `README.md`, `NOTES.md`, `Solution.md`, and `memo.txt` are not solution uploads, while `0001-two-sum.py` is.

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/leetcode-upload-classification.test.mjs`
Expected: FAIL before `memo.txt` is included in metadata classification.

- [ ] **Step 3: Update upload flow**

Replace `appendScratchpadToSubmissionCode` with a memo uploader. V1 and V2 `findAndUploadCode` upload original code. Loader flows start a `memo.txt` upload promise when scratchpad content is non-empty.

- [ ] **Step 4: Run focused tests**

Run:
`node tests/scratchpad-memo.test.mjs`
`node tests/topic-index-utils.test.mjs`
`node tests/leetcode-upload-classification.test.mjs`
Expected: all PASS.

### Task 4: Full Verification

**Files:**
- Modify as needed from prior tasks only.

- [ ] **Step 1: Run full unit suite**

Run: `npm run test:unit`
Expected: all tests PASS.

- [ ] **Step 2: Review git diff**

Run: `git diff --stat` and `git diff --check`
Expected: focused changes and no whitespace errors.
