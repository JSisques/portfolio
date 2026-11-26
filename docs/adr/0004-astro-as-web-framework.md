# 4. Astro as web framework

- Status: Accepted
- Date: 2026-11-26

## Context

The site is a content-driven professional showcase (see `docs/vision.md`) with these needs:

- Mostly static content, with fast load times.
- Local, translated project narrative (ADR-0002).
- Spanish and English versions (ADR-0003).
- One interactive element: the contact form.

The portfolio is itself a project that visitors may inspect, so it should be built with a technology I can master.

## Decision

Use **Astro** as the web framework. The exact version is pinned when the project is scaffolded.

## Consequences

- Static HTML by default with no client JavaScript unless explicitly needed, which favors performance.
- Content collections hold the per-language project narrative with typed schemas.
- Built-in i18n routing covers the Spanish and English versions.
- Interactivity (the contact form) is isolated in islands or server endpoints.
- I already have working knowledge of Astro, and this project is a chance to deepen it.
- Rendering mode (fully static or with server-side parts) remains open. It depends on GitHub data freshness and contact form processing.
