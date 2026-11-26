# 21. Preview deployments per pull request

- Status: Accepted
- Date: 2026-11-26

## Context

Production only updates on release (ADR-0012), so changes need to be reviewed in the real environment before merging. Preview URLs are public, so the contact form could be abused to send me email from temporary deployments.

## Decision

- Every pull request gets a **preview deployment on Cloudflare** with its own temporary URL.
- In previews, the contact form uses a **log-only mail adapter**: submissions go through the full flow (validation and spam check) and are written to logs, but no email is sent.
- The mail adapter is selected per **environment**: Cloudflare email in production, SMTP in the container image (ADR-0013), and log-only in previews. This refines the per-target selection described in ADR-0014.

## Consequences

- Every change can be reviewed in the real Cloudflare environment before merging.
- Previews cannot be used to send me spam.
- Real email delivery is only exercised in production. Its logic stays covered by tests against the mail port.
- More CI configuration: previews are deployed on pull request events and need Cloudflare credentials as repository secrets.
