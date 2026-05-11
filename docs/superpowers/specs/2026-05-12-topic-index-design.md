# LeetHub-KR Topic Index Design

## Goal

Add a topic-oriented repository structure that supports future side panel tabs for Topics and My Code without duplicating solution files. The first version should create topic note folders, store machine-readable problem indexes per topic, and keep the root README as a lightweight progress dashboard.

## Scope

### In Scope

- Create `Topics/<topic-slug>/` folders for LeetCode topic tags.
- Create `Topics/<topic-slug>/README.md` as a user-editable concept and tips note file.
- Create and update `Topics/<topic-slug>/problems.json` as the generated problem index for that topic.
- Keep solution files in their existing problem folders and reference those paths from topic JSON.
- Update the root `README.md` with a generated summary section containing total solved count, Easy/Medium/Hard counts, and topic folder links.
- Make `Sync Previous` backfill topic folders and topic JSON for already synced accepted problems.
- Preserve existing difficulty and language folder options when computing stored solution paths.

### Out Of Scope For First Version

- Copying or moving solution files into topic folders.
- Generating `Topics/<topic-slug>/problems.md`.
- Parsing old root README topic tables into topic JSON.
- Adding language statistics, acceptance rate, submission count, or LeetCode progress-page scraping.
- Building the side panel Topics or My Code tabs.
- Editing an existing topic README after it has been created.

## Recommended Approach

Use a link-only topic index.

Each topic folder becomes a stable place for user notes and generated problem metadata, while every submitted solution remains in the existing problem folder. This avoids stale duplicate solution files when one problem belongs to multiple topics such as Array and Hash Table.

The root README should no longer be the source of detailed topic problem lists. It should become a dashboard that links into the topic folders.

## Repository Shape

```text
README.md
LeetCode/
  0001-two-sum/
    README.md
    0001-two-sum.<extension>
Topics/
  array/
    README.md
    problems.json
  hash-table/
    README.md
    problems.json
```

`0001-two-sum.<extension>` represents the real submitted language extension. For example, Python submissions use `.py`, Java submissions use `.java`, and C++ submissions use `.cpp`.

## File Responsibilities

### `Topics/<topic-slug>/README.md`

This file is user-editable. LeetHub-KR creates it only when missing, with a short starter template for concepts, patterns, tips, and mistakes.

After creation, LeetHub-KR must not overwrite it during sync. This keeps user notes safe.

### `Topics/<topic-slug>/problems.json`

This file is generated and maintained by LeetHub-KR. It is the first version's machine-readable source for future side panel topic views.

LeetHub-KR may rewrite this file during accepted sync and Sync Previous.

### Root `README.md`

The root README keeps user-authored content outside generated markers, and LeetHub-KR owns only the generated summary block.

The generated block should include:

- Total solved count.
- Easy, Medium, and Hard solved counts.
- Topic folder links with per-topic problem counts.

The old root README topic table section should be replaced by the new summary section when the feature runs.

## Topic Folder Naming

Use LeetCode topic slugs for folder names:

```text
Topics/hash-table/
Topics/dynamic-programming/
Topics/two-pointers/
```

Use the LeetCode display name in JSON and UI:

```json
{
  "slug": "hash-table",
  "name": "Hash Table"
}
```

If a LeetCode topic tag does not provide a slug, generate one from the display name using the existing slug conversion behavior.

## `problems.json` Schema

```json
{
  "version": 1,
  "topic": {
    "slug": "array",
    "name": "Array"
  },
  "updatedAt": "2026-05-12T10:30:00.000Z",
  "problems": [
    {
      "frontendId": "1",
      "title": "Two Sum",
      "slug": "two-sum",
      "problemName": "0001-two-sum",
      "difficulty": "Easy",
      "leetcodeUrl": "https://leetcode.com/problems/two-sum/",
      "folderPath": "LeetCode/0001-two-sum/",
      "readmePath": "LeetCode/0001-two-sum/README.md",
      "solutions": [
        {
          "language": "Python3",
          "extension": ".py",
          "path": "LeetCode/0001-two-sum/0001-two-sum.py",
          "lastSyncedAt": "2026-05-12T10:30:00.000Z"
        }
      ]
    }
  ]
}
```

### Merge Rules

- Identify duplicate problems within a topic by `problemName`.
- Refresh problem metadata when the same problem is synced again.
- Identify duplicate solution entries by `language` and `path`.
- If a solution entry already exists, update `lastSyncedAt`.
- If a new language or path appears for the same problem, append it to `solutions`.
- Sort `problems` by problem number.
- Sort `solutions` by language and then path for stable output.

## Path Policy

Topic JSON stores paths generated from the same path helper used by solution upload and README link generation. This prevents topic JSON from pointing to a different location than the actual uploaded solution.

The stored paths must respect current user options:

```text
LeetCode/0001-two-sum/0001-two-sum.py
LeetCode/Easy/0001-two-sum/0001-two-sum.py
LeetCode/0001-two-sum/Python3/0001-two-sum.py
LeetCode/Easy/0001-two-sum/Python3/0001-two-sum.py
```

The topic feature should not make assumptions about a fixed language set. It should use the language name, extension, and filename already calculated by the existing submission upload flow.

## Sync Flow

Accepted submission sync should keep the existing upload behavior and add topic index work after problem metadata and file paths are known.

For each accepted problem:

1. Build the problem statement README if needed.
2. Upload notes if present.
3. Upload the solution file according to current folder options.
4. For every topic tag:
   - Ensure `Topics/<topic-slug>/README.md` exists.
   - Fetch or create `Topics/<topic-slug>/problems.json`.
   - Merge the current problem and solution entry.
   - Upload the updated JSON.
5. Update the root README summary block.
6. Increment stats only when this is a newly solved problem.

Topic index failures should not block solution upload. If topic README creation, topic JSON update, or root README summary update fails, LeetHub-KR should log the error and continue.

GitHub `409 Conflict` responses should trigger one fetch-latest-and-retry attempt for generated files.

## Sync Previous And Migration

`Sync Previous` should act as the migration path for existing accepted submissions.

When Sync Previous sees a problem that is already present in local stats, it should skip unnecessary solution re-upload, but still merge topic metadata:

- Ensure topic README files exist.
- Create or update topic `problems.json`.
- Refresh root README summary.

This means users can adopt the new topic structure by running Sync Previous without moving existing solution files or requiring a one-time root README parser.

Existing root README topic tables are not parsed into JSON in v1. Past problems are recovered through LeetCode accepted submission history instead.

## Root README Summary

The new generated section should use dedicated markers:

```md
<!---LeetHub Summary Start-->
## LeetHub Summary

| Total Solved | Easy | Medium | Hard |
| ---: | ---: | ---: | ---: |
| 12 | 5 | 6 | 1 |

## Topics

| Topic | Problems |
| --- | ---: |
| [Array](Topics/array/) | 8 |
| [Hash Table](Topics/hash-table/) | 4 |
<!---LeetHub Summary End-->
```

If the old `<!---LeetCode Topics Start-->` section exists, replace it with the new summary section. If neither section exists, append the summary section to the root README while preserving all existing content outside generated markers.

## Error Handling

- Missing topic README: create the default user note template.
- Existing topic README: leave untouched.
- Missing topic JSON: create a new version 1 document.
- Invalid topic JSON: log the error and rebuild a valid version 1 document for that topic from the current sync item.
- Missing topic tags: skip topic folder updates and still update normal solution files.
- GitHub conflict: fetch latest generated file and retry once.
- Generated summary failure: log the error and continue.

## Testing

Automated tests should cover:

- Topic slug and display-name normalization.
- New `problems.json` creation.
- Existing `problems.json` merge for the same problem.
- Existing `problems.json` merge for a new language solution.
- Stable problem and solution sorting.
- Root README summary creation.
- Root README replacement of the old LeetCode topic section.
- Preservation of README content outside generated markers.
- Path generation for default, difficulty folder, language folder, and combined folder options.
- Sync Previous behavior where already-synced problems still update topic indexes.

Manual verification should cover:

- Solving a new accepted problem creates topic folders and JSON files.
- A multi-topic problem appears in every related topic JSON.
- Re-running sync does not duplicate problem or solution entries.
- Topic README user edits survive later syncs.
- Running Sync Previous backfills topic JSON for older accepted submissions.

Run the existing project checks after implementation:

```bash
npm run format-test
npm run lint-test
npm run test:unit
```
