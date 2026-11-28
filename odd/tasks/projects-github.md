# Projects with GitHub data (issue #10, release task T10)

Objective: featured projects with live GitHub data and a local, translated narrative.
Branch: `feat/projects-github` (worktree `portfolio-worktrees/feat-projects-github`, based on `origin/main` 4e16096). Delivery: one squash-merged PR (`single-pr`). Runners: Vitest (`pnpm test`), Playwright (`pnpm test:e2e`).

## Specs

Quoted from GitHub issue #10. Read `DESIGN.md` (Margin notes, Rhythm, Surface), `AGENTS.md`, and ADR-0002, ADR-0005, ADR-0015, ADR-0017, ADR-0029, ADR-0036 in `docs/adr/` before working.

- **S1** "Explicit list of featured repositories (ADR-0002)." Owner choice (L2): `JSisques/portfolio`, `JSisques/agent-radar`.
- **S2** "GitHub data fetched at build time: language, stars, last update, links (ADR-0005)."
- **S3** "Defined behavior when the GitHub API fails during the build (open decision in ADR-0005)." Owner decision (L2): fail the build. Acceptance: "A GitHub API failure never publishes a broken site."
- **S4** "Local, translated narrative per project, including how it was built."
- **S5** "Tests use a mocked GitHub API."
- **S6** "Which projects to feature is deferred by the owner. Until then, honest placeholders only." Narrative text not yet written by the owner uses `[REAL DATA]`.
- **S7** Acceptance: "Projects render with GitHub data and local narrative in both languages."

Assumptions (orchestrator, not owner-requested):

- Contract (T1): `src/projects/types.ts` defines `RepositoryData` (GitHub facts) and `Project` (narrative plus `RepositoryData`), consumed by T2, T3, and T4.
- The featured list is `featuredRepositories` in `src/projects/featured.ts`; its order is the display order. Narrative lives in a `projects` content collection, one YAML per repository and locale (`src/content/projects/<locale>/<repo-name>.yaml`), with the shared `entryBase` (locale, visibility, notes) and a `repository` field (`owner/name`).
- A featured repository without a narrative in a locale, an HTTP error, a network error, or an invalid payload fails the build with a message naming the repository.
- `GITHUB_TOKEN`, when set, is sent as a bearer token to avoid the unauthenticated rate limit. The CI build, preview, and deploy jobs pass the workflow `GITHUB_TOKEN`.
- e2e and Lighthouse builds read GitHub data from a JSON fixture named by `GITHUB_DATA_FIXTURE` instead of the network (S5). Without that variable the build always calls the API.
- Last update is GitHub `pushed_at`, rendered as a localized date (`<time datetime>`). Links: the repository URL, and the homepage when GitHub has one.
- Section anchor: `#projects`. The section is a list of comparable entries on the secondary surface (DESIGN.md).

## Tasks

| ID  | Specs          | Title                                                                                       | Route                                              | Status | Risk                              | Commit           |
| --- | -------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------ | --------------------------------- | ---------------- |
| T1  | S3             | ADR-0036 (fail the build), `Project` contract types, section UI strings                     | inline                                             | done   | none                              | 24f2941          |
| T2  | S2, S3, S5     | GitHub adapter `fetchRepository`: injected fetch, token, payload validation, typed failures | delegated: parallel with T3, T4, disjoint surfaces | done   | none                              | f77e6e6          |
| T3  | S1, S4, S6     | `projects` collection, featured list, placeholder narratives, `buildProjects` merge         | delegated: parallel with T2, T4, disjoint surfaces | done   | none                              | 72ec61a          |
| T4  | S2, S4, S7     | `ProjectsSection` component with its integration test                                       | delegated: parallel with T2, T3, disjoint surfaces | done   | none                              | 442eec6          |
| T5  | S2, S3, S5, S7 | Wire into the locale page, fixture source, e2e both locales, `GITHUB_TOKEN` in CI workflows | inline                                             | done   | item 5 (CI workflows), own commit | 6f3a565, 5f879b7 |

Dependencies: T2, T3, T4 depend on T1. T5 depends on T2, T3, T4.

## Log

- **L1** (2026-11-28, user, verbatim): "En un worktree nuevo desde main y usando el modo orquestación y la skill de atomic tasks para aprovechar los modelos locales y los agentes que tenemos vamos a trabajar en esta issue https://github.com/JSisques/portfolio/issues/10"
- **L2** (2026-11-28, owner answers): API failure: "Fail the build (Recommended)". Featured repositories: "jsisques/portfolio, jsisques/agent-radar". Both repositories are public (`gh api`, `private: false`).
- **L3** (2026-11-28): T1 inline (24f2941): ADR-0036, `src/projects/types.ts`, section UI strings; `pnpm test` 68 passed, `pnpm check`/`pnpm lint` exit 0.
- **L4** (2026-11-28): T2, T3, T4 ran as parallel `gentle-ai-worker` writers with disjoint surfaces. T2 RED (missing module) to GREEN 13 passed; T3 RED (9 schema tests, build module missing) to GREEN 30 passed; T4 RED (missing component) to GREEN 13 passed. Parent review: every diff stayed inside its surface. Parent hardening in T2: a GitHub `homepage` that is not an http(s) URL maps to `null` (test added after the fix, no RED observed).
- **L5** (2026-11-28): T5 inline. `src/projects/load.ts` RED (missing module) to GREEN. `tests/integration/locale-home.test.ts` mocks an empty featured list, because collections are empty under Vitest (see `about-experience.md` L3) and that test must not call the API. Evidence: `pnpm test` 117 passed; `pnpm check` 0 errors; `pnpm lint`, `pnpm format:check` exit 0; real-API build exit 0 with both projects in `dist/es/index.html`; build with a missing fixture fails (ENOENT); build with an invalid token fails ("GitHub API returned HTTP 401 for repository JSisques/portfolio"); `pnpm test:e2e` 35 passed; fixture build plus `pnpm test:lighthouse` exit 0.
- **L6** (2026-11-28): RDD assess over 4e16096..5f879b7 with `--escalate-item 5`: `high`, `review_due: true` (`high_risk`). Independent verifier launched before native review.
- **L7** (2026-11-28): Independent verifier: S1-S7 pass, no blockers; workflows valid, token only as step env of `pnpm build`, permissions unchanged, fixture absent from preview and deploy. Its regression probes added to `src/projects/load.test.ts` (fixture `[]`, malformed JSON); `pnpm test` 119 passed. Follow-ups, not blocking: fixture `fullName` is not checked against its key; no Vitest render of the full page with projects (e2e covers it).
