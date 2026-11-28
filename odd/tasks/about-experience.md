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

| ID  | Specs      | Title                                                                                                  | Route                                          | Status | Commit  |
| --- | ---------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------- | ------ | ------- |
| T1  | S1, S5     | Content collections `about` and `experience`, visibility filter, placeholders, section heading strings | inline                                         | done   | 4f34a47 |
| T2  | S4         | `MarginNotes` component: margin on desktop, inline on mobile, real link                                | inline                                         | done   | f7b3434 |
| T3  | S2, S4, S6 | `AboutSection` component with its integration test                                                     | delegated: parallel with T4, disjoint surfaces | done   | 25191a0 |
| T4  | S3, S4, S6 | `ExperienceSection` component with its integration test                                                | delegated: parallel with T3, disjoint surfaces | done   | c9a7bad |
| T5  | S4, S6     | Wire sections into the locale page, e2e (both locales, mobile notes)                                   | inline                                         | done   | this    |

Dependencies: T3 and T4 depend on T1 and T2. T5 depends on T3 and T4. Risk: none expected (no high-risk item).

## Log

- **L1** (2026-11-28, user, verbatim): "En un worktree nuevo desde main y usando el modo orquestaciÃ³n y la skill de atomic tasks para aprovechar los modelos locales y los agentes que tenemos vamos a trabajar en esta issue https://github.com/JSisques/portfolio/issues/9"
- **L2** (2026-11-28): issue #7 is merged (#22), so T9's dependency holds even though `release-0-1-0.md` still lists T7 as pending.
- **L3** (2026-11-28): `getCollection` returns empty under Vitest: Vitest runs Vite as `serve`, so Astro reads the data store from `.astro/`, while `astro sync` writes it to `node_modules/.astro/` (`node_modules/astro/dist/content/paths.js`). Decision: sections are presentational and tested with props through the Container API; the page reads the collections and the wiring is covered by e2e on the built site. The build validates every entry against the schema.
- **L4** (2026-11-28): T1 RED (missing module) â†’ GREEN, `pnpm test` 50 passed, `pnpm check` and `pnpm lint` exit 0. T2 RED (missing component) â†’ GREEN, 3 passed. Assess after T2 over 4a356bc..f7b3434: medium, `review_due: false` (`under_budget`), pending boundary 4a356bc.
- **L5** (2026-11-28): T3 and T4 ran as parallel `gentle-ai-worker` writers with disjoint surfaces; the parent added the `responsibilitiesHeading` and `impactHeading` UI keys before launch. T3 RED (missing component) â†’ GREEN 8 passed; T4 RED â†’ GREEN 7 passed. T3 reported `pnpm check` red only from T4's in-progress file (shared-tree race); it is green after T4. Seam: the parent aligned the About `h2` size with Experience.
- **L6** (2026-11-28): T5 wired both sections into `src/pages/[lang]/index.astro`. The e2e spec was written before the wiring but not run in RED (a build per run); it passes against the wired page. Seam check: `pnpm test` 68 passed, `pnpm test:e2e` 33 passed (axe in both themes and locales), `pnpm check`, `pnpm lint`, `pnpm format:check`, `pnpm build` exit 0.
