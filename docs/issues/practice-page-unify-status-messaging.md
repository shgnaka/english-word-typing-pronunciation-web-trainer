# Issue Draft: Unify practice status messaging into one primary status area

## Summary

Consolidate practice-state messaging so countdown, pronunciation status, typing feedback, and empty/completion guidance are presented through one primary status area instead of several competing blocks.

## Why this matters

- The `Practice` screen currently surfaces multiple status messages at once.
- Countdown, pronunciation, and typing feedback can compete for attention during the same moment.
- A single clear status region would reduce scanning effort and make the main task easier to follow.

## Current behavior

- Countdown is shown in `countdown-banner`.
- Pronunciation progress is shown in `pronunciation-status`.
- Typing correctness is exposed through feedback and accessibility status copy.
- Empty and completion guidance are handled separately in the panel layout.

These states are rendered across `src/components/PracticePanel.tsx` and styled in `src/styles.css`.

## Expected behavior

The screen should have one visually primary status area that explains the most important current state. Secondary hints can still exist, but they should no longer compete equally with the main status message.

## Proposed scope

- Define a priority order for practice states such as:
  - empty
  - countdown
  - incorrect input
  - pronunciation in progress
  - active typing
  - complete
- Replace the current scattered presentation with one primary status component or region.
- Keep accessibility announcements aligned with the visible status message.
- Preserve current practice behavior and controls.

## Acceptance criteria

- The `Practice` screen shows one primary visible status area at a time.
- Countdown, pronunciation, incorrect-input, empty, and completion states all map to the unified status treatment.
- Accessibility announcements stay accurate for the visible state.
- No practice interactions regress.
- Regression coverage is added in `src/App.test.tsx` where rendering/state priority needs protection.
- `vite build` and relevant tests pass.
