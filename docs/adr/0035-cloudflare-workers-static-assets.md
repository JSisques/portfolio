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
- `workers_dev` is enabled, giving every version a `*.workers.dev` subdomain.
- A custom domain route is configured: `jsisques.net` with `custom_domain: true`.
- Production deploys use `wrangler deploy --tag <tag>` against the latest release tag (ADR-0012, ADR-0005).
- Preview deployments use **Cloudflare Worker Previews** named `pr-<number>` via `wrangler preview --name pr-<number>`, deleted when the PR closes. Previews run as open beta on Wrangler 4.135.0+ (https://developers.cloudflare.com/workers/previews/).
- The `previews` block in `wrangler.jsonc` is empty for now; T11 will add `previews.vars` for the log-only mail adapter (https://developers.cloudflare.com/workers/previews/configuration/).

## Consequences

- Worker Previews are open beta. Free plan limits: 100 Previews per Worker, 100 deployments per Preview; oldest deleted automatically. Preview URLs are public on `*.workers.dev` and send `X-Robots-Tag: noindex`.
- Previews never inherit production settings (`vars` go in `previews.vars`), so T11's log-only mail adapter is isolated from production (https://developers.cloudflare.com/workers/previews/configuration/).
- First-preview bootstrap: it is not verified whether `wrangler preview` works before the Worker exists. If the first preview fails, the Worker is created by the first production deploy (first release) or a one-time `wrangler deploy` by the owner from a release tag.
- `pnpm-lock.yaml` includes wrangler, workerd, and esbuild. `pnpm-workspace.yaml` uses `allowBuilds` for esbuild and workerd as a supply-chain tradeoff limited to those two packages (without it, `pnpm install` fails with `ERR_PNPM_IGNORED_BUILDS`).
- The `CLOUDFLARE_API_TOKEN` secret must grant `Workers Scripts` edit and permission to edit the resources used by the Preview. Create the token from the "Edit Cloudflare Workers" template, scoped to the single account and the `jsisques.net` zone (https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/).
- GitHub disables scheduled workflows after 60 days without repository activity.
