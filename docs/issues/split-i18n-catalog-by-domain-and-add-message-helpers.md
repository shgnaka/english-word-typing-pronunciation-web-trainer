# Issue Draft: Split i18n catalog by domain and add safer message helpers

## Summary

`src/i18n.ts` currently contains one very large `MessageKey` union and one large inlined message catalog for every language. It is still type-checked, but the file has become a single high-churn merge hotspot and makes copy changes riskier because unrelated screens share one giant editing surface.

## Why this matters

- Adding or editing copy for one screen means touching a file that also defines every other screen.
- The large manual key union increases maintenance cost when new messages are added or renamed.
- String interpolation is currently ad hoc through repeated `.replace(...)` chains in components, which makes formatting rules easier to miss during future copy changes.

## Current hotspots

- `src/i18n.ts`
- component-level string interpolation in `src/components/PracticePanel.tsx`
- message lookups across `src/components/*` and `src/features/*`

## Proposed direction

1. Split message catalogs by feature or screen and compose them into the final locale object.
2. Derive key types from a source locale object instead of maintaining one large manual union.
3. Add small message-format helpers for placeholder replacement so components stop open-coding repeated `.replace(...)` chains.

## Acceptance criteria

- Copy changes for one feature can usually stay within that feature's catalog file.
- Message keys are derived from locale objects or another single source of truth.
- Placeholder replacement uses shared helpers, reducing repetitive formatting logic in components.
