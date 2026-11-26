# How this project is built

This site is built by directing AI agents, not by typing every line by hand. The value I bring is defining the problem, making the decisions, and verifying the output. This document explains that workflow for anyone inspecting the repository.

## 1. Decisions come first

Before anything is built, it is discussed using a Socratic process: questions, options, and tradeoffs, until the decision is clear.

- Product intent (purpose, audience, scope) is written in [`docs/vision.md`](vision.md).
- Each technical or delivery decision is written as an ADR in [`docs/adr/`](adr/) (ADR-0001). An ADR records the context, the decision, and its consequences.
- Accepted ADRs are not edited. When a decision changes, a new ADR supersedes the old one, so the history stays readable.
- The visual direction lives in [`DESIGN.md`](../DESIGN.md).

## 2. Agents follow written rules

Agents do not rely on chat history to know how to work here. The rules are versioned in the repository (ADR-0030):

- [`AGENTS.md`](../AGENTS.md) is the single source of rules for every agent: conventions, TDD, the ADR process, commands, and quality gates.
- `CLAUDE.md` only imports `AGENTS.md`, so every harness follows the same rules.

## 3. Work is planned as tasks

Each release is split into small tasks. Every task has a GitHub issue under the release milestone and an entry in the tracking document in [`odd/tasks/`](../odd/tasks/), which keeps the specifications, task status, and a log of decisions and evidence.

## 4. Tests define the behavior

Development is test-driven (ADR-0015): a failing test describes the behavior, then the implementation makes it pass, then the code is cleaned up while the tests stay green. Tests are the specification that AI-generated code must satisfy. End-to-end tests cover the site as a visitor uses it (ADR-0016).

## 5. From branch to release

1. Each task is developed on its own branch and opened as a pull request to `main` (ADR-0020).
2. Commits and pull request titles follow Conventional Commits (ADR-0010). Local Git hooks check formatting, linting, commit messages, and affected tests (ADR-0019).
3. CI runs the full checks. All of them must pass before merging (ADR-0022, ADR-0023).
4. Pull requests are squash-merged, so each one becomes a single commit on `main`.
5. release-please reads those commits and prepares the next version and changelog (ADR-0011). A `feat` bumps the minor version, a `fix` bumps the patch version, and a breaking change bumps the major version.
6. Publishing a release deploys the site (ADR-0012) and publishes a container image of the site (ADR-0013).

## 6. The human stays in charge

Agents propose and execute. I approve decisions, review the results, and decide what gets merged and released.
