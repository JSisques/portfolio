# Release 0.1.0

Objective: deliver the first release (`0.1.0`) of jsisques.net as defined in `docs/vision.md`, `DESIGN.md`, and ADR-0001 to ADR-0034.
Branch: one feature branch and one squash-merged pull request per task, into `main` (ADR-0020). Delivery: `ask-on-risk`. Test runners: Vitest (unit and integration), Playwright (end-to-end).
GitHub tracking: milestone `v0.1.0`, one issue per task.

## Specs

- **S1** Personal portfolio. User: "va a ser mi web personal donde poder indicar los proyectos en los que he trabajado y cosas así, vamos un portfolio". Scope and audience: `docs/vision.md`.
- **S2** Every decision is documented. User: "usemos el método socratico para definir e ir documentando absolutamente todo, desde tecnologias, releases con releas please con la version 0.1.0 como primera, ADRs y todo lo que necesitesmos". New decisions get a new ADR (ADR-0001).
- **S3** Main branch. User: "La rama principal será main". Changes reach `main` only through squash-merged pull requests (ADR-0020).
- **S4** Releases with release-please, first version `0.1.0`. User: "Un feat sube a 0.2.0 y un fix a 0.1.1 un breaking a 1.0.0" (ADR-0011).
- **S5** Deploy on release plus a package on GitHub Packages. User: "Al publicar una release y tambien me gustaría generar el propio package en github packages como hacemos en house-radar". Container image of the complete site (ADR-0012, ADR-0013, ADR-0014).
- **S6** TDD. User: "Vamos a utilizar TDD a si que todo tiene qeu ir testeado y usando vitest. Quiero test unitarios, de integración y e2e" and "Si usa playwrigth para e2e" (ADR-0015, ADR-0016).
- **S7** Git hooks. User: "Hooks con hysky de precommit, pre push, en el prepush hay que probar test:changed" and "Si añade el commit msg" (ADR-0019).
- **S8** Dependencies and security. User: "para la actualización de dependencias usamos renovate con pin y auto merge, para seguridad cabeceras, CSP (que no se que es) y CODEQL" (ADR-0032, ADR-0033).
- **S9** CI gates. User: "que se tengan que pasar todas las actions para mergear y que por defecto cuando se mergea main se borre la rama" (ADR-0022, ADR-0023). Required status checks are added to ruleset `protect-main` once workflows exist.
- **S10** Agent instructions. User: "En el repo tiene que haber AGENTS md y CLAUDE.md, una explicacion para humanos del flujo de trabajo tambien podría estar bien" (ADR-0030).
- **S11** Design. User: "despues definimos la paleta el diseño y la tipografia usando las skills de antislop". Direction in `DESIGN.md`, antislop applied during the work. User: "Vale y si hay que tener en cunenta mobile tambien".
- **S12** CV. User: "Generado desde el contedio de la web y con posibilidda de que sea modificado por mi, pero no quiero una ruta tipo /cv ni cosas así" (ADR-0029).
- **S13** No fabricated content. Content not yet provided by the owner uses honest placeholders (`[REAL DATA]`). Which projects to feature is deferred by the owner.

## Tasks

| ID | Issue | Specs | Title | Route | Status | Commit |
| --- | --- | --- | --- | --- | --- | --- |
| T1 | #1 | S1, S2, S10 | `chore: scaffold Astro project` | inline | done (branch `chore/scaffold-astro-project`) | see L5 |
| T2 | #2 | S3, S7 | `chore: add linting, formatting and git hooks` | inline | pending | |
| T3 | #3 | S6 | `test: set up Vitest and Playwright` | inline | pending | |
| T4 | #4 | S3, S4, S9 | `ci: add CI pipeline and release-please` | inline | pending | |
| T5 | #5 | S5 | `ci: add Cloudflare deploy, previews and daily rebuild` | inline | pending | |
| T6 | #6 | S8, S9 | `ci: add CodeQL, Renovate and Lighthouse CI` | inline | pending | |
| T7 | #7 | S1, S11 | `feat: add i18n routing, base layout and themes` | inline | pending | |
| T8 | #8 | S8 | `feat: add security headers and content security policy` | inline | pending | |
| T9 | #9 | S1, S11, S13 | `feat: add about and experience sections` | inline | pending | |
| T10 | #10 | S1, S13 | `feat: add projects with GitHub data` | inline | pending | |
| T11 | #11 | S1, S6 | `feat: add contact form with mail adapters` | inline | pending | |
| T12 | #12 | S12 | `feat: generate CV PDFs from site content` | inline | pending | |
| T13 | #13 | S5 | `ci: publish container image to GHCR` | inline | pending | |
| T14 | #14 | S1 | `feat: add Cloudflare Web Analytics` | inline | pending | |

Route evidence: all tasks start inline. No writer trigger applies yet (units are sequential and depend on earlier ones).

## Log

- **L1** (2026-11-26) Original request: "Te explico lo que quiero en este repo, va a ser mi web personal donde poder indicar los proyectos en los que he trabajado y cosas así, vamos un portfolio. Mi idea es que usemos el método socratico para definir e ir documentando absolutamente todo, desde tecnologias, releases con releas please con la version 0.1.0 como primera, ADRs y todo lo que necesitesmos. La rama principal será main"
- **L2** (2026-11-26) Definition phase closed: `docs/vision.md`, ADR-0001 to ADR-0034, and `DESIGN.md` committed in `131e847` and pushed to `origin/main`.
- **L3** (2026-11-26) GitHub configured: squash-only merges, PR title as squash title, branch deletion on merge, ruleset `protect-main` (id 28160503). `RELEASE_PLEASE_TOKEN` secret created by the owner.
- **L4** (2026-11-26) Plan approved by the owner: "Si me encaja, crealo con sus milestones labels etc etc". Milestone, labels, and issues created on GitHub.
- **L5** (2026-11-26) T1 implemented in worktree `portfolio-worktrees/chore-scaffold-astro-project`. Pinned: astro 7.4.13 (engines `node >=22.23.4`, so Node 26 is compatible; no fallback ADR needed), tailwindcss and @tailwindcss/vite 4.3.5 (Vite plugin, the method recommended for Astro >=5.2), @astrojs/check 0.9.12, typescript 6.0.3 (TypeScript 7 is outside the `@astrojs/check` peer range `^5 || ^6`), pnpm 12.23.0, Node 26. tsconfig extends `astro/tsconfigs/strictest`. Personal content paths declared in `LICENSE`: `src/content/`, `src/assets/personal/`, `public/personal/`. Evidence on Node v26.12.1: clean `pnpm install --frozen-lockfile` exit 0, `pnpm build` exit 0, `pnpm check` 0 errors; a probe with an implicit `any` made `astro check` fail (exit 1), confirming strict mode.
- Next step: owner opens the pull request for T1, then T2.
