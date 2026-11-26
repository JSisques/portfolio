# 10. Conventional Commits

- Status: Accepted
- Date: 2026-11-26

## Context

Releases are automated with release-please, which derives the next version and the changelog from commit messages. That only works when commits follow a machine-readable convention.

## Decision

- All commits on `main` follow the **Conventional Commits** specification (https://www.conventionalcommits.org/).
- Common types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `ci`, `build`, `perf`, `style`.
- Breaking changes use `!` after the type or a `BREAKING CHANGE:` footer.
- Commits contain no AI attribution trailers.

## Consequences

- Versions and changelog entries are derived automatically.
- Commit history stays readable and consistent.
- Enforcement (for example, commit linting in a hook or in CI) is a separate decision.
