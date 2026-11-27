# i18n routing, base layout and themes (issue #7, release task T7)

Objective: the base every page uses: languages, layout, design tokens, and themes.
Branch: `feat/i18n-layout-themes` (worktree `portfolio-worktrees/feat-i18n-layout-themes`, based on `origin/main` 97b3831). Delivery: one squash-merged PR. Runners: Vitest (`pnpm test`), Playwright (`pnpm test:e2e`).

## Specs

Quoted from GitHub issue #7. Read `DESIGN.md`, `AGENTS.md`, and ADR-0003, ADR-0017, ADR-0026, ADR-0028, ADR-0034 in `docs/adr/` before working.

- **S1** "Routes with `/es/` and `/en/` prefixes, root redirect to `/es/`, English slugs, `hreflang` with `x-default` (ADR-0003, ADR-0026)."
  Acceptance: "`/` redirects to `/es/`, and language switching keeps the current page."
- **S2** "Design tokens in the Tailwind theme from `DESIGN.md` (ADR-0017)."
- **S3** "Self-hosted Source Serif 4 and Source Sans 3 (ADR-0034)."
- **S4** "Light and dark themes: system default, dark fallback, manual toggle stored in `localStorage`, applied before first paint (ADR-0028)."
  Acceptance: "Contrast passes WCAG AA in both themes." and "No flash of the wrong theme."
- **S5** "Mobile first: no horizontal overflow, 44 px tap targets (`DESIGN.md`)."
- **S6** "Apply anti-ai-slop during the work and pass its Delivery Gate."

Assumptions (orchestrator, not owner-requested): the edge redirect for `/` is a `302` in `public/_redirects` (Cloudflare static assets), so a future language negotiation is not blocked by cached `301`s. Page content stays minimal; no new copy beyond the owner's name and UI labels (AGENTS.md: never fabricate content).

## Tasks

| ID  | Specs      | Title                                        | Route                        | Status  | Commit |
| --- | ---------- | -------------------------------------------- | ---------------------------- | ------- | ------ |
| A1  | S2, S3     | Design tokens and self-hosted fonts          | delegated (gentle-ai-worker) | pending |        |
| A2  | S1, S5     | i18n routing, base layout, language switcher | delegated (gentle-ai-worker) | pending |        |
| A3  | S4, S5, S6 | Light/dark themes and toggle                 | delegated (gentle-ai-worker) | pending |        |

Route evidence: the owner asked to delegate as much as possible to the local-model worker; the orchestrator reviews each unit. Units are sequential (A2 and A3 edit the same layout).

## Log

- **L1** (2026-11-27) Original request: "En un worktree nuevo desde main y usando el modo orquestación para aprovechar los modelos locales y los agentes que tenemos vamos a trabajar en esta issue https://github.com/JSisques/portfolio/issues/7 delega todo el trabajo posible sobretodo al worker que tiene modelo local y encargate de revisar sus cambios y que todo esté ok"
- **L2** (2026-11-27) Local `main` was stale (131e847); worktree based on `origin/main` (97b3831). `pnpm install --frozen-lockfile` done.
- **L3** (2026-11-27) A1 done by the worker. Review found `wght.css` shipped cyrillic/greek/vietnamese woff2 (against ADR-0034); fixed with latin-only `@font-face` rules. Checked by the orchestrator: `pnpm build` emits exactly 2 latin woff2, `pnpm test` 4/4. All 12 DESIGN.md pairs pass AA unchanged (min 5.74, light accent/surface).
