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

| Command        | Action                                      |
| -------------- | ------------------------------------------- |
| `pnpm dev`     | Start the local development server.         |
| `pnpm build`   | Build the production site into `dist/`.     |
| `pnpm preview` | Preview the production build locally.       |
| `pnpm check`   | Type-check the project with `astro check`.  |

## Documentation

- [Vision](docs/vision.md): purpose, audience, and scope.
- [Architecture decisions](docs/adr/): one ADR per decision.
- [Design direction](DESIGN.md): visual identity.
- [Workflow](docs/workflow.md): how decisions are made and how changes reach a release.
- [Agent rules](AGENTS.md): instructions every AI agent follows in this repository.

## License

Code is licensed under the MIT License. Personal content (biography, experience, project narratives, CV, and photos) is not licensed for reuse: all rights reserved. See [LICENSE](LICENSE) for the exact paths (ADR-0027).
