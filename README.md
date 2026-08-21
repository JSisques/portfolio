# portfolio

Personal portfolio of Javier Plaza Sisqués. Built with [Astro](https://astro.build).

## Getting started

```bash
pnpm install
pnpm dev
```

## Scripts

| Command             | Action                              |
| -------------------- | ------------------------------------ |
| `pnpm dev`            | Start the local dev server           |
| `pnpm build`          | Type-check and build for production  |
| `pnpm preview`        | Preview the production build locally |
| `pnpm lint`           | Lint and autofix                     |
| `pnpm format`         | Format with Prettier                 |
| `pnpm test`           | Run the test suite                   |

## Docker

```bash
docker build -t jsisques/portfolio .
docker run -p 8080:8080 jsisques/portfolio
```

See [docker/README.md](docker/README.md) for details.
