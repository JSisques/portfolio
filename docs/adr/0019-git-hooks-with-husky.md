# 19. Git hooks with Husky

- Status: Accepted
- Date: 2026-11-26

## Context

Formatting, linting, tests, and Conventional Commits (ADR-0010, ADR-0015, ADR-0018) must be enforced. Relying only on CI reports failures late, after pushing. A malformed commit message is especially harmful: release-please silently ignores it, so the change is missing from the changelog.

## Decision

Use **Husky** to run local Git hooks:

| Hook         | Runs                                                                    |
| ------------ | ----------------------------------------------------------------------- |
| `pre-commit` | Prettier and ESLint on staged files only, through lint-staged.          |
| `commit-msg` | commitlint with the Conventional Commits configuration.                 |
| `pre-push`   | `pnpm test:changed`: Vitest tests affected by the commits being pushed. |

`test:changed` compares against `origin/main` (for example, `vitest run --changed origin/main`). Vitest's `--changed` without a reference only considers uncommitted changes. In `pre-push` everything is already committed, so it would run no tests and always pass.

## Consequences

- Most problems are caught before they leave my machine.
- Some local friction: commits and pushes take longer.
- Hooks can be bypassed (`--no-verify`), so CI must still run the full checks as the source of truth.
- The exact `test:changed` command is verified against current Vitest documentation during setup.
