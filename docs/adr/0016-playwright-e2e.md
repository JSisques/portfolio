# 16. Playwright for end-to-end tests

- Status: Accepted
- Date: 2026-11-26

## Context

ADR-0015 requires end-to-end tests. Vitest covers unit and integration tests, but its browser mode targets component testing, not navigating a complete built site.

## Decision

Use **Playwright** for end-to-end tests. They run in real browsers against the built site and cover critical user journeys:

- Navigation between sections.
- Language switching between Spanish and English.
- Submitting the contact form.

## Consequences

- Two test runners: Vitest (unit and integration) and Playwright (end-to-end).
- End-to-end tests never send real email or depend on live third-party services. The site under test uses test doubles for the mail port and test keys for Turnstile.
- Which build target end-to-end tests run against (Cloudflare or Node) is defined when CI is set up.
- Browser binaries must be installed in CI, which adds time to the pipeline.
