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

| Command        | Purpose                                    |
| -------------- | ------------------------------------------ |
| `pnpm install` | Install dependencies.                      |
| `pnpm dev`     | Start the local development server.        |
| `pnpm build`   | Build the production site.                 |
| `pnpm check`   | Type-check with `astro check` (strict).    |

Linting, formatting, and test commands are added with their tooling. Add them to this table when they exist.

## Quality gates

Before considering a change done, run the commands that exist in the table above and make sure they pass. `pnpm build` and `pnpm check` must always succeed.

## Git and delivery

- `main` is protected. Work on a feature branch and open a pull request. Pull requests are squash-merged (ADR-0020).
- Commit messages and pull request titles follow Conventional Commits (ADR-0010). The pull request title becomes the commit on `main` and drives the release version (ADR-0011).
- Never add AI attribution trailers (for example `Co-Authored-By`) to commits.
- Pushing, opening pull requests, and merging are decisions of the owner.
- Release work is tracked in `odd/tasks/` and in GitHub issues under the release milestone.
