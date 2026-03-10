# Issue Draft: Add clearer coaching feedback to the results page

## Summary

Strengthen the `Results` page so it highlights what went well and what needs improvement instead of relying mainly on raw metrics and a flat word-by-word list.

## Why this matters

- WPM, accuracy, score, and level are useful, but they do not fully tell users what to improve next.
- The current feedback items are helpful but still lightweight relative to the learning goal.
- Better coaching-oriented summary content would make the results screen more actionable.

## Current behavior

- The page shows score cards, a short summary sentence, several feedback lines, and a list of completed words.
- Word-level results are presented uniformly even when some words clearly need more attention.
- The next learning takeaway is not strongly emphasized.

The results UI is implemented in `src/components/ResultsPanel.tsx`.

## Expected behavior

The results screen should clearly surface at least one positive takeaway and one recommended improvement focus so users know what to carry into the next session.

## Proposed scope

- Rework the summary/feedback area to separate:
  - strengths
  - improvement opportunities
- Keep the current score metrics.
- Derive guidance from existing session data rather than introducing new scoring systems.
- Avoid turning the page into a dense analytics dashboard.

## Acceptance criteria

- The results page includes clearer coaching-style feedback than the current baseline.
- At least one positive takeaway and one improvement cue are visible when results exist.
- Existing scoring behavior remains unchanged.
- Regression coverage is added where feedback rendering logic changes.
- `vite build` and relevant tests pass.
