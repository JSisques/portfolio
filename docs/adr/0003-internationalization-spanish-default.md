# 3. Internationalization: Spanish default, English secondary

- Status: Accepted
- Date: 2026-11-26

## Context

The audience includes Spanish-speaking and international recruiters and technical profiles. Project narrative is local and per language (see ADR-0002).

## Decision

- The site is available in **Spanish (`es`)** and **English (`en`)**.
- **Spanish is the default language.**
- All user-facing content (UI copy and project narrative) exists in both languages.

## Consequences

- Every piece of content must be written and maintained twice.
- Routing, language switching, and SEO for multiple languages (for example `hreflang` and the URL structure) must be defined with the stack.
