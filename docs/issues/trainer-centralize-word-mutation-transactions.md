# Issue Draft: Centralize trainer word mutation transactions

## Summary

`useTrainer` contains many handlers that each repeat the same pattern: derive next word state, write multiple React states, persist to `localStorage`, rebuild the session, and sometimes cancel inline editing. The behavior is currently correct, but the repetition makes future changes risky because every new rule has to be updated in many places.

## Why this matters

- A change to session sync rules or persistence rules can be missed in one handler.
- Small behavior differences are hard to notice in review because the handlers look similar but are not identical.
- The file has grown into a coordination layer for word CRUD, ordering, persistence, and session lifecycle all at once.

## Current hotspots

- custom word add/remove/edit flows in `src/features/trainer/useTrainer.ts`
- builtin word remove/restore flows in `src/features/trainer/useTrainer.ts`
- mixed bulk actions in `src/features/trainer/useTrainer.ts`

## Proposed direction

Introduce one shared mutation helper for word-list transactions, for example:

1. Calculate the next trainer data snapshot.
2. Persist only the affected slices.
3. Rebuild the active session from the same snapshot.
4. Run follow-up UI cleanup such as canceling edit mode.

## Acceptance criteria

- Word mutation handlers stop open-coding session sync and persistence steps.
- A new rule for word persistence or session rebuild can be changed in one shared path.
- Existing regression tests continue to pass without behavior changes.
