# 22. Continuous integration checks

- Status: Accepted
- Date: 2026-11-26

## Context

Local hooks can be bypassed (ADR-0019), so CI is the source of truth for quality. Pull requests can only be merged when required checks pass (ADR-0020).

## Decision

CI runs on GitHub Actions for every pull request to `main`. All of these checks are **required** to merge:

| Check | Validates |
| --- | --- |
| PR title | The title is a valid Conventional Commit (ADR-0020). |
| Format and lint | Prettier and ESLint (ADR-0018). |
| Types | `astro check` (ADR-0018). |
| Unit and integration tests | The **full** Vitest suite, not only affected tests (ADR-0015). |
| End-to-end tests | Playwright (ADR-0016). |
| Build | Both targets: Cloudflare and Node/container image (ADR-0013). |

End-to-end tests run against a **local build inside CI**, with test doubles for the mail port and Turnstile test keys. They never depend on the preview deployment or on network services. Which build target is served for end-to-end tests is defined during setup, preferring the one closest to production.

## Consequences

- Nothing reaches `main` without passing every quality gate.
- End-to-end tests are deterministic and independent of the preview deployment.
- The full pipeline is slower than the local hooks. Caching (pnpm store, Playwright browsers) mitigates it.
- Preview deployments (ADR-0021) are visual review aids, not quality gates.
