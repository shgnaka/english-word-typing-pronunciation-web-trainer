# Issue Draft: Persist minimized and expanded section state on the words page

## Summary

Persist the minimized or expanded state of words-page sections so users return to the layout they prefer.

## Why this matters

- The page now has multiple sections with collapse controls.
- Section state currently resets on reload because it is held in local component state.
- Remembering layout preferences would make the page feel more personal and reduce repetitive setup.

## Current behavior

- Section minimize and expand state is local UI state in `src/components/WordsPanel.tsx`.
- It is not persisted in current storage logic.

## Expected behavior

Collapsed or expanded section state persists across reloads and is restored when the page is reopened.

## Proposed scope

- Persist section visibility state for:
  - built-in words
  - hidden built-in words
  - custom words
  - hidden custom words
- Use the app’s existing local persistence approach.

## Acceptance criteria

- Section collapse state persists after reload.
- Each supported section restores its last saved state.
- No current words-page behaviors regress.
- Regression coverage is added in `src/App.test.tsx`.
- Persistence behavior is covered where appropriate.
- `vite build` and relevant tests pass.
