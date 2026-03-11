# Project Board Plan

This is a suggested board structure for the current issue set.

## Columns

### 1. Ready Next

Issues that should be started first within the active milestone.

Initial contents:

- `#49`
- `#52`
- `#31`
- `#43`
- `#34`
- `#38`

### 2. Ready Parallel

Issues that can be worked on at the same time with low conflict risk.

Initial contents:

- `#42`
- `#54`
- `#53`
- `#36`
- `#44`
- `#47`
- `#45`

### 3. Blocked by Earlier Issue

Issues that are valid but should wait for a preceding issue to define structure or behavior.

Initial contents:

- `#41` blocked by `#49`
- `#33` blocked by `#31`
- `#37` blocked by `#36`
- `#32` blocked by `#31`
- `#46` blocked by `#52`, `#34`, and `#35`
- `#51` blocked by `#52` and `#35`
- `#50` blocked by `#52` and `#46`
- `#39` blocked by `#38`

### 4. In Progress

Only move issues here when someone has clear ownership.

Rule:

- In `M5`, try to keep only one issue in progress at a time unless the surfaces are explicitly split.

### 5. Review / Validate

Issues that are implemented and need verification, regression checks, or UX signoff.

Checklist:

- acceptance criteria met
- tests added or updated
- no milestone conflicts introduced

### 6. Done

Completed and verified issues.

## Swimlane Option

If the board supports grouping, use milestone as the grouping key:

- `M1 Foundation & Safety`
- `M2 Architecture Extraction`
- `M3 Practice & Settings UX`
- `M4 Words UX Foundation`
- `M5 Advanced Words Interactions`
- `M6 Results & Coaching`

## Triage Rules

- Pull from `Ready Next` first.
- Move work to `Ready Parallel` only when it does not conflict with the current in-progress issue.
- Anything blocked by structure, behavior, or layout decisions stays in `Blocked by Earlier Issue`.
- Prefer finishing `M1` before starting `M5`.
- Prefer finishing `#38` before `#39`.
