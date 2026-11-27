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

| ID  | Specs  | Title                                                | Route                        | Status | Commit    |
| --- | ------ | ---------------------------------------------------- | ---------------------------- | ------ | --------- |
| A1  | S2, S3 | Design tokens and self-hosted fonts                  | delegated (gentle-ai-worker) | done   | `adbc317` |
| A2  | S1, S5 | i18n routing, base layout, language switcher (B1-B5) | delegated (gentle-ai-worker) | done   | `2b6b9fb` |
| C1  | S4     | Theme applied before first paint (+ C1b test fix)    | delegated (gentle-ai-worker) | done   | `31b9211` |
| C2  | S4, S5 | Theme toggle stored in `localStorage`                | delegated (gentle-ai-worker) | done   | `e184d7a` |
| C3  | S4     | Axe audit in light and dark themes                   | delegated (gentle-ai-worker) | done   | `9664bda` |
| C4  | S6     | antislop Delivery Gate audit (C4a, C4b, read-only)   | delegated (gentle-ai-worker) | done   | n/a       |
| C5  | S6     | Hover states (gap found by C4b)                      | delegated (gentle-ai-worker) | done   | `8928e65` |

Route evidence: the owner asked to delegate as much as possible to the local-model worker; the orchestrator reviews each unit. Units are sequential (hardware limits; A2 and C1-C5 share the layout). Risk: none of items 1-4 or 6; item 5 considered (two pinned font dependencies, Lighthouse CI URLs) and not escalated: data-only packages, and `pnpm test:lighthouse` passes locally on the new URLs.

## Log

- **L1** (2026-11-27) Original request: "En un worktree nuevo desde main y usando el modo orquestación para aprovechar los modelos locales y los agentes que tenemos vamos a trabajar en esta issue https://github.com/JSisques/portfolio/issues/7 delega todo el trabajo posible sobretodo al worker que tiene modelo local y encargate de revisar sus cambios y que todo esté ok"
- **L2** (2026-11-27) Local `main` was stale (131e847); worktree based on `origin/main` (97b3831). `pnpm install --frozen-lockfile` done.
- **L3** (2026-11-27) A1 done by the worker. Review found `wght.css` shipped cyrillic/greek/vietnamese woff2 (against ADR-0034); fixed with latin-only `@font-face` rules. Checked by the orchestrator: `pnpm build` emits exactly 2 latin woff2, `pnpm test` 4/4. All 12 DESIGN.md pairs pass AA unchanged (min 5.74, light accent/surface).
- **L4** (2026-11-27) A1 committed (`adbc317`). A2 was slow on the local worker (~2.5 h). Owner: "revisa lo que tenga y lo que falte o este mal dividelo en tareas muy pequeñas y acotadas par arepartirlas en varios subagentes, por limitaciones de hardware no podrán ir en paralelo". A2 split into B1-B5 (sequential, one fresh worker each); remaining A3 split into C1-C4.
- **L5** (2026-11-27) B2: Astro 7 needs `src/pages/index.astro` (`Astro.redirect("/es/")`) with `redirectToDefaultLocale: false`; deleting it fails with `MissingIndexForInternationalization`. Static fallback is Astro's 302 meta refresh (2 s delay by design, `astro/dist/core/routing/3xx.js`); production `/` uses the edge 302 in `public/_redirects`. Checks by the orchestrator: `pnpm test` 22/22, `pnpm test:e2e` 6/6, `check`, `lint`, `format:check` clean. A2 committed (`2b6b9fb`).
- **L6** (2026-11-27) C1 worker was cancelled after writing `ThemeScript.astro` + `theme.spec.ts` (6/7 green). The failing "no preference" test used CDP `prefersColorScheme: "no-preference"`, which Chromium no longer supports; C1b rewrites it to stub `matchMedia`.
- **L7** (2026-11-27) Owner: "PAra el resto de tareas, si un agente no sabe como hacer algo tiene que elevarlo al orquestador, mira la skill atomic-task-decomposition". Remaining delegations use the skill's task contract: workers stop with `status: needs-decision` on any unsettled choice or incident; the orchestrator answers in the same worker session.
- **L8** (2026-11-27) C4 worker cancelled with no report (too broad: 6 skills + full gate). Re-split into C4a (Block 1) and C4b (Blocks 2-4) with the checklist inline and a closed reading list. C4a: 17/17 PASS or N/A. C4b: 31 PASS, 1 N/A (L6 identity motif, deferred to #9/#10), 0 FAIL, R-20 NEEDS-DECISION decided by the orchestrator as PASS (owner-specific palette and type; re-run R-20 when #9/#10 content lands). Gap found: DESIGN.md MOTION 1 asks for hover states; fixed in C5.
- **L9** (2026-11-27) Final checks by the orchestrator on `8928e65`: `pnpm test` 22/22, `pnpm test:e2e` 21/21, `pnpm test:lighthouse` exit 0 (`/es/`, `/en/`), `pnpm build` no warnings, `check`, `lint`, `format:check` clean. Native review assess: medium, `review_due: false` (`under_budget`). Next: owner decides push and PR (closes #7).
