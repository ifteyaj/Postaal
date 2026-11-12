# Postaal UI/UX Principles

## Product feel

Postaal should feel like a focused, modern creative workspace rather than a dense enterprise dashboard.

The interface should be clean, calm, and efficient. Visual polish matters, but clarity and speed take priority.

## Studio is the hero

The Studio is the primary product experience:
- Composer and controls on one side.
- Realistic previews on the other side on wide screens.
- Responsive stacked or tabbed behavior on narrow screens.
- Minimal friction between editing and previewing.

## Preview quality

- Use platform-specific layouts and typography.
- Represent the relevant UI chrome without overloading the preview.
- Show account identity only when known; use clearly labeled sample identity otherwise.
- Make crop behavior understandable.
- Distinguish simulated elements from actual platform data.
- Never show fake engagement as real metrics.

## Interaction principles

- Autosave behavior, if implemented, must be visible and recoverable.
- Draft, scheduled, publishing, published, and failed states must be visually distinct.
- Errors should explain what happened and what the user can do next.
- Warnings should not look like blocking errors.
- Destructive actions require clear confirmation.
- Keyboard navigation and focus states are required.

## Responsive behavior

Desktop: composer and preview can be visible together.

Tablet: allow adjustable or stacked panels.

Mobile: prioritize composing and provide a dedicated preview view rather than shrinking a desktop split view beyond usability.

## Design tokens

Define color, typography, spacing, radius, elevation, and motion tokens in the application design system. Do not scatter arbitrary values across components.
