# 9. pnpm as package manager

- Status: Accepted
- Date: 2026-11-26

## Context

The project needs a package manager. Options considered: npm (bundled with Node), pnpm (fast and strict about dependencies), and Bun (fastest, less mature compatibility).

## Decision

Use **pnpm**. The exact version is pinned through the `packageManager` field in `package.json` when the project is scaffolded.

## Consequences

- Strict dependency resolution: code cannot import packages that are not declared.
- Fast installs with a content-addressable store.
- CI must set up pnpm explicitly (for example, `pnpm/action-setup`).
- `pnpm-lock.yaml` is committed and is the single lockfile.
