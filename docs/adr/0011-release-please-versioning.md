# 11. Releases and versioning with release-please

- Status: Accepted
- Date: 2026-11-26

## Context

Releases must be automated and derived from commit history (ADR-0010). The default branch is `main`. A website has no public API, so "breaking" must be defined for this project.

## Decision

- Releases are managed by **release-please** running in GitHub Actions on `main`.
- The **first release is `0.1.0`**.
- Versioning follows standard Semantic Versioning, including while the version is below 1.0.0:
  - `fix:` bumps the patch version (`0.1.0` to `0.1.1`).
  - `feat:` bumps the minor version (`0.1.0` to `0.2.0`).
  - A breaking change (`!` or `BREAKING CHANGE:`) bumps the major version (`0.x.y` to `1.0.0`).
- For this site, a breaking change means changing existing public URLs or a deep restructuring of the site.
- release-please maintains `CHANGELOG.md` and the version in `package.json`.

## Consequences

- Versions and changelog require no manual work.
- The first breaking change publishes `1.0.0`. Changing URLs or restructuring is a deliberate decision that declares the site stable.
- The exact release-please configuration that produces `0.1.0` as the first release is verified against current release-please documentation during setup.
- The relation between releases and production deployments is a separate decision.
