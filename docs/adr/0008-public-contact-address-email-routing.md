# 8. Public contact address through Email Routing

- Status: Accepted
- Date: 2026-11-26

## Context

The Contact section shows direct links, including an email address (`docs/vision.md`). Publishing my personal address on a public site exposes it to spam and mixes personal and professional identity.

Cloudflare does not host mailboxes. Email Routing only forwards incoming mail. A real mailbox on the domain would need a separate email provider, usually paid. Expected volume for a professional showcase is low.

## Decision

- The public contact address is **`hello@jsisques.net`**.
- Cloudflare Email Routing forwards it to my personal inbox, configured as a verified destination address (shared with ADR-0007).
- Replies are sent from my personal address.

## Consequences

- My personal address is never published on the site or in the repository.
- Zero cost and simple setup.
- Replies do not come from `hello@jsisques.net`. Sending as the domain address would require a mailbox provider or a paid sending plan. Revisit if volume or professional needs grow.
- Email Routing takes over the MX records of `jsisques.net`. Adopting a mailbox provider later means replacing those records.
