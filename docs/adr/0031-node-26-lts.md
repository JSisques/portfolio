# 31. Node.js 26 LTS

- Status: Accepted
- Date: 2026-11-26

## Context

The Node.js version affects local development, CI, the build, and the container image (ADR-0013). According to the official release schedule (https://github.com/nodejs/Release), verified on 2026-11-26:

- Node.js 26 entered Active LTS on 2026-10-28 and is supported until 2029-04-30.
- Node.js 24 is in maintenance since 2026-10-20.

## Decision

- Use **Node.js 26 (Active LTS)**.
- The version is declared once in `.nvmrc` and in the `engines` field of `package.json`. CI and the container image read it from there.
- Compatibility of Astro and the rest of the toolchain with Node.js 26 is verified during scaffolding. If something is incompatible, a new ADR records the fallback.

## Consequences

- Longest support window available among LTS versions.
- A single declared version avoids drift between local, CI, and container.
- Major Node.js upgrades are handled by dependency updates (ADR-0032), reviewed like any other change.
