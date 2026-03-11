# Issue Draft: Extract pronunciation orchestration and add race-condition coverage

## Summary

Pronunciation behavior is currently split across `useTrainerPronunciation`, `speech.ts`, and `browserTts.ts`, with a mix of React effects, module-level mutable state, and fire-and-forget async work. The behavior works, but it is becoming harder to change safely because cancellation, fallback, preloading, and UI status updates are coordinated in several layers at once.

## Why this matters

- Audio behavior is stateful and asynchronous, which makes regressions easy when adding features.
- The current flow mixes UI concerns and infrastructure concerns, so ownership boundaries are blurry.
- Coverage exists for some low-level paths, but we do not yet test enough race conditions such as rapid word changes, repeated manual pronunciation clicks, or fallback transitions after background generation fails.

## Current hotspots

- `src/features/trainer/useTrainerPronunciation.ts`
- `src/infra/speech.ts`
- `src/infra/browserTts.ts`

## Proposed direction

1. Introduce one pronunciation orchestrator/service that owns request deduping, fallback policy, and status transitions.
2. Keep React hooks focused on wiring UI lifecycle to the orchestrator instead of coordinating all async branches directly.
3. Add regression coverage for quick session transitions, repeated manual triggers, and browser-TTS failure/fallback sequences.

## Acceptance criteria

- Pronunciation state transitions are defined in one place instead of being spread across hook effects and infra helpers.
- Manual and automatic pronunciation flows share the same fallback and deduping rules.
- Tests cover race-prone scenarios such as rapid current-word changes, overlapping manual requests, and browser-TTS fallback behavior.
