# Implementation Milestone Plan

This note turns the current GitHub milestones into an execution guide.

## M1 Foundation & Safety

Purpose: fix correctness risks first and reduce the chance that later feature work adds more duplication.

Start with:

1. `#49 Sync active practice session with custom word list changes`
2. `#41 Centralize trainer word mutation transactions`
3. `#42 Extract persistence codecs and add app-level recovery coverage`

Parallel OK:

- `#49` and `#42`

High-conflict combinations:

- `#49` and `#41`
- `#41` and `#42` if both touch trainer boot/persistence wiring at the same time

Notes:

- `#49` sets the behavior rule.
- `#41` should consolidate around that rule rather than define a competing one.
- `#42` can proceed in parallel if it stays focused on storage parsing and boot recovery coverage.

## M2 Architecture Extraction

Purpose: create safer seams before more UX changes pile onto the same files.

Start with:

1. `#52 Refactor repeated words-page row logic into shared row components`
2. `#54 Split i18n catalog by domain and add safer message helpers`
3. `#53 Extract pronunciation orchestration and add race-condition coverage`

Parallel OK:

- `#52` and `#54`
- `#52` and `#53`
- `#53` and `#54`

High-conflict combinations:

- Low direct conflict overall; these are intentionally split by concern

Notes:

- `#52` lowers risk for later Words-page interaction work.
- `#54` lowers risk for later Practice, Settings, and Results copy work.
- `#53` lowers risk for later Practice-panel behavior changes.

## M3 Practice & Settings UX

Purpose: improve practice flow and settings clarity after architecture work has reduced churn.

Start with:

1. `#31 Unify practice status messaging into one primary status area`
2. `#36 Reorganize settings by when changes take effect`
3. `#33 Clarify first-step guidance on the practice page`
4. `#37 Summarize unsaved setting changes before apply`
5. `#32 Reduce mobile guide density on the practice page`

Parallel OK:

- `#31` and `#36`
- `#33` and `#37`
- `#32` can run after `#31` stabilizes

High-conflict combinations:

- `#31` and `#33`
- `#31` and `#32`
- `#36` and `#37`

Notes:

- `#31` should land before further practice copy/layout changes so it defines the main status structure.
- `#36` should land before `#37` so the pending-summary UI reflects the final settings grouping.

## M4 Words UX Foundation

Purpose: deliver low-to-medium coupling improvements that make the Words page clearer without heavily changing interaction models.

Start with:

1. `#43 Highlight matches in filtered search results`
2. `#44 Add actionable empty states to the words page`
3. `#47 Improve visual separation between active, hidden, and local-only word states`
4. `#48 Persist minimized and expanded section state on the words page`
5. `#45 Add sorting helpers for custom words`

Parallel OK:

- `#43`, `#44`, and `#47`
- `#48` and `#45`

High-conflict combinations:

- `#47` with any broad visual restyle of the same sections
- `#48` with section-structure rewrites

Notes:

- These issues are relatively safe to split across contributors if each person owns a different Words sub-area.

## M5 Advanced Words Interactions

Purpose: implement higher-interference interaction changes only after Words foundations and shared row structure are stable.

Start with:

1. `#34 Prioritize primary actions on the words page`
2. `#35 Reduce per-row action density on the words page`
3. `#46 Add pin-to-top and move-to-top/bottom actions`
4. `#51 Add bulk actions to the words page`
5. `#50 Add drag-and-drop reordering to the practice-order list`

Parallel OK:

- At most one major interaction issue in flight in the same Words area
- If parallelized, split by surface with very clear ownership and rebasing discipline

High-conflict combinations:

- `#34` and `#35`
- `#34` and `#46`
- `#35` and `#51`
- `#46` and `#50`
- `#50` and `#51`

Notes:

- This milestone is the most conflict-prone.
- Prefer sequential delivery or very short-lived branches.
- `#50` should come late because drag-and-drop tends to collide with row structure and action layout work.

## M6 Results & Coaching

Purpose: finish the results flow after practice/session behavior is stable.

Start with:

1. `#38 Add clearer coaching feedback to the results page`
2. `#39 Add a targeted retry path from the results page`

Parallel OK:

- Best done sequentially

High-conflict combinations:

- `#38` and `#39`

Notes:

- `#38` should define the information architecture for the results view.
- `#39` should attach retry behavior to that stabilized structure.

## Cross-Milestone Guidance

- Treat `#40 UI backlog: prioritize practice, words, settings, and results improvements` as an umbrella tracker, not an implementation issue.
- Finish `M1` before starting `M5`.
- Prefer landing `M2` before most of `M3`, `M5`, and `M6`.
- If capacity is limited, the highest-value path is `M1 -> M2 -> M3`.
