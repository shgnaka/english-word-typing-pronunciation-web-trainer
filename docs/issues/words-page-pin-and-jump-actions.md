# Issue Draft: Add pin-to-top and move-to-top/bottom actions

## Summary

Add faster ordering actions to the practice-order list so users can move a word directly to the top or bottom instead of clicking up or down repeatedly.

## Why this matters

- Long-distance reordering is still inefficient with one-step move actions.
- The current practice-order list encourages manual curation, so faster jump actions would improve usability.

## Current behavior

- Practice-order rows currently support one-step reordering only in `src/components/WordsPanel.tsx`.
- Ordering persistence and queue sync are handled in `src/features/trainer/useTrainer.ts`.

## Expected behavior

Users can move a word to the top or bottom of the practice-order list with one action, and the order persists consistently.

## Proposed scope

- Add `move to top` and `move to bottom` actions for practice-order rows.
- Optionally allow `pin to top` to share the same implementation if the product language prefers that phrasing.
- Keep one-step movement actions unless explicitly replaced later.

## Acceptance criteria

- A practice-order row can be moved to the top in one action.
- A practice-order row can be moved to the bottom in one action.
- The resulting order persists after reload.
- Practice uses the new order consistently when shuffle is off.
- Regression coverage is added in `src/App.test.tsx`.
- `vite build` and relevant tests pass.
