# jsisques.net

Personal website and portfolio of Javier Plaza Sisqués: who I am as a professional, what I do, and the work I have built.

The repository is also part of the showcase. Every decision is recorded as an ADR, and the site is built by directing AI agents with explicit rules. See [How this project is built](docs/workflow.md).

## Stack

- [Astro](https://astro.build/) (ADR-0004) with TypeScript in strict mode (ADR-0018)
- [Tailwind CSS](https://tailwindcss.com/) (ADR-0017)
- [pnpm](https://pnpm.io/) (ADR-0009) on Node.js 26 LTS (ADR-0031)

## Getting started

Requirements: Node.js 26 (see `.nvmrc`) and pnpm (the exact version is pinned in `package.json` under `packageManager`).

```sh
pnpm install
pnpm dev
```

## Commands

| Command                | Action                                                             |
| ---------------------- | ------------------------------------------------------------------ |
| `pnpm dev`             | Start the local development server.                                |
| `pnpm build`           | Build the production site into `dist/`.                            |
| `pnpm preview`         | Preview the production build locally.                              |
| `pnpm check`           | Type-check the project with `astro check`.                         |
| `pnpm lint`            | Lint with ESLint.                                                  |
| `pnpm format`          | Format every file with Prettier.                                   |
| `pnpm format:check`    | Check formatting without writing.                                  |
| `pnpm test`            | Run unit and integration tests with Vitest.                        |
| `pnpm test:changed`    | Run the Vitest tests affected by commits not yet on `origin/main`. |
| `pnpm test:e2e`        | Run Playwright end-to-end tests against the built site.            |
| `pnpm test:lighthouse` | Run Lighthouse CI audits on the built site.                        |

`pnpm exec playwright install chromium` installs the Chromium browser binary once (required before running `pnpm test:e2e`).

`pnpm install` also installs the Git hooks (Husky): staged files are formatted and linted on commit, commit messages must follow [Conventional Commits](https://www.conventionalcommits.org/), and `pnpm test:changed` runs before each push.

## CI

All PRs to `main` are validated by a GitHub Actions pipeline: PR title (Conventional Commits), format and lint, type-check (`astro check`), full Vitest test suite, Playwright end-to-end, Lighthouse (accessibility, best practices, SEO, performance gates), and build. All checks are required to merge.

CodeQL scans the codebase on every PR and on a weekly schedule (ADR-0033). Dependency updates are handled by Renovate: every update is a `chore(deps):` PR, minor/patch/pin/digest updates are automerged when CI passes, and major updates open a PR for manual review (ADR-0032).

### Preview deployments

Every pull request to `main` receives a **Cloudflare Worker Preview** (open beta, Wrangler 4.135.0+) named `pr-<number>` on a separate Worker, `jsisques-net-preview` (ADR-0021, ADR-0035). Previews never inherit production settings. A sticky comment by `github-actions[bot]` on the PR shows the preview URL and commit SHA. Fork PRs are skipped because their secrets are unavailable. Previews are deleted automatically when the PR closes. Free plan limits: 100 previews per worker, 100 deployments per preview.

### Production deploys

Production deploys on releases and on a daily schedule (ADR-0012, ADR-0005):

- **On push of a `v*` tag** - builds and deploys that exact tag.
- **On daily schedule (06:00 UTC)** - resolves the latest release tag via `gh release view` and deploys only that tag. If no release exists, the workflow exits cleanly.
- **On manual dispatch** - an optional `tag` input redeploys a specific published release (rollback path; validated against `^v[0-9]+\.[0-9]+\.[0-9]+$` and must exist as a published release). Empty deploys the latest release.

Both workflows run the pinned `wrangler` dev dependency (no Cloudflare deploy action) and pin every action to a commit SHA (ADR-0035). A smoke check (`curl --fail --retry 5`) runs after every production deploy.

### Cloudflare setup

Two GitHub environments gate the workflows, each holding its own `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`:

- **`production`** - branch rule `main`, tag rule `v*`. Holds the production token (Workers `Editor` on Worker `jsisques-net` only). The custom domain `jsisques.net` is attached once in the dashboard (Worker > Settings > Domains & Routes > Add > Custom Domain); `wrangler.jsonc` has no `routes`, so deploys never change it and the token needs no zone permissions.
- **`preview`** - holds the preview token (Workers `Admin` on Worker `jsisques-net-preview` only, no zone permissions). `Editor` can create Previews but not delete them, so the cleanup job needs `Admin`.

On the `jsisques-net-preview` Worker, enable both `workers.dev` and Preview URLs (Worker > Domains); without a host, a Preview has no URL and the preview job fails. The owner creates both Workers in the Cloudflare dashboard first (per-Worker scopes only apply to existing Workers; creating a Worker needs product-level Admin). The tag ruleset `protect-release-tags` restricts creation, update, and deletion of `refs/tags/v*` to admins only.

For rollback, the dispatch input accepts a published release tag. The alternative emergency rollback is `wrangler rollback` (needs Editor on the Worker). Either way, also mark the bad release as a pre-release (`gh release edit <tag> --prerelease`): the daily rebuild deploys the latest release, which excludes pre-releases, so otherwise it redeploys the bad release the next morning.

### Releases

Releases are automated with [release-please](https://github.com/googleapis/release-please) (ADR-0011): the first release proposes `0.1.0` with a `v` tag (e.g. `v0.1.0`). The release PR opens once the first `feat:`, `fix:`, `perf:`, or `revert:` commit lands on `main`. release-please maintains `CHANGELOG.md` and the version in `package.json`.

## Documentation

- [Vision](docs/vision.md): purpose, audience, and scope.
- [Architecture decisions](docs/adr/): one ADR per decision.
- [Design direction](DESIGN.md): visual identity.
- [Workflow](docs/workflow.md): how decisions are made and how changes reach a release.
- [Agent rules](AGENTS.md): instructions every AI agent follows in this repository.

## License

Code is licensed under the MIT License. Personal content (biography, experience, project narratives, CV, and photos) is not licensed for reuse: all rights reserved. See [LICENSE](LICENSE) for the exact paths (ADR-0027).
