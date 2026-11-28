# About and experience sections (issue #9, release task T9)

Objective: who the owner is and where they have worked, in both languages.
Branch: `feat/about-experience` (worktree `portfolio-worktrees/about-experience`, based on `origin/main` 4a356bc). Delivery: one squash-merged PR (`single-pr`). Runners: Vitest (`pnpm test`), Playwright (`pnpm test:e2e`).

## Specs

Quoted from GitHub issue #9. Read `DESIGN.md` (Identity motif, Typography), `docs/vision.md`, `AGENTS.md`, and ADR-0015, ADR-0017, ADR-0029 in `docs/adr/` before working.

- **S1** "Typed content collections for about and experience, per language. Entries declare visibility: site, CV, or both (ADR-0029)."
- **S2** "About me: first-person, with a one-line stack summary and the AI-driven way of working (`docs/vision.md`)."
- **S3** "Experience: roles, responsibilities, and impact, with no confidential details."
- **S4** "Margin notes identity motif, inline on mobile (`DESIGN.md`)."
  Acceptance: "Margin notes link to real targets and adapt on mobile."
- **S5** "Real content comes from the owner. Until then, honest `[REAL DATA]` placeholders only. No invented roles, dates, or companies."
- **S6** Acceptance: "Both sections render in `es` and `en`."

Assumptions (orchestrator, not owner-requested):

- Sections are presentational components that receive entries as props; the page reads the collections (container-presentational).
- Section anchors are locale-agnostic: `#about` and `#experience`.
- Margin note targets are absolute `https://` URLs to real artifacts (ADRs, PRs, repositories on GitHub). Placeholder entries only carry notes whose target already exists (site ADRs); experience placeholders carry no notes.
- Experience periods are free text (`period`) until the owner provides real dates.

## Tasks

| ID  | Specs      | Title                                                                                                  | Route                                          | Status  | Commit |
| --- | ---------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------- | ------- | ------ |
| T1  | S1, S5     | Content collections `about` and `experience`, visibility filter, placeholders, section heading strings | inline                                         | pending |        |
| T2  | S4         | `MarginNote` component: margin on desktop, inline on mobile, real link                                 | inline                                         | pending |        |
| T3  | S2, S4, S6 | `AboutSection` component with its integration test                                                     | delegated: parallel with T4, disjoint surfaces | pending |        |
| T4  | S3, S4, S6 | `ExperienceSection` component with its integration test                                                | delegated: parallel with T3, disjoint surfaces | pending |        |
| T5  | S4, S6     | Wire sections into the locale page, e2e (both locales, mobile notes)                                   | inline                                         | pending |        |

Dependencies: T3 and T4 depend on T1 and T2. T5 depends on T3 and T4. Risk: none expected (no high-risk item).

## Log

- **L1** (2026-11-28, user, verbatim): "En un worktree nuevo desde main y usando el modo orquestación y la skill de atomic tasks para aprovechar los modelos locales y los agentes que tenemos vamos a trabajar en esta issue https://github.com/JSisques/portfolio/issues/9"
- **L2** (2026-11-28): issue #7 is merged (#22), so T9's dependency holds even though `release-0-1-0.md` still lists T7 as pending.
