# 12. Production deploys on release

- Status: Accepted
- Date: 2026-11-26

## Context

Production (`jsisques.net` on Cloudflare, ADR-0006) can be updated on every merge to `main` or only when a release is published (ADR-0011). The site is also rebuilt daily to refresh GitHub data (ADR-0005).

## Decision

- Production is deployed **only when a release is published**: when release-please creates a `v*` tag.
- The **scheduled daily rebuild deploys the latest release tag**, never the current `main` HEAD. It refreshes data without publishing unreleased changes.
- release-please runs with a dedicated token (`RELEASE_PLEASE_TOKEN`), because tags created with the default `GITHUB_TOKEN` do not trigger other workflows.

## Consequences

- What runs in production always matches a released, versioned state.
- Changes accumulate on `main` until the release pull request is merged.
- The daily rebuild workflow must resolve and check out the latest release tag.
- A dedicated token must be created and stored as a repository secret.
- Previewing unreleased changes before release (for example, preview deployments) is a separate decision.
