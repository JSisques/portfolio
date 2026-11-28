import type { MailPort } from "./port.js";
import { validateSubmission } from "./validate.js";
import type { TurnstileVerifier } from "./turnstile.js";

export interface ContactDeps {
  mail: MailPort;
  verifyTurnstile: TurnstileVerifier;
}

export async function handleContact(
  request: Request,
  deps: ContactDeps,
): Promise<Response> {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json(400, {
      status: "invalid",
      fields: ["name", "email", "message"],
    });
  }

  const validated = validateSubmission(form);
  if (!validated.ok) {
    return json(400, { status: "invalid", fields: validated.fields });
  }

  const token = form.get("cf-turnstile-response");
  const verified =
    typeof token === "string" &&
    token !== "" &&
    (await deps.verifyTurnstile(token));
  if (!verified) {
    return json(403, { status: "spam" });
  }

  try {
    await deps.mail.send(validated.value);
  } catch {
    return json(502, { status: "error" });
  }
  return json(200, { status: "sent" });
}

// Worker responses do not get the static `_headers` file, so the endpoint
// sets its own: never cached (each answer is per submission), never sniffed.
export function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
}
