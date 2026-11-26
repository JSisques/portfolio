# 14. Mail delivery behind a port with platform adapters

- Status: Accepted
- Date: 2026-11-26

## Context

The contact form sends submissions by email (ADR-0007) using the Cloudflare `send_email` binding, which only exists on Cloudflare. The portable container image (ADR-0013) must run the complete site, form included, outside Cloudflare.

## Decision

Apply a ports-and-adapters (hexagonal) design to mail delivery:

- **Port:** a mail sender interface owned by the contact form logic. Form validation, spam check, and message composition do not depend on any platform.
- **Adapters:**
  - **Cloudflare:** sends through the `send_email` binding (production).
  - **SMTP:** sends through an SMTP server configured with environment variables (container image).
- The adapter is selected per build target. The form logic is identical in both.

## Consequences

- The contact form logic can be tested without any email provider, using a test double for the port.
- Adding another provider later means writing one new adapter.
- More code and structure than calling the Cloudflare binding directly.
- The SMTP adapter needs its own credentials when the image is deployed. They are never committed.
