# 35. Cloudflare Workers with static assets

- Status: Accepted
- Date: 2026-11-26

## Context

ADR-0006 chose Cloudflare for hosting (custom domain `jsisques.net`, self-hosted contact form, zero cost) without choosing between Pages and Workers.

`@astrojs/cloudflare` v13 dropped official support for Cloudflare Pages in favor of Cloudflare Workers static assets (source: https://newreleases.io/project/github/withastro/astro/release/@astrojs%2Fcloudflare@13.0.0). The T11 task needs that adapter.

Version URLs (`wrangler versions upload`) run against production resources, which is unsafe for pull requests (https://developers.cloudflare.com/workers/versions-and-deployments/version-urls/).

## Decision

Host the site on **Cloudflare Workers with static assets**, configured via `wrangler.jsonc`:

- The `assets` field specifies the `./dist` output directory. No binding is needed for static-only assets.
- `workers_dev` and `preview_urls` are enabled, so production and Previews are reachable on `*.workers.dev`.
- The custom domain `jsisques.net` is attached once in the Cloudflare dashboard, not in `wrangler.jsonc`. With no `routes`, `wrangler deploy` never publishes routes or custom domains (wrangler 4.168.0 `cli.js:60742-60754`), so the production token needs no zone permissions. Changing a custom domain requires `Editor` plus Zone Workers Routes Write (https://developers.cloudflare.com/workers/authorization/workers/).
- Production deploys use `wrangler deploy --tag <tag>` against the latest release tag (ADR-0012, ADR-0005).
- Preview deployments use **Cloudflare Worker Previews** named `pr-<number>` via `wrangler preview --worker-name jsisques-net-preview --name pr-<number>`, deleted when the PR closes. Previews run as open beta on Wrangler 4.135.0+ (https://developers.cloudflare.com/workers/previews/).
- The `previews` block in `wrangler.jsonc` is empty for now; T11 will add `previews.vars` for the log-only mail adapter (https://developers.cloudflare.com/workers/previews/configuration/).
- Previews run on a separate Worker (`jsisques-net-preview`) so the preview token cannot touch production. Cloudflare has no preview-only role; `Editor` on a Worker can deploy production, so a token scoped to the preview Worker only is a security boundary (https://developers.cloudflare.com/workers/authorization/workers/).

## Consequences

- Worker Previews are open beta. Free plan limits: 100 Previews per Worker, 100 deployments per Preview; oldest deleted automatically. Preview URLs are public on `*.workers.dev` and send `X-Robots-Tag: noindex`.
- Previews never inherit production settings (`vars` go in `previews.vars`), so T11's log-only mail adapter is isolated from production (https://developers.cloudflare.com/workers/previews/configuration/).
- Two GitHub environments gate the workflows: `production` (branch rule `main`, tag rule `v*`, holds the production token) and `preview` (holds the preview token). The `production` environment protects the deploy path so only released code reaches production.
- Tag ruleset `protect-release-tags` (creation, update, deletion on `refs/tags/v*`, admin bypass only) prevents unauthorized tag mutations. Only repository admins bypass it: the owner, and release-please because it authenticates with the owner's PAT (`RELEASE_PLEASE_TOKEN`).
- Manual dispatch accepts an optional `tag` input (validated against `^v[0-9]+\.[0-9]+\.[0-9]+$` and must be a published release) for rollback to an earlier release. The alternative emergency rollback is `wrangler rollback` (needs Editor on the Worker). A rollback must also mark the bad release as a pre-release, or the daily rebuild redeploys it.
- A smoke check (`curl --fail --retry 5`) runs after every production deploy and marks the run red on failure.
- `pnpm-lock.yaml` includes wrangler, workerd, and esbuild. `pnpm-workspace.yaml` uses `allowBuilds` for esbuild and workerd as a supply-chain tradeoff limited to those two packages (without it, `pnpm install` fails with `ERR_PNPM_IGNORED_BUILDS`).
- Two Cloudflare account-owned API tokens are created after the owner creates both Workers in the dashboard (per-Worker scopes only apply to existing Workers; creating a Worker needs product-level Admin):
  - **Production token**: Workers `Editor` on `jsisques-net` only.
  - **Preview token**: Workers `Editor` on `jsisques-net-preview` only. No zone permissions.
  - Unverified until first real run: that a per-Worker Editor token is enough for `wrangler preview`, and for `wrangler deploy`.
- GitHub disables scheduled workflows after 60 days without repository activity.
