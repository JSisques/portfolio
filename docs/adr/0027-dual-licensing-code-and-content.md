# 27. Dual licensing: MIT code, reserved personal content

- Status: Accepted
- Date: 2026-11-26

## Context

The repository is public (`docs/vision.md`). It contains two kinds of material:

- **Code:** components, configuration, adapters, tests, and workflows. Reuse by others is welcome.
- **Personal content:** biography, experience, project narratives, CV, photos, and other personal assets. It represents my identity. A permissive license over the whole repository would allow anyone to legally republish my portfolio, including my professional history.

## Decision

- **Code** is licensed under the **MIT License**.
- **Personal content** is **not** licensed for reuse: all rights reserved.
- Personal content lives in clearly identified locations, defined during scaffolding (for example, content collections and personal assets in `public/`). Those paths are listed in the license notice.
- The `LICENSE` file contains the MIT license for the code and a notice that excludes the listed personal content paths.

## Consequences

- Others can reuse the code with attribution, which supports the showcase.
- My personal content cannot be legally republished.
- Personal content must stay in the declared locations. Moving it requires updating the license notice.
