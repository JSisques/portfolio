# 32. Renovate with pinned dependencies and automerge

- Status: Accepted
- Date: 2026-11-26

## Context

Without automated updates, dependencies age and accumulate security issues. Updates must be reproducible and must not create manual work for every patch. Strong CI gates (ADR-0022, ADR-0023) make automated merging safe.

## Decision

- Use **Renovate** for dependency updates.
- **Pin** dependencies to exact versions. GitHub Actions are pinned to commit digests.
- **Automerge** updates when every required CI check passes.
- **Major updates are not automerged**: they open a pull request for manual review, because they may contain breaking changes that tests do not cover.
- Renovate pull request titles follow Conventional Commits (ADR-0010, ADR-0020): `chore(deps): ...` for dependency updates.

## Consequences

- Builds are reproducible, and every version change is an explicit pull request.
- Most updates need no manual work.
- Automerge is only as safe as the CI gates. Weakening the gates also weakens automerge.
- `chore` commits do not trigger a release (ADR-0011). Updated dependencies reach production with the next `feat` or `fix` release, or with a deliberate release when an update is urgent (for example, a security fix).
