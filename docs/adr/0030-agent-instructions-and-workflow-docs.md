# 30. Agent instructions and workflow documentation

- Status: Accepted
- Date: 2026-11-26

## Context

The repository is living proof of an AI-driven way of working (`docs/vision.md`). Anyone inspecting it should understand how agents work on this project, and agents themselves need consistent project rules. Different harnesses read different instruction files: most read `AGENTS.md`, while Claude Code reads `CLAUDE.md`. Duplicated instructions drift apart, and agents then follow different rules.

## Decision

- **`AGENTS.md`** is the single source of project rules for any agent: conventions, TDD, ADR process, commands, and quality gates.
- **`CLAUDE.md`** imports `AGENTS.md` (`@AGENTS.md`) and only adds instructions that are specific to Claude Code, if any.
- **`docs/workflow.md`** explains the workflow for humans: how decisions are made (Socratic process and ADRs), how agents are directed, and how changes flow from branch to release.
- Harness-local generated files (for example, `.atl/`) are not versioned and are listed in `.gitignore`.

## Consequences

- Every agent follows the same rules, whatever harness runs it.
- Human visitors get a readable explanation of the process, backed by real ADRs and pull requests.
- `AGENTS.md` must be updated whenever a decision changes the rules agents follow.
