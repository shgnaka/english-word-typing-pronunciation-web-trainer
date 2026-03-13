# Issue Draft: Extract persistence codecs and add app-level recovery coverage

## Summary

`src/infra/storage.ts` now sanitizes malformed `localStorage` data before the app uses it, but the parsing and migration rules are still hand-written per key. That makes future schema changes error-prone because each new persisted field needs custom validation, migration, and regression coverage.

## Why this matters

- Storage schema changes are one of the easiest ways to introduce upgrade regressions.
- The current validation logic is safe, but it is not yet organized as reusable codecs or parsers.
- Most coverage lives at the storage-unit level, so we do not yet verify enough corrupted-storage recovery paths through full app boot.

## Current hotspots

- per-key parsing and migration in `src/infra/storage.ts`
- boot-time preference loading in `src/features/trainer/trainerData.ts`
- app initialization paths covered indirectly by `src/App.test.tsx`

## Proposed direction

1. Introduce one small codec/parser helper per persisted record shape.
2. Reuse those codecs for both save and load paths so schema rules live in one place.
3. Add app-level regression tests that boot with corrupted persisted data and verify the UI recovers to a safe state.

## Acceptance criteria

- Every persisted record shape has one clearly named parser/codec.
- Adding a new persisted field does not require duplicating validation rules across multiple branches.
- The app has regression coverage for booting with malformed saved preferences and still rendering a usable session.
