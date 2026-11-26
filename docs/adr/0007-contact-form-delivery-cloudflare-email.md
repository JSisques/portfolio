# 7. Contact form delivery through Cloudflare Email Service

- Status: Accepted
- Date: 2026-11-26

## Context

Contact form submissions must reach my email inbox and are not stored by the site (`docs/vision.md`). The form endpoint runs on Cloudflare (ADR-0006). The domain `jsisques.net` currently has no email service, so enabling Cloudflare email features on it breaks nothing.

Cloudflare Email Service pricing, verified on 2026-11-26 (https://developers.cloudflare.com/email-service/platform/pricing/): on the Workers Free plan, sending is free **only to verified destination addresses** in the account. These sends do not count toward any quota.

## Decision

- The contact form endpoint sends each submission as an email through the Cloudflare `send_email` Workers binding.
- The recipient is my own address, registered as a verified destination address. It is never hardcoded in the repository.
- The visitor's address is set as `Reply-To`, so I can answer directly from my inbox.
- Submissions are not persisted anywhere.

## Consequences

- Zero cost and no third-party email provider.
- No stored personal data, so no data retention policy is needed. The privacy notice must still explain what is collected and why.
- Email features must be enabled on the `jsisques.net` zone, which adds DNS records (MX/SPF/DKIM).
- Sending to arbitrary recipients (for example, an automatic acknowledgement to the visitor) is not possible on the free plan and is out of scope.
