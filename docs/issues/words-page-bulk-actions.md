# Issue Draft: Add bulk actions to the words page

## Summary

Add multi-select and bulk actions to the `Words` page so users can apply one action to multiple words at once.

## Why this matters

- The page now supports several word states and actions, but all management is one-row-at-a-time.
- Repetitive actions become slow when users manage many words.
- Bulk actions are especially useful for hidden and custom-word cleanup.

## Current behavior

- Each word action is row-local in `src/components/WordsPanel.tsx`.
- State changes are handled individually in `src/features/trainer/useTrainer.ts`.

## Expected behavior

Users can select multiple words and apply one action across the selection without repeating the same action row by row.

## Proposed scope

- Add row selection UI for relevant word lists.
- Add at least these bulk actions where applicable:
  - remove from practice
  - restore
  - delete
- Scope action availability by word type and state so unsupported operations are not offered.
- Keep existing single-row actions intact.

## Acceptance criteria

- Users can select multiple words from applicable sections.
- Bulk remove from practice works for supported rows.
- Bulk restore works for hidden rows.
- Bulk delete works for custom-word rows where deletion is supported.
- Practice-order state remains consistent after each bulk action.
- Regression coverage is added in `src/App.test.tsx`.
- One E2E bulk-action scenario is added in `tests/e2e/app.spec.ts`.
- `vite build` and relevant tests pass.
