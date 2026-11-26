# 5. GitHub data fetched at build time

- Status: Accepted
- Date: 2026-11-26

## Context

Project metadata comes from the GitHub API (ADR-0002). It can be fetched at build time or on every visit. The data (stars, language, last update) changes slowly, and a delay of about a day is irrelevant for a professional showcase.

## Decision

- Fetch GitHub data **at build time**. Pages are generated as static HTML.
- Rebuild the site **on a schedule** (initially once a day) so the data stays reasonably current.

## Consequences

- No runtime calls to GitHub: visitors are not affected by API rate limits or outages.
- The site can be served as static files.
- A scheduled rebuild is required, which ties this decision to the CI and hosting choices.
- A GitHub API failure during the build must not publish a broken site. The exact behavior (fail the build or fall back to the last known data) is still open.
- The contact form still needs a processing mechanism outside the static pages (open question in `docs/vision.md`).
