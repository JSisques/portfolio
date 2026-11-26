# 6. Cloudflare for hosting

- Status: Accepted
- Date: 2026-11-26

## Context

The site is statically generated (ADR-0005) but needs:

- A contact form endpoint with spam protection.
- A custom domain: `jsisques.net`, already registered with Cloudflare.
- Zero hosting cost.

Options considered: Cloudflare, Netlify, Vercel, and GitHub Pages. Netlify offers built-in forms with the least effort. GitHub Pages has no backend, so the form would depend on a third-party service.

## Decision

Host the site on **Cloudflare**, serving the custom domain `jsisques.net`.

- Pages are prerendered as static assets.
- The contact form is handled by our own server-side endpoint running on Cloudflare (through the Astro Cloudflare adapter).
- Spam protection uses Cloudflare Turnstile.
- Deployment and the scheduled daily rebuild (ADR-0005) run from GitHub Actions.

## Consequences

- Domain, DNS, and hosting live in a single provider.
- The form is owned code, with no form SaaS dependency.
- More initial setup than a built-in form service.
- Free tier limits must be verified during setup, because they change over time.
- How form submissions are delivered to me is still open.
