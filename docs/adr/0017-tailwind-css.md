# 17. Tailwind CSS for styling

- Status: Accepted
- Date: 2026-11-26

## Context

Options considered: Astro scoped CSS with CSS custom properties as design tokens (native, no dependencies) and Tailwind CSS (fast iteration, well supported by AI harnesses, but class-heavy markup and a risk of a generic look).

## Decision

- Use **Tailwind CSS** for styling. The version and Astro integration method are pinned when the project is scaffolded.
- Design tokens (colors, typography, spacing, radius) are defined once in the Tailwind theme configuration. Components use those tokens instead of arbitrary one-off values.

## Consequences

- Fast iteration, and markup that AI harnesses generate fluently.
- Centralized tokens keep the visual identity consistent and avoid the generic default look.
- Markup is denser. Repeated class groups are extracted into Astro components, not duplicated.
- The visual identity itself (palette, typography) is a separate decision.
