# Issue Draft: Add actionable empty states to the words page

## Summary

Replace passive empty-state text on the words page with more helpful hints or direct actions where appropriate.

## Why this matters

- Several sections currently show plain text when empty.
- Empty states are opportunities to guide the next useful action instead of only describing absence.

## Current behavior

- Empty custom, hidden built-in, hidden custom, and search-result states mostly use plain copy in `src/components/WordsPanel.tsx`.

## Expected behavior

Empty states should help the user understand what to do next, ideally with a contextual hint or CTA where it adds value.

## Proposed scope

- Review the empty states for:
  - custom words
  - hidden built-in words
  - hidden custom words
  - filtered search results
- Replace plain passive text with action-oriented hints or lightweight CTAs where useful.

## Acceptance criteria

- Empty sections provide clearer next-step guidance than the current baseline.
- Actions or hints fit the section context and do not create dead ends.
- No current words-page behavior regresses.
- Regression coverage is added only where rendering logic changes need protection.
- `vite build` and relevant tests pass.
