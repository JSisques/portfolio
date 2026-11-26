# 18. TypeScript strict, ESLint, and Prettier

- Status: Accepted
- Date: 2026-11-26

## Context

The project needs type checking, linting, and consistent formatting. Options considered: ESLint with Prettier (mature ecosystem, including Astro support) and Biome (single fast tool, with historically partial `.astro` support). ESLint and Prettier are my usual tools.

## Decision

- **TypeScript** in **strict** mode, checked with `astro check`.
- **ESLint** for linting, including the Astro plugin.
- **Prettier** for formatting, including the Astro plugin and the Tailwind CSS plugin for consistent class ordering.
- Exact plugins and versions are pinned when the project is scaffolded.

## Consequences

- Mature, well-documented tooling with first-class Astro support.
- Two tools with separate configurations. ESLint must not enforce formatting rules that conflict with Prettier.
- Where these checks run (local hooks, CI, or both) is a separate decision.
