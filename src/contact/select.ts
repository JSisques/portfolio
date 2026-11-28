import { createCloudflareMailPort } from "./adapters/cloudflare.js";
import type { SendEmailBinding } from "./adapters/cloudflare.js";
import { createLogMailPort } from "./adapters/log.js";
import type { MailPort } from "./port.js";

export interface MailAdapterEnv {
  MAIL_ADAPTER?: string;
  SEND_EMAIL?: SendEmailBinding;
  CONTACT_RECIPIENT?: string;
  MAIL_FROM?: string;
}

export function selectMailAdapter(env: MailAdapterEnv): MailPort {
  if (env.MAIL_ADAPTER === "cloudflare") {
    if (!env.SEND_EMAIL) {
      throw new Error(
        "Missing SEND_EMAIL binding for the cloudflare mail adapter",
      );
    }
    if (!env.CONTACT_RECIPIENT) {
      throw new Error(
        "Missing CONTACT_RECIPIENT for the cloudflare mail adapter",
      );
    }
    if (!env.MAIL_FROM) {
      throw new Error("Missing MAIL_FROM for the cloudflare mail adapter");
    }
    return createCloudflareMailPort(env.SEND_EMAIL, {
      recipient: env.CONTACT_RECIPIENT,
      sender: env.MAIL_FROM,
    });
  }
  if (env.MAIL_ADAPTER === "smtp") {
    // Reserved slot: the SMTP adapter and its library move to #13 with the
    // Node target (owner decision L2).
    throw new Error("SMTP adapter not available until #13");
  }
  // "log", unset, and unknown values fall back to log-only so a preview or a
  // misconfigured environment never sends mail (ADR-0021).
  return createLogMailPort();
}
