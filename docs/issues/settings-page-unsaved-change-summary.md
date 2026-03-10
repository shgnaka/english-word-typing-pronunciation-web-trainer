# Issue Draft: Summarize unsaved setting changes before apply

## Summary

Improve the `Settings` page status area so it explains not only that changes are pending, but also which values have been changed and are waiting to be applied.

## Why this matters

- The page already tracks pending changes, but the current status copy is generic.
- Users can lose confidence when they cannot quickly confirm what they changed before clicking `Apply`.
- A concise pending-change summary would make the draft/apply model more transparent.

## Current behavior

- The status area shows only a synced or pending message.
- Users must visually rescan the whole page to remember what was modified.
- Apply and discard are available, but the exact pending diff is not summarized.

The relevant UI is in `src/components/SettingsPanel.tsx`, with draft state managed through the trainer state.

## Expected behavior

When there are pending changes, the page should summarize the changed settings in a lightweight way near the existing status area.

## Proposed scope

- Expand the pending status region to list changed setting labels and, where helpful, before/after values.
- Keep the summary concise and easy to scan.
- Preserve the current apply/discard workflow.
- Do not introduce a separate confirmation modal for routine changes.

## Acceptance criteria

- Pending changes show a concise visible summary before apply.
- Synced state still renders clearly when no changes are pending.
- Apply and discard behavior remain unchanged.
- Regression coverage is added for pending-status rendering logic.
- `vite build` and relevant tests pass.
