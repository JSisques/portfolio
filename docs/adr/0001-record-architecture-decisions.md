# 1. Record architecture decisions

- Status: Accepted
- Date: 2026-11-26

## Context

This project is defined through a Socratic process: every relevant decision (technology, content, delivery, releases) is discussed before it is implemented. Those decisions and their reasoning must remain traceable over time.

## Decision

We record every significant decision as an Architecture Decision Record (ADR) in `docs/adr/`.

- File name: `NNNN-kebab-case-title.md`, numbered sequentially.
- Sections: Status, Date, Context, Decision, Consequences.
- Status values: Proposed, Accepted, Deprecated, Superseded by ADR-NNNN.
- ADRs are immutable once accepted. A changed decision gets a new ADR that supersedes the old one.
- Cross-cutting product intent (purpose, audience, scope) lives in `docs/vision.md`, not in ADRs.

## Consequences

- Every decision has a written rationale that can be reviewed later.
- Adds a small writing cost per decision.
