# 34. Self-hosted fonts

- Status: Accepted
- Date: 2026-11-26

## Context

The typography uses Source Serif 4 and Source Sans 3 (`DESIGN.md`). Loading fonts from a third-party CDN (for example, Google Fonts) adds external requests, widens the Content Security Policy (ADR-0033), sends visitor data to a third party (GDPR), and can hurt the performance budget (ADR-0023).

## Decision

- Fonts are **self-hosted**: served from the site's own origin and installed as package dependencies (for example, Fontsource), not loaded from an external CDN.
- Only the weights and subsets actually used are shipped, in `woff2`.
- Critical fonts are preloaded, and `font-display` avoids invisible text while fonts load.

## Consequences

- No third-party font requests: the CSP stays strict and no visitor data reaches a font provider.
- Font versions are pinned and updated by Renovate (ADR-0032).
- Font files count toward the performance budget, so weights and subsets are kept to a minimum.
