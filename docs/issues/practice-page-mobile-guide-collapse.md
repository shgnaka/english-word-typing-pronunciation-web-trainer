# Issue Draft: Reduce mobile guide density on the practice page

## Summary

Adjust the mobile `Practice` layout so the keyboard guide and finger guide do not crowd the main typing flow or push the active word too far below the fold.

## Why this matters

- The `Practice` screen prioritizes active typing, but supporting guides can consume substantial vertical space on small screens.
- Mobile users should reach the current word and next action immediately without scrolling past assistance content.
- Secondary guidance is still valuable, but it should not dominate the first viewport.

## Current behavior

- The typing-active layout stacks metrics, word stage, keyboard guide, finger guide, feedback, and actions vertically.
- On narrow screens, the guides can make the page feel long and visually dense.
- The current responsive rules in `src/styles.css` mostly compress spacing rather than change information priority.

## Expected behavior

On mobile-sized viewports, the primary word stage and typing feedback should remain in the first viewport. Keyboard and finger guidance should become easier to reveal on demand or visually de-emphasize when not needed.

## Proposed scope

- Rework mobile-only layout priority for the typing-active `Practice` screen.
- Choose one compact mobile treatment for keyboard and finger guidance, such as:
  - collapsible panels, or
  - a lightweight segmented/tabbed reveal, or
  - one default-visible guide with the other collapsed
- Keep desktop behavior close to the current experience.
- Preserve existing settings that enable or disable the guides.

## Acceptance criteria

- On a mobile viewport, the current word and main typing state remain visible without needing to scroll past both guides.
- Keyboard and finger guidance remain accessible when enabled.
- Desktop `Practice` behavior does not regress.
- Regression coverage is added where layout-state rendering logic changes.
- `vite build` and relevant tests pass.
