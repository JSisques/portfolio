# 29. CV generated from site content

- Status: Accepted
- Date: 2026-11-26

## Context

The site includes a downloadable CV in Spanish and English (`docs/vision.md`). Maintaining the CV by hand duplicates information that already exists on the site (experience, projects, about me), and duplicated information drifts out of sync.

The CV must also be able to contain more than the site (for example, education, certifications, languages, or more detail per role), editable in the repository. No CV page or route (such as `/cv`) is exposed.

## Decision

- **Single source of truth:** CV data lives in the repository as typed content, and it is a **superset** of the site content.
  - **Shared data** (experience, projects, about me) is written once and used by both the site and the CV.
  - **CV-only data** (for example, education and certifications) lives in the same content sources and is not shown on the site.
  - Entries can declare their visibility: site, CV, or both.
- **Generation at build time:** a CV template is rendered and converted to PDF with Playwright during the build. One PDF per language.
- **Only the PDFs are published**, as static files. The template is never deployed as a page.
- CV data is personal content and falls under the reserved license (ADR-0027).

## Consequences

- The site and the CV never drift apart.
- The CV can be more complete than the site without duplicating shared data.
- The CV design is limited to what HTML and print CSS can express.
- The build depends on a headless browser to produce the PDFs, which adds build time and must work in CI and in the container build (ADR-0013).
- PDF generation is behavior, so it is developed test-first (ADR-0015).
