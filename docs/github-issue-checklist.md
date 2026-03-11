# GitHub Issue Checklist

Use this in the umbrella backlog issue or milestone tracking issue.

## M1 Foundation & Safety

- [ ] #49 Sync active practice session with custom word list changes
- [ ] #41 Centralize trainer word mutation transactions
- [ ] #42 Extract persistence codecs and add app-level recovery coverage

Parallel OK:

- `#49` and `#42`

Avoid parallel:

- `#49` and `#41`
- `#41` and `#42` when both touch trainer boot or persistence wiring

## M2 Architecture Extraction

- [ ] #52 Refactor repeated words-page row logic into shared row components
- [ ] #54 Split i18n catalog by domain and add safer message helpers
- [ ] #53 Extract pronunciation orchestration and add race-condition coverage

Parallel OK:

- `#52` and `#54`
- `#52` and `#53`
- `#53` and `#54`

## M3 Practice & Settings UX

- [ ] #31 Unify practice status messaging into one primary status area
- [ ] #36 Reorganize settings by when changes take effect
- [ ] #33 Clarify first-step guidance on the practice page
- [ ] #37 Summarize unsaved setting changes before apply
- [ ] #32 Reduce mobile guide density on the practice page

Parallel OK:

- `#31` and `#36`
- `#33` and `#37`

Avoid parallel:

- `#31` and `#33`
- `#31` and `#32`
- `#36` and `#37`

## M4 Words UX Foundation

- [ ] #43 Highlight matches in filtered search results
- [ ] #44 Add actionable empty states to the words page
- [ ] #47 Improve visual separation between active, hidden, and local-only word states
- [ ] #48 Persist minimized and expanded section state on the words page
- [ ] #45 Add sorting helpers for custom words

Parallel OK:

- `#43`, `#44`, and `#47`
- `#48` and `#45`

## M5 Advanced Words Interactions

- [ ] #34 Prioritize primary actions on the words page
- [ ] #35 Reduce per-row action density on the words page
- [ ] #46 Add pin-to-top and move-to-top/bottom actions
- [ ] #51 Add bulk actions to the words page
- [ ] #50 Add drag-and-drop reordering to the practice-order list

Parallel OK:

- Prefer sequential delivery

Avoid parallel:

- `#34` and `#35`
- `#34` and `#46`
- `#35` and `#51`
- `#46` and `#50`
- `#50` and `#51`

## M6 Results & Coaching

- [ ] #38 Add clearer coaching feedback to the results page
- [ ] #39 Add a targeted retry path from the results page

Parallel OK:

- Best done sequentially
