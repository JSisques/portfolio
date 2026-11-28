# 36. Fail the build when GitHub data cannot be fetched

- Status: Accepted
- Date: 2026-11-28

## Context

Project metadata is fetched from the GitHub API at build time (ADR-0005). ADR-0005 requires that a GitHub API failure never publishes a broken site, and leaves open whether the build fails or falls back to the last known data.

A fallback needs a committed snapshot of the data, kept up to date by extra commits, and can silently publish stale data. Deploys only run after a successful build (ADR-0012), so a failed build leaves the last published version in production.

## Decision

- Any GitHub API failure during the build fails the build: an HTTP error, a network error, a response that does not match the expected shape, or a featured repository that does not exist. The error message names the repository.
- A featured repository without a narrative in every locale also fails the build.
- No snapshot or fallback data is kept.
- When `GITHUB_TOKEN` is set, it is sent as a bearer token so builds are not limited by the unauthenticated rate limit. CI, preview, and deploy builds pass the workflow token.
- End-to-end and Lighthouse builds read GitHub data from a JSON fixture named by the `GITHUB_DATA_FIXTURE` environment variable, so tests never call the real API. Without that variable, the build always calls the API.

## Consequences

- A broken or partial projects section is never published: production keeps the last successful deploy.
- A GitHub outage blocks CI builds, previews, and the daily rebuild until the API recovers. Rerunning the job is the recovery.
- There is no snapshot to maintain.
- The fixture variable is a test seam in the build. It must never be set in the preview or deploy workflows.
