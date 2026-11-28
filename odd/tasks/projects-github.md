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

| ID  | Specs          | Title                                                                                       | Route                                              | Status  | Risk                              | Commit |
| --- | -------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------- | --------------------------------- | ------ |
| T1  | S3             | ADR-0036 (fail the build), `Project` contract types, section UI strings                     | inline                                             | pending | none                              |        |
| T2  | S2, S3, S5     | GitHub adapter `fetchRepository`: injected fetch, token, payload validation, typed failures | delegated: parallel with T3, T4, disjoint surfaces | pending | none                              |        |
| T3  | S1, S4, S6     | `projects` collection, featured list, placeholder narratives, `buildProjects` merge         | delegated: parallel with T2, T4, disjoint surfaces | pending | none                              |        |
| T4  | S2, S4, S7     | `ProjectsSection` component with its integration test                                       | delegated: parallel with T2, T3, disjoint surfaces | pending | none                              |        |
| T5  | S2, S3, S5, S7 | Wire into the locale page, fixture source, e2e both locales, `GITHUB_TOKEN` in CI workflows | inline                                             | pending | item 5 (CI workflows), own commit |        |

Dependencies: T2, T3, T4 depend on T1. T5 depends on T2, T3, T4.

## Log

- **L1** (2026-11-28, user, verbatim): "En un worktree nuevo desde main y usando el modo orquestación y la skill de atomic tasks para aprovechar los modelos locales y los agentes que tenemos vamos a trabajar en esta issue https://github.com/JSisques/portfolio/issues/10"
- **L2** (2026-11-28, owner answers): API failure: "Fail the build (Recommended)". Featured repositories: "jsisques/portfolio, jsisques/agent-radar". Both repositories are public (`gh api`, `private: false`).
