# Issue Draft: Add drag-and-drop reordering to the practice-order list

## Summary

The `Words` page currently supports practice-order reordering with icon buttons only. Add drag-and-drop reordering so users can rearrange long lists faster with mouse or touch input.

## Why this matters

- Repeated move-up or move-down clicks are slow for long lists.
- Drag-and-drop is a more natural interaction for reorder-heavy workflows.
- The page already treats practice order as a first-class concept, so direct manipulation fits the current model well.

## Current behavior

- Practice order can be changed only through arrow controls in `src/components/WordsPanel.tsx`.
- Ordering state is managed in `src/features/trainer/useTrainer.ts`.
- Visual row behavior is styled in `src/styles.css`.

## Expected behavior

Users can drag a word row to a new position in the practice-order list, and the new order persists and immediately affects practice behavior the same way button-based reordering does.

## Proposed scope

- Add drag-and-drop interaction to the practice-order list.
- Support pointer and touch interaction.
- Keep the existing arrow controls unless removal is explicitly decided later.
- Persist the new order using the same order model already used by the words page.
- Ensure the active practice queue stays in sync after a drag reorder.

## Acceptance criteria

- A user can drag a practice-order row to a new position with a mouse.
- A user can drag a practice-order row on touch devices.
- The reordered list persists after reload.
- Practice uses the reordered list consistently when shuffle is off.
- Regression coverage is added in `src/App.test.tsx`.
- One E2E drag-and-drop flow is added in `tests/e2e/app.spec.ts`.
- `vite build` and relevant tests pass.
