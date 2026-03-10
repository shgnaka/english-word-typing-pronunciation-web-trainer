# Issue Draft: Sync active practice session with custom word list changes

## Summary

Custom word changes update `customWords` and `localStorage`, but they do not update the active practice session queue. As a result, the `Practice` screen can continue showing deleted or renamed words until the user manually restarts the session or applies settings.

## Why this matters

- The app lets users manage the practice vocabulary from the `Words` screen, so they reasonably expect those edits to affect the next practice flow immediately.
- A deleted word can still appear in the current session.
- An edited word can still appear under its old spelling in the current session.
- Reordering custom words does not affect the current queue even though order is persisted.

## Current behavior

`useTrainer` initializes the session once on mount and restarts it only when settings are applied or the explicit restart action is used.

- Session initialization: `src/features/trainer/useTrainer.ts:39`
- Explicit restart helper: `src/features/trainer/useTrainer.ts:57`
- Custom word mutations that do not restart or reconcile the session:
  - add: `src/features/trainer/useTrainer.ts:62`
  - remove: `src/features/trainer/useTrainer.ts:88`
  - reorder: `src/features/trainer/useTrainer.ts:100`
  - edit/save: `src/features/trainer/useTrainer.ts:141`

## Expected behavior

After a custom word is added, edited, removed, or reordered, the session should move into a consistent state. We should choose one clear rule and apply it everywhere:

1. Rebuild and restart the practice session immediately from the updated vocabulary, or
2. Reconcile the existing queue in place so removed/renamed words no longer appear and order-sensitive changes take effect predictably.

Option 1 is probably simpler and easier to explain to users.

## Reproduction

1. Open the app.
2. Go to `Words`.
3. Add `banana`.
4. Go to `Settings`, set `Words per session` to include the custom word, and apply.
5. Return to `Words` and rename or delete `banana`.
6. Go back to `Practice`.

Observed: the practice session can still contain the old `banana` entry because the queue was created before the edit.

## Test gap

Current tests verify word CRUD and persistence, but they do not verify how word-list mutations affect the active practice queue.

- Word CRUD coverage exists in `src/App.test.tsx:37`, `src/App.test.tsx:84`, `src/App.test.tsx:96`, and `src/App.test.tsx:131`.
- E2E covers add + duplicate validation in `tests/e2e/app.spec.ts:91`.
- No test currently asserts that editing/removing/reordering custom words updates the active session shown on `Practice`.

## Proposed scope

- Define the desired session-sync rule after custom word mutations.
- Update `useTrainer` so word list mutations keep the active session consistent with the current vocabulary.
- Add regression coverage in `src/App.test.tsx`.
- Add one E2E flow for a word edit or delete that verifies `Practice` reflects the change.

## Acceptance criteria

- A removed custom word never appears in `Practice` after the removal completes.
- An edited custom word is shown with its new text the next time it appears in `Practice`.
- Reordering custom words has a defined and tested effect on the next practice queue.
- Regression tests cover the chosen behavior.
