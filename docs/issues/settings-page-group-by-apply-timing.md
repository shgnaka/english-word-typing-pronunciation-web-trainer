# Issue Draft: Reorganize settings by when changes take effect

## Summary

Restructure the `Settings` page so controls are grouped by when they apply, making it easier to understand which changes affect the current session and which require apply/restart behavior.

## Why this matters

- The page already distinguishes draft versus applied settings, but that rule is not obvious from the layout alone.
- Users can change several controls without clearly understanding whether the effect is immediate or deferred.
- Grouping by apply timing would reduce confusion and make the settings model easier to learn.

## Current behavior

- Settings are grouped broadly into session and assist sections.
- Hints mention when changes apply, but the structure still requires careful reading.
- Pending-versus-synced state is shown separately at the bottom.

The settings UI is rendered in `src/components/SettingsPanel.tsx`.

## Expected behavior

Users should be able to tell at a glance which settings are applied immediately, which require explicit apply, and how those groups relate to the current session.

## Proposed scope

- Revisit section grouping and labels on the `Settings` page.
- Organize controls around effect timing and mental model rather than only feature category.
- Keep the existing draft/apply/discard behavior unless a small presentation-only refinement is needed.
- Preserve all current settings.

## Acceptance criteria

- The settings layout makes apply timing easier to understand than the current baseline.
- Existing configuration behavior is preserved.
- Apply/discard controls remain discoverable and consistent with the new grouping.
- Regression coverage is added if settings rendering structure changes materially.
- `vite build` and relevant tests pass.
