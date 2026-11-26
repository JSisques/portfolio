# 26. URL structure with locale prefixes and English slugs

- Status: Accepted
- Date: 2026-11-26

## Context

The site is available in Spanish (default) and English (ADR-0003). Changing public URLs later is a breaking change that publishes `1.0.0` (ADR-0011), so the structure must be right from the start.

## Decision

- **Every page has a locale prefix:** `/es/...` and `/en/...`.
- The root `/` redirects to the default locale, `/es/`.
- **Slugs are in English and identical in both languages:** `/es/projects` and `/en/projects`.
- Every page declares its alternate versions with `hreflang` links, plus `x-default` pointing to the Spanish version.

## Consequences

- Symmetric, predictable URLs. Switching language only changes the prefix.
- Adding another language later does not change existing URLs.
- Spanish URLs contain English words. This is accepted in exchange for simpler routing and a one-to-one mapping between languages.
- URLs are slightly longer than with an unprefixed default locale.
- The exact Astro i18n configuration (prefixing the default locale and the root redirect) is verified during setup.
