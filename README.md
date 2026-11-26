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

| Command             | Action                                                             |
| ------------------- | ------------------------------------------------------------------ |
| `pnpm dev`          | Start the local development server.                                |
| `pnpm build`        | Build the production site into `dist/`.                            |
| `pnpm preview`      | Preview the production build locally.                              |
| `pnpm check`        | Type-check the project with `astro check`.                         |
| `pnpm lint`         | Lint with ESLint.                                                  |
| `pnpm format`       | Format every file with Prettier.                                   |
| `pnpm format:check` | Check formatting without writing.                                  |
| `pnpm test`         | Run unit and integration tests with Vitest.                        |
| `pnpm test:changed` | Run the Vitest tests affected by commits not yet on `origin/main`. |
| `pnpm test:e2e`     | Run Playwright end-to-end tests against the built site.            |

`pnpm exec playwright install chromium` installs the Chromium browser binary once (required before running `pnpm test:e2e`).

`pnpm install` also installs the Git hooks (Husky): staged files are formatted and linted on commit, commit messages must follow [Conventional Commits](https://www.conventionalcommits.org/), and `pnpm test:changed` runs before each push.

## CI

All PRs to `main` are validated by a GitHub Actions pipeline: PR title (Conventional Commits), format and lint, type-check (`astro check`), full Vitest test suite, Playwright end-to-end, and build. All checks are required to merge.

### Preview deployments

Every pull request to `main` receives a **Cloudflare Worker Preview** (open beta, Wrangler 4.135.0+) named `pr-<number>` (ADR-0021, ADR-0035). Previews never inherit production settings. A sticky comment on the PR shows the preview URL and commit SHA. Fork PRs are skipped because their secrets are unavailable. Previews are deleted automatically when the PR closes. Free plan limits: 100 previews per worker, 100 deployments per preview.

### Production deploys

Production deploys on releases and on a daily schedule (ADR-0012, ADR-0005):

- **On push of a `v*` tag** - builds and deploys that exact tag.
- **On daily schedule (06:00 UTC)** - resolves the latest release tag via `gh release view` and deploys only that tag. If no release exists, the workflow exits cleanly.
- **On manual dispatch** - same behavior as the schedule: deploys the latest release tag.

Both workflows use `wrangler` directly (no third-party actions) and pin exact action SHAs (ADR-0035). The first preview may fail if the Worker does not yet exist; the Worker is created by the first production deploy (first release) or a one-time `wrangler deploy` by the owner.

### Required secrets

| Secret                  | Required for               | Permissions                                                                                                                                                                                                                                                                              |
| ----------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CLOUDFLARE_ACCOUNT_ID` | Wrangler deployment target | -                                                                                                                                                                                                                                                                                        |
| `CLOUDFLARE_API_TOKEN`  | Authenticated deploys      | `Workers Scripts` edit and permission to edit the resources used by the Preview. Create the token from the "Edit Cloudflare Workers" template, scoped to the single account and the `jsisques.net` zone (https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/). |

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
