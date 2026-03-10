# Issue Draft: Clarify first-step guidance on the practice page

## Summary

Add clearer first-step guidance to the `Practice` screen so new or returning users can immediately understand how to begin and what the UI is asking them to do.

## Why this matters

- The practice interaction is simple once understood, but the screen relies on users inferring the flow from the current word and layout.
- First-time users may not know whether they should click, type immediately, wait for countdown, or use pronunciation first.
- A short onboarding-style cue would reduce hesitation without adding a full tutorial.

## Current behavior

- Focus moves into the practice panel when the screen opens.
- Empty and countdown states provide some contextual copy.
- There is no explicit short instruction that frames the core loop of "look at the word, type the highlighted character, use guides if needed."

The behavior is implemented in `src/App.tsx` and `src/components/PracticePanel.tsx`.

## Expected behavior

Users should be able to land on `Practice` and understand the next step within a few seconds, especially before typing begins.

## Proposed scope

- Add a brief first-step instruction near the current word or primary status area.
- Tailor the copy for relevant states such as:
  - ready to type
  - countdown active
  - no words available
- Keep the guidance concise and consistent with the existing app tone.
- Avoid introducing a multi-step modal or heavyweight onboarding flow.

## Acceptance criteria

- The `Practice` screen includes a short visible cue that explains the next action before or during typing.
- The guidance changes appropriately for empty/countdown/ready states where needed.
- Existing focus and keyboard behavior remain unchanged.
- Regression coverage is added if state-specific rendering logic changes.
- `vite build` and relevant tests pass.
