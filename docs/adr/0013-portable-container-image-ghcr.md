# 13. Portable container image on GitHub Container Registry

- Status: Accepted
- Date: 2026-11-26

## Context

Production runs on Cloudflare (ADR-0006). I want an alternative deployment path that lets the site run elsewhere (for example, self-hosted) if I ever leave Cloudflare. The image is also part of the showcase: the build and delivery pipeline is visible in the repository.

The same pattern is already used in another of my projects (house-radar): images published to GHCR from GitHub Actions.

## Decision

- Publish a container image of the **complete site**, contact form included, to **GitHub Container Registry** (`ghcr.io`).
- The image runs the site with the Astro Node adapter. The Cloudflare build remains the production build.
- Tags follow the house-radar convention:
  - `sha-<full commit>` on every push to `main`.
  - `<version>` (without leading `v`) on release tags.
- Runtime configuration (mail delivery, Turnstile keys) is provided through environment variables. No secrets are baked into the image.

## Consequences

- The site can run anywhere a container runs, with full functionality.
- Two build targets must be maintained and kept working: Cloudflare and Node.
- GitHub data inside an image is frozen at its build time. The daily refresh (ADR-0005) only applies to the Cloudflare deployment.
- Turnstile validation works outside Cloudflare, because verification is an HTTP API call.
- Mail delivery must be abstracted to run on both targets (ADR-0014).
