# 23. Accessibility and performance as CI gates

- Status: Accepted
- Date: 2026-11-26

## Context

The site is a professional showcase. Visitors, especially technical ones, can audit it in seconds with Lighthouse. A slow or inaccessible site contradicts the profile it presents. Quality must be measurable, not aspirational.

## Decision

Accessibility and performance are **required CI checks** (in addition to ADR-0022):

| Metric                             | Threshold                | Rationale                                                                                   |
| ---------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------- |
| Lighthouse Accessibility           | 100                      | Binary: it either complies or not.                                                          |
| Lighthouse Best Practices          | 100                      | Achievable on a static site.                                                                |
| Lighthouse SEO                     | 100                      | Achievable, and discoverability matters.                                                    |
| Lighthouse Performance             | >= 95                    | CI runs vary; requiring 100 would cause flaky failures.                                     |
| axe in Playwright end-to-end tests | 0 WCAG 2.2 AA violations | Covers interactive flows that Lighthouse does not reach (contact form, language switching). |

- Lighthouse CI audits the key pages in **both languages** (`es` and `en`).
- Audits run against the same local build used for end-to-end tests.

## Consequences

- Regressions in accessibility, SEO, or performance block merging.
- Design and content choices (images, fonts, third-party scripts) must respect the performance budget from the start.
- Automated audits do not catch every accessibility issue. Manual checks (keyboard navigation, screen reader) remain good practice.
- Thresholds can only be lowered through a new ADR.
