# 20. Pull requests to main with squash merge

- Status: Accepted
- Date: 2026-11-26

## Context

Changes can be committed directly to `main` or reach it through branches and pull requests. release-please reads the commits on `main` (ADR-0011), so the merge strategy determines what appears in the changelog.

## Decision

- All changes reach `main` through **feature branches and pull requests**. Direct pushes to `main` are blocked by branch protection.
- Pull requests are merged with **squash merge only**. Merge commits and rebase merges are disabled.
- The squash commit message is the **pull request title**, which must be a valid Conventional Commit (ADR-0010). CI validates it.
- Required CI checks must pass before merging.

## Consequences

- One pull request becomes one commit on `main` and one changelog entry.
- `main` has a linear history, and each change can be reverted with a single `git revert`.
- Commits inside a branch can be small work steps. They are still validated by the `commit-msg` hook (ADR-0019).
- The pull request title carries the release semantics (`feat`, `fix`, breaking), so it must be written deliberately.
- Repository settings (branch protection, allowed merge methods, squash message source) must be configured in GitHub.
