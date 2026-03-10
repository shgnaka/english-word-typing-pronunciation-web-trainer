# Issue Draft: Prioritize primary actions on the words page

## Summary

Rebalance the `Words` page so adding a word, searching, and managing the active practice list are visually clearer as the primary actions.

## Why this matters

- The page now supports many list types and management features.
- The current layout is capable, but first-glance attention is split across stats, search, creation, and multiple sections.
- Stronger information hierarchy would make the page easier to understand and faster to act within.

## Current behavior

- The page header, hero stats, add-word section, search toolbar, and list sections all appear in sequence with similar card weight.
- Hero metrics are visually prominent even though they are less actionable than add/search/manage tasks.
- Users must scan several blocks before identifying the main management workflow.

The structure is defined in `src/components/WordsPanel.tsx` and related layout components under `src/components/words/layout/`.

## Expected behavior

The top of the `Words` page should make the main workflows obvious: add a word, find a word, and manage what is currently active for practice.

## Proposed scope

- Rework top-of-page hierarchy across:
  - `WordsHero`
  - add-word section
  - search toolbar
  - active words section entry
- De-emphasize or compress less actionable summary stats if needed.
- Keep the existing word-management capabilities intact.
- Preserve the current visual language while making primary actions easier to spot.

## Acceptance criteria

- Add-word and search controls are more visually prominent than passive stats.
- The page more clearly communicates where active practice words are managed.
- No word-management behavior changes beyond presentation and layout hierarchy.
- Regression coverage is added only where rendering structure needs protection.
- `vite build` and relevant tests pass.
