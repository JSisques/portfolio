import type { SendEmailBinding } from "./adapters/cloudflare.js";
import { handleContact, json } from "./handler.js";
import { selectMailAdapter } from "./select.js";
import { createTurnstileVerifier } from "./turnstile.js";

// Worker variables, secrets, and bindings the contact endpoint reads
// (wrangler.jsonc; secrets are set with `wrangler secret put`).
export interface ContactEnv {
  MAIL_ADAPTER?: string;
  SEND_EMAIL?: SendEmailBinding;
  CONTACT_RECIPIENT?: string;
  MAIL_FROM?: string;
  TURNSTILE_SECRET_KEY?: string;
}

// Composes the contact handler from the runtime environment (ADR-0014,
// ADR-0021). A missing setting is the owner's configuration error, never
// the visitor's: it is logged and answered as a delivery error.
export function createContactEndpoint(
  env: ContactEnv,
  fetchFn: typeof fetch = fetch,
): (request: Request) => Promise<Response> {
  return async (request) => {
    try {
      const secret = env.TURNSTILE_SECRET_KEY;
      const verify = secret
        ? createTurnstileVerifier(secret, fetchFn)
        : undefined;
      const remoteIp = request.headers.get("CF-Connecting-IP") ?? undefined;
      return await handleContact(request, {
        // Selected only when a valid, verified submission is sent, so invalid
        // input is answered first. A configuration or delivery failure is
        // logged here; the handler answers it as a 502.
        mail: {
          send: async (message) => {
            try {
              await selectMailAdapter(env).send(message);
            } catch (error) {
              console.error(`contact endpoint: ${String(error)}`);
              throw error;
            }
          },
        },
        verifyTurnstile: async (token) => {
          if (!verify) throw new Error("Missing TURNSTILE_SECRET_KEY");
          return verify(token, remoteIp);
        },
      });
    } catch (error) {
      console.error(`contact endpoint: ${String(error)}`);
      return json(502, { status: "error" });
    }
  };
}
