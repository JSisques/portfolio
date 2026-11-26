# 15. Test-driven development with Vitest

- Status: Accepted
- Date: 2026-11-26

## Context

The site is built by directing AI harnesses (`docs/vision.md`). Tests written first are the specification that AI-generated code must satisfy, and they make the work verifiable for anyone inspecting the repository.

## Decision

- Development follows **TDD**: every behavior starts with a failing test (red), then the minimal implementation (green), then refactoring while tests stay green.
- **Behavior is tested; static content is not.** Asserting the presence of copy produces brittle tests and is out of scope. Behavior includes i18n routing, GitHub data loading and merging, build failure or fallback handling, contact form validation and spam check, and mail adapters.
- **Vitest** runs unit and integration tests:
  - **Unit:** pure logic.
  - **Integration:** Astro components rendered with the Astro Container API, the contact endpoint with a test double for the mail port (ADR-0014), and GitHub data loading against a mocked API.
- End-to-end tests are required. The tool is decided separately.

## Consequences

- Every behavior has a test that specifies it before it exists.
- Tests never call real external services (GitHub, email). Those are replaced with test doubles or mocked HTTP.
- Writing tests first adds upfront effort per feature.
