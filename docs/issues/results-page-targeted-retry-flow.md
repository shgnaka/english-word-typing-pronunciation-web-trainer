# Issue Draft: Add a targeted retry path from the results page

## Summary

Add a follow-up action on the `Results` page that lets users quickly retry a focused subset of words instead of only starting a full new session.

## Why this matters

- The results screen currently ends with a single broad restart action.
- Users often want to revisit difficult words immediately while the feedback is fresh.
- A targeted retry path would make the results page more useful as a learning checkpoint.

## Current behavior

- The page shows one CTA to start a new session through `trainer.restartSession()`.
- Per-word results are visible, but there is no direct action to practice weak items again.
- Difficulty signals already exist through elapsed time and mistake counts.

The current CTA and results rendering live in `src/components/ResultsPanel.tsx`.

## Expected behavior

Users should be able to launch a focused follow-up practice flow from results, based on the words that were slowest, most error-prone, or otherwise flagged by the current session data.

## Proposed scope

- Add one targeted retry action alongside or near the existing restart CTA.
- Define a simple retry selection rule using existing result signals.
- Reuse the current practice/session model where possible instead of introducing a separate mode with entirely new settings.
- Keep the full restart path available.

## Acceptance criteria

- The results page offers a targeted retry action when completed-word data exists.
- The retry flow uses a clearly defined subset of current-session words.
- The existing full restart action remains available.
- Regression coverage is added for the retry-selection behavior.
- `vite build` and relevant tests pass.
