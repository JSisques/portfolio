# 28. Light and dark themes with system default and manual toggle

- Status: Accepted
- Date: 2026-11-26

## Context

The visual identity (`docs/vision.md`) must work for every visitor. Some people rely on a specific color scheme for visual comfort. Accessibility is a required gate (ADR-0023).

## Decision

- The site supports **light and dark themes**.
- **Initial theme:** the visitor's system preference (`prefers-color-scheme`). When the system declares no preference, the site uses **dark**.
- A **manual toggle** lets visitors override the theme. Their choice is stored in `localStorage` and takes precedence on later visits.
- The theme is applied before the first paint (a small inline script in the document head) to avoid a flash of the wrong theme.
- Colors are defined as design tokens per theme (ADR-0017).

## Consequences

- Visitors' accessibility preferences are respected by default.
- Every color pairing must meet contrast requirements in both themes. Accessibility audits cover both.
- The stored preference is a strictly necessary user setting, not tracking, so it needs no consent banner.
- A small inline script runs on every page, which must be allowed by any future Content Security Policy.
