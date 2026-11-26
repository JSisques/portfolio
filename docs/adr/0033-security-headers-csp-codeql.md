# 33. Security headers, Content Security Policy, and CodeQL

- Status: Accepted
- Date: 2026-11-26

## Context

Anyone can inspect the HTTP headers of the site in seconds, and the public repository can be scanned for vulnerable code. The site runs third-party scripts only where explicitly needed: Turnstile (ADR-0006) and Cloudflare Web Analytics (ADR-0025), plus one inline theme script (ADR-0028).

## Decision

- **Security headers** on every response, including:
  - `Strict-Transport-Security`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy`
  - `Permissions-Policy`
  - Framing protection (`frame-ancestors` in the CSP).
- A strict **Content Security Policy (CSP)** that only allows explicitly approved sources:
  - The inline theme script is allowed by its hash, not with `unsafe-inline`.
  - Turnstile and Cloudflare Web Analytics origins are allowed explicitly.
- Headers are defined once and applied on both targets: Cloudflare and the Node container image (ADR-0013).
- **CodeQL** scans the code in GitHub Actions on pull requests and on a schedule.

## Consequences

- Injected scripts (XSS) are blocked by the browser even if an injection point exists.
- Adding any new script, style, or external resource requires a deliberate CSP update.
- Header presence and CSP correctness are behavior, so they are tested (ADR-0015).
- CodeQL findings appear in GitHub code scanning. Whether they block merging is configured with the CI checks.
