# Issue Draft: Highlight matches in filtered search results

## Summary

Enhance the `Words` page search by highlighting the matched substring in visible rows after filtering.

## Why this matters

- Search already filters correctly, but users still need to visually infer why each row matched.
- Highlighting would improve scan speed and confidence when working with long lists.

## Current behavior

- Search input filters practice, built-in, hidden built-in, custom, and hidden custom rows in `src/components/WordsPanel.tsx`.
- Matching is case-insensitive through normalized search logic.
- No visual highlighting is applied to matched text.

## Expected behavior

When search text is present, the visible match inside each row is highlighted. When search is empty, rows render normally.

## Proposed scope

- Highlight matched text in the visible word label only.
- Keep matching case-insensitive.
- Do not change search filtering behavior beyond the highlight treatment.

## Acceptance criteria

- Matching substrings are highlighted in visible rows when search is non-empty.
- Search remains case-insensitive.
- No highlighting appears when search is empty.
- Non-matching rows remain filtered out as they are today.
- Regression coverage is added in `src/App.test.tsx`.
- `vite build` and relevant tests pass.
