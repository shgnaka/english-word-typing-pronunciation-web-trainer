# Issue Draft: Add sorting helpers for custom words

## Summary

Add quick sorting helpers for custom words so users can reorganize their saved custom vocabulary more efficiently before fine-tuning manually.

## Why this matters

- Manual row-by-row ordering is helpful, but inefficient for larger custom word collections.
- Users may want quick organization by alphabet or recency before making smaller edits.

## Current behavior

- Custom words are managed manually on the `Words` page.
- No quick sort helpers exist.
- Ordering is ultimately reflected through the shared practice-order model managed in `src/features/trainer/useTrainer.ts`.

## Expected behavior

Users can apply a sort helper such as alphabetical, newest first, or oldest first, then still manually adjust afterward.

## Proposed scope

- Add sorting controls for custom words.
- Support at least:
  - alphabetical
  - newest first
  - oldest first
- Ensure resulting order integrates correctly with the current practice-order model.

## Acceptance criteria

- Users can apply each supported sort helper from the words page.
- The resulting custom-word order is reflected consistently in the relevant sections.
- Users can still manually reorder after sorting.
- Persistence remains consistent after reload.
- Regression coverage is added in `src/App.test.tsx`.
- `vite build` and relevant tests pass.
