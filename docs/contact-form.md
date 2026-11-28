# Contact form: setup and delivery test

How the contact form delivers email, the one-time production setup, and how to test real delivery before a release. Decisions: ADR-0007, ADR-0008, ADR-0014, ADR-0021, ADR-0035.

## How it works

- The form posts to `/api/contact`, the only route the Worker renders on demand; every page is prerendered.
- `MAIL_ADAPTER` selects the mail adapter:

  | Value                    | Where                        | Effect                                                                 |
  | ------------------------ | ---------------------------- | ---------------------------------------------------------------------- |
  | `cloudflare`             | production `vars`            | Sends through the `send_email` binding, visitor address as `Reply-To`. |
  | `log`, unset, or unknown | Previews (`previews.vars`)   | Logs one line without the message; never sends.                        |
  | `smtp`                   | reserved for the Node target | Not available yet (T13).                                               |

- Nothing is persisted. The recipient, the sender, and the Turnstile secret are Worker secrets and never appear in the repository.
- Turnstile runs before delivery. Previews and local builds use Cloudflare's public test keys, which always pass.

## Production setup (once)

Do this before the first release that contains the form. The daily deploy only runs for published releases.

### 1. Email Routing and the destination address

In the [Cloudflare dashboard](https://dash.cloudflare.com/), go to **Compute > Email Service > Email Routing**:

1. Enable Email Routing on `jsisques.net` and let Cloudflare add the MX and SPF records.
2. Under **Destination Addresses**, add the address that receives the messages and open the verification email (**Verify email address**). Nothing is delivered until it is verified.
3. Under **Routing rules**, route `hello@jsisques.net` to that address (the public address, ADR-0008).

A Worker can send to a verified destination address with only Email Routing configured, free on every plan. On the Workers Free plan it can send **only** to verified destination addresses ([docs](https://developers.cloudflare.com/email-service/configuration/destination-addresses/)), so `CONTACT_RECIPIENT` must be exactly that address.

### 2. Turnstile widget

In the dashboard, go to **Turnstile > Add widget**, add the hostname `jsisques.net`, and keep the **Managed** mode. It gives a public **site key** (step 4) and a **secret key** (step 3).

### 3. Worker secrets

Set them on the `jsisques-net` Worker, either in the dashboard (**Workers & Pages > jsisques-net > Settings > Variables and Secrets > Add**, type **Secret**) or from the repository root:

```sh
pnpm exec wrangler login
pnpm exec wrangler secret put CONTACT_RECIPIENT
pnpm exec wrangler secret put MAIL_FROM
pnpm exec wrangler secret put TURNSTILE_SECRET_KEY
```

| Secret                 | Value                                                                              |
| ---------------------- | ---------------------------------------------------------------------------------- |
| `CONTACT_RECIPIENT`    | The verified destination address from step 1.                                      |
| `MAIL_FROM`            | A sender on `jsisques.net`, for example `contact@jsisques.net`. No mailbox needed. |
| `TURNSTILE_SECRET_KEY` | The Turnstile secret key from step 2.                                              |

Secrets survive later `wrangler deploy` runs.

### 4. Site key for the production build

The site key is public and is compiled into the page, so it is a GitHub environment **variable**, not a secret:

```sh
gh variable set TURNSTILE_SITE_KEY --env production --repo JSisques/portfolio --body "<site key>"
```

Or **Settings > Environments > production > Environment variables > Add variable**. The deploy workflow stops if it is missing.

## Test real delivery before a release

Previews never send email, and production only gets the form with a release. To check that Email Routing, the destination address, and `MAIL_FROM` work, run the Worker locally with a remote `send_email` binding: the code runs on your machine and sends one real email through your Cloudflare account ([docs](https://developers.cloudflare.com/email-service/observability/local-development/sending/)).

1. Log in and build:

   ```sh
   pnpm exec wrangler login
   pnpm build
   ```

2. Create `dist/server/.dev.vars` (next to the generated Worker config; `dist/` is ignored by git and replaced by every build):

   ```ini
   MAIL_ADAPTER=cloudflare
   CONTACT_RECIPIENT=<your verified destination address>
   MAIL_FROM=contact@jsisques.net
   TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
   ```

   The Turnstile value is Cloudflare's public always-pass test secret, so the test needs no real widget.

3. Make the binding remote. Without this step `wrangler dev` only simulates delivery and prints the email to the console, which is a safe dry run:

   ```sh
   node -e "const fs=require('fs');const f='dist/server/wrangler.json';const c=JSON.parse(fs.readFileSync(f,'utf8'));c.send_email=[{name:'SEND_EMAIL',remote:true}];fs.writeFileSync(f,JSON.stringify(c))"
   ```

4. Start the Worker:

   ```sh
   pnpm exec wrangler dev -c dist/server/wrangler.json --port 8788
   ```

5. In another terminal, send one submission:

   ```sh
   curl -X POST http://127.0.0.1:8788/api/contact -F "name=Delivery test" -F "email=visitor@example.com" -F "message=Test from the local Worker" -F "cf-turnstile-response=XXXX.DUMMY.TOKEN.XXXX"
   ```

   Expected: `{"status":"sent"}`, and an email with the subject `Contact form: Delivery test` in the destination inbox, with `visitor@example.com` as `Reply-To`.

6. Stop `wrangler dev` and run `pnpm build` (or delete `dist/`) to remove `dist/server/.dev.vars`.

## Troubleshooting

| Answer                     | Meaning                                                                                                           |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `400 {"status":"invalid"}` | A field is empty, too long, or not an email address.                                                              |
| `403 {"status":"spam"}`    | Turnstile rejected or missed the token.                                                                           |
| `502 {"status":"error"}`   | Configuration or delivery failure. The Worker logs a line starting with `contact endpoint:` that names the cause. |

Common causes of a 502, from the [Email Service error codes](https://developers.cloudflare.com/email-service/api/send-emails/workers-api/#error-codes):

- `Missing CONTACT_RECIPIENT`, `Missing MAIL_FROM`, or `Missing TURNSTILE_SECRET_KEY`: a secret is not set.
- `E_RECIPIENT_PLAN_RESTRICTED` or `E_RECIPIENT_NOT_ALLOWED`: `CONTACT_RECIPIENT` is not a verified destination address.
- `E_SENDER_DOMAIN_NOT_AVAILABLE` or `E_SENDER_DOMAIN_NOT_CONFIGURED`: `MAIL_FROM` is not on `jsisques.net`, or Email Routing is not enabled there.

In production, the logs are in **Workers & Pages > jsisques-net > Logs**.
