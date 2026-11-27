# Security headers and content security policy (issue #8, release task T8)

Objective: harden every response with security headers and a strict CSP, defined once.
Branch: `feat/security-headers` (worktree `portfolio-worktrees/security-headers`, based on `origin/main` 9c600fe). Delivery: one squash-merged PR. Runners: Vitest (`pnpm test`), Playwright (`pnpm test:e2e`).

## Specs

Quoted from GitHub issue #8. Read `AGENTS.md`, ADR-0028, ADR-0033, ADR-0035 in `docs/adr/` before working.

- **S1** "Security headers: `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` (ADR-0033)."
- **S2** "Strict CSP: inline theme script allowed by hash, no `unsafe-inline`, `frame-ancestors`. Turnstile and analytics origins are added in their own tasks."
- **S3** "Defined once, applied on the Cloudflare and Node targets."
- **S4** Acceptance: "Tests assert the headers and the CSP."
- **S5** Acceptance: "The theme script runs under the CSP."

Assumptions (orchestrator, not owner-requested):

- A1. The policy lives in one TypeScript module. The theme script source is exported from it (or a sibling module) and rendered with `set:html`, so its hash is computed from the same string the page ships.
- A2. Cloudflare (Workers static assets, ADR-0035) gets the headers through a `_headers` file written to `dist/` by an Astro integration at `astro:build:done` (https://developers.cloudflare.com/workers/static-assets/headers/).
- A3. The Node target does not exist yet (container image is T13, #13). This task applies the same headers to the Node `astro preview` server (integration `astro:config:setup` with `command === "preview"` sets `server.headers`), which the e2e suite runs against. T13 must apply the same exported headers in its Node server.
- A4. The CSP is delivered as an HTTP header, not Astro's `security.csp` meta tag: browsers ignore `frame-ancestors` in a meta CSP. Astro inlines small bundled scripts (the built `ThemeToggle` script is inline today), so inlining is disabled (`vite.build.assetsInlineLimit: 0`) and the only inline script is the hashed theme script.
- A5. Headers apply only on `preview` and the build output, not on `astro dev` (Vite injects inline styles and HMR scripts in dev).

## Tasks

| ID  | Specs      | Title                                                     | Route                            | Status | Commit |
| --- | ---------- | --------------------------------------------------------- | -------------------------------- | ------ | ------ |
| T1  | S1, S2, S4 | Security headers module and hashed theme script           | delegated (gentle-ai-worker)     | done   | see L3 |
| T2  | S3, S4, S5 | Apply headers on Cloudflare (`_headers`) and Node preview | inline (owner: no subagents, L5) | done   | see L6 |

T2 depends on T1. Route evidence: owner asked to use the local-model worker and agents (L1); units run sequentially, parent reviews each diff. Risk: item 2 (security headers and CSP are a guard) for both tasks.

## Log

- **L1** (2026-11-27) Owner: "En un worktree nuevo desde main y usando el modo orquestación y la skill de atomic tasks para aprovechar los modelos locales y los agentes que tenemos vamos a trabajar en esta issue https://github.com/JSisques/portfolio/issues/8"
- **L2** (2026-11-27) Mapping (explorer plus parent checks): Astro 7.4 `security.csp` emits a meta tag for prerendered pages without an adapter (`node_modules/astro/dist/core/fetch/fetch-state.js:384`); `staticHeaders`/`routeToHeaders` is adapter-only (`types/public/integrations.d.ts:68-73`); `astro preview` runs `astro:config:setup` with `command: "preview"` and serves `server.headers` (`core/preview/index.js:28-30,78`). The current build inlines the `ThemeToggle` module script in `dist/es/index.html`; CSS and fonts are external files; the favicon is `data:,`.
- **L3** (2026-11-27) T1 implemented by the worker: `src/security/headers.ts` (`themeScript`, `scriptHash`, `contentSecurityPolicy`, `securityHeaders`, `toCloudflareHeaders`), `ThemeScript.astro` renders `set:html={themeScript}`, unit tests in `src/security/headers.test.ts`, render test in `tests/integration/theme-script-csp.test.ts`. RED: both suites failed with "Cannot find module './headers.js'"; GREEN 32/32. Parent review found the hash source unquoted (`sha256-…`): a CSP hash must be `'sha256-…'`, unquoted it parses as a host source and the browser would block the theme script. Parent fixed it test-first (known-vector test RED, then GREEN) and removed leading indentation from the shipped string. Parent re-ran: `pnpm test` 32 passed, `pnpm lint`, `pnpm check`, `prettier --check src tests` exit 0.
- **L4** (2026-11-27) T1 committed as `b2f0f7a`. Native review: `review_due` true (`high_risk`, escalated item 2); preflight STATUS failed with `immutable_review_transport_unsupported` ("OpenCode 2.4.1 does not return completed foreground reviewer Tasks for immutable receipt review"). Outcome: unavailable; the RDD switch was left unchanged (owner decision).
- **L5** (2026-11-27) The T2 worker was cancelled after writing only `tests/integration/security-integration.test.ts`. Owner: "Continua sin subagentes". T2 continues inline; the independent verifier is replaced by parent checks.
- **L6** (2026-11-27) T2 implemented inline, reusing the worker's integration test. `src/security/integration.ts`: `astro:config:setup` sets `server.headers` only for `command === "preview"`; `astro:build:done` writes `dist/_headers` via `writeCloudflareHeaders`. `astro.config.mjs` registers it and sets `vite.build.assetsInlineLimit: 0`; `dist/es/index.html` now has exactly one inline script (theme) and loads ThemeToggle via `src`, no `<style>`. E2E `tests/e2e/security-headers.spec.ts`: headers on `/es/` and `/en/`, theme script sets `data-theme="light"` with zero `securitypolicyviolation` events, toggle works. RED: Vitest "Cannot find module '../../src/security/integration.js'"; e2e 3 failed (headers `undefined`). GREEN: Vitest 36 passed, e2e 25 passed. Effectiveness probe: one extra space in the served inline script made the S5 test fail (`data-theme` never set), then the build was regenerated. Cloudflare probe: `wrangler dev` "Parsed 1 valid header rule"; `curl -I /es/` returned all five headers, and the `/` 302 to `/es/` carries them too. Gates: `format:check`, `lint`, `check`, `test`, `build`, `test:e2e` exit 0. README and AGENTS document the single source.
