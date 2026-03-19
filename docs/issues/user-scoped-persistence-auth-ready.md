# Issue Draft: Make persistence user-scoped so login can be added later with minimal diff

## Summary

The app currently persists all user-editable state directly in `localStorage` through fixed keys such as `wordbeat.customWords` and `wordbeat.sessionConfig`. That is fine for a single anonymous browser profile, but it makes future login support invasive because identity and persistence are coupled.

This issue prepares the codebase for login by introducing a user-scoped persistence boundary without implementing authentication itself.

## Why this matters

- Login will be much easier if persisted data already lives behind a `userId` or `profileId` boundary.
- We want the anonymous, single-browser flow to keep working unchanged.
- We want later auth work to swap in a real identity source without rewriting trainer logic.

## Current hotspots

- Persistence helpers: `src/infra/storage.ts`
- Preference bootstrapping: `src/features/trainer/trainerData.ts`
- Main state mutation hub: `src/features/trainer/useTrainer.ts`
- App bootstrap: `src/App.tsx`

## Proposed direction

1. Introduce a single persistence scope abstraction, for example `StorageScope`, `ProfileId`, or `UserContext`.
2. Make every persisted trainer record read and write through that scope.
3. Keep one default anonymous scope so the app still behaves exactly as it does today.
4. Keep auth out of trainer logic by letting the trainer receive a scope value, not an auth provider.
5. Centralize scope selection in one place so a future login screen only changes that one source.

## Recommended boundary

- `src/infra/storage.ts` owns record serialization, migration, and scoped key composition.
- `src/features/trainer/trainerData.ts` loads preferences for the active scope.
- `src/features/trainer/useTrainer.ts` saves preference and word mutations for the active scope.
- `src/App.tsx` only supplies the current scope to the trainer.

## Suggested data model

- `scopeId`: string, with `anonymous` as the default initial value.
- Persisted keys become scope-aware, for example `wordbeat.<scopeId>.customWords`.
- All existing trainer records stay separate per scope:
  - custom words
  - builtin word overrides
  - builtin word order
  - session config
  - display language
  - words panel state
  - theme preference

## Important constraint

Do not spread auth checks throughout the app. The goal is to make login a replacement for the current scope source, not a new condition inside every screen and mutation path.

## Implementation steps

1. Define a scope abstraction and a scoped key helper.
2. Update storage load/save helpers to accept a scope.
3. Thread the active scope through trainer bootstrapping.
4. Keep the anonymous scope as the default so behavior does not change.
5. Add regression coverage for loading and saving scoped data.
6. Leave actual login UI and remote account sync for a later issue.

## Acceptance criteria

- The app still works without login.
- Trainer data is stored per scope instead of globally.
- The persistence layer can switch scopes without changing trainer business logic.
- Adding real authentication later only needs to provide a different active scope source.
- Existing storage migration and recovery behavior remains intact.

