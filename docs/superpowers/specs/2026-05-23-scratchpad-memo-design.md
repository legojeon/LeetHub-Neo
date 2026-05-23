# Scratchpad Memo Design

## Goal

Store LeetHub-Neo scratchpad content as a separate `memo.txt` file in each problem folder instead of appending it to submitted solution code as language-specific comments.

## Motivation

Scratchpad content is often informal working memory: edge cases, partial ideas, failed attempts, and rough notes. Putting that content inside solution files makes the code less consistent and requires LeetHub-Neo to maintain comment formatting for every supported language. A plain text memo file keeps solution code identical to the accepted LeetCode submission and gives scratchpad notes room to stay messy.

## Behavior

- Accepted solution uploads keep the original submission code unchanged.
- When scratchpad content is non-empty after trimming, LeetHub-Neo uploads it as `memo.txt` in the same problem folder as README and NOTES files.
- When scratchpad content is empty, no `memo.txt` upload occurs.
- `memo.txt` is treated as problem metadata, not as a solution file.
- `memo.txt` follows existing folder settings:
  - With difficulty folders: `Easy/0001-two-sum/memo.txt`
  - With language folders: `0001-two-sum/memo.txt`, not `0001-two-sum/Python3/memo.txt`

## Architecture

- Add `SCRATCHPAD_MEMO_FILENAME = 'memo.txt'` to `src/core/config/repository-files.js`.
- Replace the scratchpad comment formatter module with a scratchpad memo helper that normalizes scratchpad text and prepares memo content.
- Update `src/js/leetcode.js` so V1 and V2 solution uploads send original code unchanged.
- Add a separate scratchpad memo upload alongside README, NOTES, and solution upload work in both automatic upload flows.
- Extend metadata checks so `memo.txt` is excluded from solution path tracking and repository migration treats it like README/NOTES/Solution.md.

## Testing

- Unit-test scratchpad memo normalization.
- Unit-test repository metadata filename exports.
- Unit-test topic path behavior so `memo.txt` stays outside language folders.
- Unit-test solution upload classification so `memo.txt` is not recorded as a solution.
- Run the existing unit test suite.

## Out Of Scope

- User-facing settings for switching between code comments and memo files.
- Markdown formatting for scratchpad notes.
- Historical migration from old code-comment scratchpads to `memo.txt`.
