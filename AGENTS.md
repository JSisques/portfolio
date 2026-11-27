# Agent rules

Single source of project rules for every AI agent working in this repository (ADR-0030). Harness-specific files (for example `CLAUDE.md`) import this file and must not duplicate it.

## Project

- Personal website and portfolio for jsisques.net. Read `docs/vision.md` for purpose, audience, and scope, and `DESIGN.md` for the visual direction.
- Stack: Astro (ADR-0004), TypeScript strict (ADR-0018), Tailwind CSS (ADR-0017), pnpm (ADR-0009), Node.js 26 LTS (ADR-0031).
- The site is available in Spanish (default) and English (ADR-0003). All user-facing content exists in both languages.

## Decisions

- Every significant decision is recorded as an ADR in `docs/adr/` (ADR-0001). Read the relevant ADRs before changing an area.
- Accepted ADRs are immutable. A changed decision gets a new ADR that supersedes the old one.
- Do not make a new architectural, product, or tooling decision silently. Propose it, get the owner's approval, and record it as an ADR.
- When a decision changes the rules agents follow, update this file in the same change.

## Language

- Technical artifacts are written in English: code, identifiers, comments, documentation, ADRs, commit messages, and pull request titles and descriptions (ADR-0024).
- User-facing site content is written in Spanish and English.

## Content

- Never fabricate content: no invented metrics, testimonials, projects, or experience. Content not yet provided by the owner uses the placeholder `[REAL DATA]`.
- Personal content lives only in the paths listed in `LICENSE` (ADR-0027). Moving it requires updating that notice.

## Development

- Follow TDD: every behavior starts with a failing test, then the minimal implementation, then refactoring while tests stay green (ADR-0015). Test behavior, not static copy.
- Tests never call real external services (GitHub, email). Use test doubles or mocked HTTP.
- Use the design tokens defined in the Tailwind theme. Avoid arbitrary one-off values (ADR-0017).
- Pin exact dependency versions (ADR-0032). `pnpm-lock.yaml` is the only lockfile.

## Commands

| Command                | Purpose                                                            |
| ---------------------- | ------------------------------------------------------------------ |
| `pnpm install`         | Install dependencies.                                              |
| `pnpm dev`             | Start the local development server.                                |
| `pnpm build`           | Build the production site.                                         |
| `pnpm check`           | Type-check with `astro check` (strict).                            |
| `pnpm lint`            | Lint with ESLint.                                                  |
| `pnpm format`          | Format every file with Prettier.                                   |
| `pnpm format:check`    | Check formatting without writing.                                  |
| `pnpm test`            | Run unit and integration tests with Vitest.                        |
| `pnpm test:changed`    | Run the Vitest tests affected by commits not yet on `origin/main`. |
| `pnpm test:e2e`        | Run Playwright end-to-end tests against the built site.            |
| `pnpm test:lighthouse` | Run Lighthouse CI audits on the built site.                        |

`pnpm exec playwright install chromium` installs the Chromium browser binary once (required before running `pnpm test:e2e`).

Test commands are added with their tooling. Add them to this table when they exist.

Git hooks (ADR-0019) run through Husky, installed by `pnpm install`: `pre-commit` formats and lints staged files, `commit-msg` rejects messages that are not Conventional Commits, and `pre-push` runs `pnpm test:changed`. Do not bypass them with `--no-verify`.

## Quality gates

Before considering a change done, run the commands that exist in the table above and make sure they pass. `pnpm build`, `pnpm check`, `pnpm lint`, and `pnpm format:check` must always succeed.

## CI

GitHub Actions runs the following checks on every PR to `main` (ADR-0022): PR title (Conventional Commits via commitlint), Prettier formatting, ESLint, `astro check` (type-check), full Vitest suite, Playwright end-to-end, Lighthouse (accessibility, best practices, SEO, performance gates), and `astro build`. All are required for merge.

CodeQL scans the codebase on every PR and on a weekly schedule (ADR-0033). Dependency updates are handled by Renovate: every update is a `chore(deps):` PR, minor/patch/pin/digest updates are automerged when CI passes, and major updates open a PR for manual review (ADR-0032).

Preview deployments run on every PR to `main` (ADR-0021, ADR-0035): the site is built and deployed via Cloudflare Worker Previews (Wrangler 4.135.0+) on a separate Worker, `jsisques-net-preview`, named `pr-<number>`, deleted when the PR closes. A sticky comment by `github-actions[bot]` shows the preview URL and commit SHA. Fork PRs are skipped.

Production deploys run on `v*` tag pushes, daily schedule (06:00 UTC), or manual dispatch with an optional tag input for rollback (ADR-0012, ADR-0005). The workflow resolves the tag, checks out only the release tag, deploys with `wrangler deploy --tag`, and runs a smoke check. Secrets are gated behind the `production` GitHub environment (main + v* tags).

## Release process

Releases are automated with release-please (ADR-0011): the first release proposes `0.1.0` with a `v` tag (e.g. `v0.1.0`). The release PR opens once the first `feat:`, `fix:`, `perf:`, or `revert:` commit lands on `main`. release-please maintains `CHANGELOG.md` and the version in `package.json`.

## Git and delivery

- `main` is protected. Work on a feature branch and open a pull request. Pull requests are squash-merged (ADR-0020).
- Commit messages and pull request titles follow Conventional Commits (ADR-0010). The pull request title becomes the commit on `main` and drives the release version (ADR-0011).
- Never add AI attribution trailers (for example `Co-Authored-By`) to commits.
- Pushing, opening pull requests, and merging are decisions of the owner.
- Release work is tracked in `odd/tasks/` and in GitHub issues under the release milestone.
