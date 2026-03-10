# Issue Draft: Reduce per-row action density on the words page

## Summary

Simplify row-level controls on the `Words` page so each word row emphasizes the most common action while secondary actions move into a lighter overflow treatment.

## Why this matters

- Word rows can accumulate many controls across active, built-in, hidden, and custom sections.
- Dense control clusters increase visual noise and make rows harder to scan.
- Users should be able to identify the main row action quickly without parsing every button.

## Current behavior

- Row actions are grouped in `word-row-actions`, with responsive overflow behavior for smaller screens.
- Even with the existing overflow menu, rows can still feel action-heavy and visually busy.
- Important list scanning competes with control scanning.

Row rendering lives in shared word-row components under `src/components/words/shared/` and styles in `src/styles.css`.

## Expected behavior

Each row should highlight one primary action appropriate to its state, while less common actions remain available without dominating the row.

## Proposed scope

- Review row-action hierarchy across active, hidden, built-in, and custom rows.
- Choose a clearer primary-versus-secondary action split.
- Expand overflow usage or other compact action patterns where helpful.
- Keep existing capabilities available, but reduce visual clutter in the default row view.

## Acceptance criteria

- Word rows are easier to scan visually than the current baseline.
- Each row presents a clearer primary action.
- Secondary actions remain accessible without crowding the row.
- No row-level functionality is removed.
- Regression coverage is added where row rendering or responsive action behavior changes.
- `vite build` and relevant tests pass.
