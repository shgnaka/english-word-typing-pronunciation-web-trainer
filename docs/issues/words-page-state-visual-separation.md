# Issue Draft: Improve visual separation between active, hidden, and local-only word states

## Summary

Strengthen the visual distinction between active words, hidden words, and locally saved custom words that are not currently in practice.

## Why this matters

- The words page now supports multiple list types and word states.
- State differences are functionally correct, but they can still be hard to scan quickly.
- Better visual separation would reduce mistakes and make the page easier to understand at a glance.

## Current behavior

- Sections and chips are visually similar across active and hidden states.
- State labels exist, but the overall layout still relies heavily on text interpretation.
- Styling lives primarily in `src/styles.css`, with state rendering in `src/components/WordsPanel.tsx`.

## Expected behavior

Users can quickly identify whether a word is active, hidden, built-in, or custom without needing to read each row carefully.

## Proposed scope

- Improve section-level visual hierarchy for active vs hidden groups.
- Strengthen badges, labels, or color treatment for word states.
- Keep the current app visual language, but make state groupings more legible and intentional.

## Acceptance criteria

- Active, hidden built-in, and hidden custom sections are easier to distinguish visually.
- Row-level state markers are clearer than the current baseline.
- No behavior changes are introduced beyond presentation.
- Regression coverage is added only where rendering/state labels need protection.
- `vite build` and relevant tests pass.
