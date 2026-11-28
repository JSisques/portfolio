# Contact form with mail adapters (issue #11, release task T11)

Objective: let visitors reach the owner safely through direct links and a Turnstile-protected contact form delivered by email.
Branch: `feat/contact-form` (worktree `portfolio-worktrees/feat-contact-form`, based on `origin/main` 9644264). Delivery: one squash-merged PR (`single-pr`). Runners: Vitest (`pnpm test`), Playwright (`pnpm test:e2e`).

## Specs

Quoted from GitHub issue #11. Read `DESIGN.md`, `AGENTS.md`, `docs/vision.md` (line 50), and ADR-0007, ADR-0008, ADR-0013, ADR-0014, ADR-0021, ADR-0033, ADR-0035 in `docs/adr/` before working.

- **S1** "Direct links: `hello@jsisques.net`, LinkedIn, GitHub (ADR-0008)."
- **S2** "Contact form with Turnstile spam protection and a minimal GDPR privacy notice (`docs/vision.md`)."
- **S3** "Mail port with adapters: Cloudflare `send_email` (production), SMTP (container), log-only (previews) (ADR-0007, ADR-0014, ADR-0021)." Owner decision (L2): the SMTP adapter and its library move to #13 with the Node target; this issue reserves the `smtp` selection slot.
- **S4** "Visitor address as `Reply-To`, nothing persisted, recipient never in the repository."
- **S5** "CSP updated for Turnstile."
- **S6** "Empty, loading, success, and error states."
- **S7** Acceptance: "Form logic is tested with a test double for the mail port."
- **S8** Acceptance: "Previews never send email."
- **S9** Acceptance: "Keyboard-operable with visible focus, 0 axe violations."

Assumptions (orchestrator, not owner-requested):

- Contract, owned by T2 under `src/contact/`:
  - `port.ts`: `interface ContactMessage { name: string; email: string; message: string }` and `interface MailPort { send(message: ContactMessage): Promise<void> }`.
  - `validate.ts`: `validateSubmission(form: FormData)` returns `{ ok: true, value: ContactMessage }` or `{ ok: false, fields: Array<"name" | "email" | "message"> }`. Values are trimmed; `name` 1-100 chars, `email` a single address of at most 254 chars, `message` 1-5000 chars (limits are assumptions).
  - `turnstile.ts`: `createTurnstileVerifier(secret, fetchFn = fetch)` returns `(token: string, remoteIp?: string) => Promise<boolean>`, calling the Turnstile siteverify HTTP API (works outside Cloudflare, ADR-0013). Network or HTTP failures return `false`.
  - `handler.ts`: `handleContact(request: Request, deps: { mail: MailPort; verifyTurnstile: Verifier })` returns a JSON `Response`: `200 { status: "sent" }`, `400 { status: "invalid", fields }`, `403 { status: "spam" }` (missing or rejected `cf-turnstile-response`), `502 { status: "error" }` (mail port threw). Validation runs before Turnstile; nothing is persisted.
  - `adapters/log.ts`: log-only adapter; logs one line without the message body (name length, message length, reply-to domain), never sends.
  - `adapters/cloudflare.ts`: wraps an injected `send_email` binding (structural type, so tests use a fake); recipient and sender come from configuration, visitor address is `Reply-To`.
  - `select.ts`: `selectMailAdapter(env)` by `MAIL_ADAPTER`: `cloudflare` needs `SEND_EMAIL` binding, `CONTACT_RECIPIENT`, and `MAIL_FROM` (throws a configuration error naming the missing one); `smtp` throws "SMTP adapter not available until #13"; `log`, unset, or unknown values select log-only (fail-safe for S8).
- Environment: `MAIL_ADAPTER` (`cloudflare` in production vars, `log` in `previews.vars`), `CONTACT_RECIPIENT` and `TURNSTILE_SECRET_KEY` are Worker secrets (never in the repository), `MAIL_FROM` a Worker var/secret set by the owner, `SEND_EMAIL` the `send_email` binding without `destination_address`. `PUBLIC_TURNSTILE_SITE_KEY` is read at build time and falls back to Cloudflare's public always-pass test site key `1x00000000000000000000AA` (dev, tests, previews); previews use the matching test secret.
- UI (T3): `ContactSection.astro`, anchor `#contact`, rendered last on the locale page. Form `POST /api/contact` with fields `name`, `email`, `message` and the implicit Turnstile widget (`cf-turnstile-response`). A bundled client script submits with `fetch` and drives the states: empty (initial), loading (submit disabled, `aria-busy`), success (message, form reset), error (invalid fields, spam, delivery error) in an `aria-live` region, all strings in `src/i18n/ui.ts` for both locales. Without JavaScript Turnstile cannot run, so the form needs it.
- Privacy notice: what is collected (name, email, message), why (to reply), that it is sent by email and not stored, and that Cloudflare Turnstile checks for spam. Owner-specific facts not in the repository use `[REAL DATA]`. LinkedIn URL is `[REAL DATA]`; GitHub is `https://github.com/JSisques`.
- CSP: `script-src` and `frame-src` add `https://challenges.cloudflare.com`. e2e tests stub that origin with `page.route` (no real external calls).
- Endpoint (T1/T4): `@astrojs/cloudflare` adapter (planned in ADR-0035); pages stay prerendered; only `src/pages/api/contact.ts` is on-demand (`prerender = false`).

## Tasks

| ID  | Specs              | Title                                                                                                     | Route                                          | Status  | Risk                                                 | Commit  |
| --- | ------------------ | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ------- | ---------------------------------------------------- | ------- |
| T2  | S3, S4, S7, S8     | Mail port, validation, Turnstile verifier, contact handler, log-only and Cloudflare adapters, selection   | delegated: parallel with T3, disjoint surfaces | done    | none                                                 | 93f5a99 |
| T3  | S1, S2, S5, S6, S9 | `ContactSection` with direct links, form, privacy notice, client states, i18n, Turnstile CSP, e2e + axe   | delegated: parallel with T2, disjoint surfaces | done    | item 2 (CSP), own commit                             |         |
| T1  | S3                 | Adopt `@astrojs/cloudflare` with prerendered pages; build, preview, `_headers`, e2e, Lighthouse unchanged | inline (installs, shared build config)         | pending | item 5 (dependency, build/deploy output), own commit |         |
| T4  | S2, S3, S4, S8     | `/api/contact` endpoint wiring, wrangler vars/`previews.vars`/binding, deploy site key, README            | inline (integration, depends on T1-T3)         | pending | item 5 (deploy config), own commit                   |         |

Dependencies: T2 and T3 run in parallel first (T3's e2e uses the current static build). T1 runs after them (it changes the build output the e2e suite uses). T4 depends on T1, T2, T3.

## Log

- **L1** (2026-11-28, owner): "En un worktree nuevo desde main y usando el modo orquestación y la skill de atomic tasks para aprovechar los modelos locales y los agentes que tenemos vamos a trabajar en esta issue https://github.com/JSisques/portfolio/issues/11"
- **L2** (2026-11-28, owner decision): asked whether to build the SMTP adapter now (nodemailer does not run in the Worker, no ADR for the library) or defer it; answer: "Port ready, SMTP in #13 (Recommended)". The port, Cloudflare and log-only adapters, and selection with a reserved `smtp` slot are built here; the SMTP adapter and its library move to #13.
- **L3** Mapping (explorer): the site is fully static, no adapter installed, `wrangler.jsonc` has empty `previews`; CSP lives in `src/security/headers.ts` and ships as `dist/_headers`; integration tests use `experimental_AstroContainer`; e2e uses `@axe-core/playwright`.
- **L4** T2: the worker wrote every contract file and its tests (all green) and then hit a provider timeout before formatting or reporting. The parent finished inline: Prettier, two `exactOptionalPropertyTypes` test-type fixes, removed `port.test.ts` (it only exercised its own double), and added a rule (RED observed, then GREEN): `name` with a line break is invalid, because it becomes the mail subject. `pnpm exec vitest run src/contact`: 33 passed; eslint and type-check clean for `src/contact`. T3's first run hit the same timeout with no changes and was resumed in the same session.
- **L5** T3: the worker delivered the section, client script, i18n keys, CSP (`script-src` + `frame-src` `https://challenges.cloudflare.com`), an integration test, and the e2e spec (RED observed per rule; 55 e2e passed). Parent review fixes: the fallback site key had 16 zeros instead of Cloudflare's `1x00000000000000000000AA`; the other e2e specs loaded the real Turnstile script, so `tests/e2e/test-base.ts` adds an automatic fixture that stubs `https://challenges.cloudflare.com/**` for every test and all specs import `test` from it. Gates: `pnpm test` 168 passed, `pnpm check` 0 errors, eslint, `format:check`, `pnpm build`, `pnpm test:e2e` 55 passed.
