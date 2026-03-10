# Issue Draft: Refactor repeated words-page row logic into shared row components

## Summary

Refactor repeated rendering logic in the `Words` page into shared row-level components without changing intended behavior.

## Why this matters

- `src/components/WordsPanel.tsx` now contains repeated row rendering for active, built-in, hidden built-in, custom, and hidden custom states.
- The page is becoming harder to change safely because small UI updates must be repeated in several branches.
- Shared components would reduce duplication and improve maintainability.

## Current behavior

- Row rendering is largely inline inside `src/components/WordsPanel.tsx`.
- Similar edit/view/action patterns are repeated with small variations.

## Expected behavior

The words page should preserve current UX and behavior while reducing duplication and making future changes safer.

## Proposed scope

- Extract shared row rendering patterns into reusable components or helpers.
- Keep existing test IDs and user-visible behavior unless a change is required for cleanup safety.
- Preserve current words-page state flows managed by `src/features/trainer/useTrainer.ts`.

## Acceptance criteria

- Repeated row rendering logic is meaningfully reduced.
- Existing behavior remains unchanged from a user perspective.
- Existing tests continue to pass with minimal necessary updates.
- `vite build` and relevant tests pass.
