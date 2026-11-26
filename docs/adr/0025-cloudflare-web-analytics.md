# 25. Cloudflare Web Analytics

- Status: Accepted
- Date: 2026-11-26

## Context

Knowing whether the site is visited, and from where, is useful. Options considered:

- **Google Analytics or similar:** cookies require a consent banner (GDPR), and third-party scripts hurt performance (ADR-0023).
- **Cloudflare Web Analytics:** free, cookieless, minimal impact. It provides basic data: visits, pages, countries, and referrers.
- **No analytics:** no cost and no risk, but no visibility.

## Decision

Use **Cloudflare Web Analytics** in production only. No cookie-based analytics and no consent banner.

## Consequences

- Basic traffic insight with no cookie banner and minimal performance cost.
- Previews, local builds, and the container image do not report analytics, so data reflects real visitors only.
- The privacy notice mentions analytics, even though no cookies are used.
- Whether the beacon is injected automatically or added as a snippet depends on how the site is served on Cloudflare. This is verified during setup, and the beacon must not break the Lighthouse thresholds.
