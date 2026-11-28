import { afterEach, describe, expect, it, vi } from "vitest";
import type { SendEmailBinding } from "./adapters/cloudflare.js";
import { createContactEndpoint, type ContactEnv } from "./endpoint.js";

const SITE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

const validFields = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  message: "Hello there",
  "cf-turnstile-response": "token-123",
};

function formRequest(
  fields: Record<string, string>,
  headers: Record<string, string> = {},
): Request {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    data.append(key, value);
  }
  return new Request("http://localhost/api/contact", {
    method: "POST",
    body: data,
    headers,
  });
}

// Fake siteverify: records each request body and answers `success`.
function fakeSiteVerify(success: boolean) {
  const bodies: URLSearchParams[] = [];
  const fetchFn = async (input: RequestInfo | URL, init?: RequestInit) => {
    expect(String(input)).toBe(SITE_VERIFY_URL);
    bodies.push(new URLSearchParams(String(init?.body)));
    return new Response(JSON.stringify({ success }), { status: 200 });
  };
  return { fetchFn: fetchFn as typeof fetch, bodies };
}

function spyBinding() {
  const sent: Parameters<SendEmailBinding["send"]>[0][] = [];
  const binding: SendEmailBinding = {
    send: async (message) => {
      sent.push(message);
    },
  };
  return { sent, binding };
}

const productionEnv = (binding: SendEmailBinding): ContactEnv => ({
  MAIL_ADAPTER: "cloudflare",
  SEND_EMAIL: binding,
  CONTACT_RECIPIENT: "owner@example.com",
  MAIL_FROM: "contact@example.com",
  TURNSTILE_SECRET_KEY: "secret",
});

async function body(response: Response): Promise<unknown> {
  return response.json();
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("createContactEndpoint", () => {
  it("delivers through the send_email binding in production, visitor as Reply-To", async () => {
    const { sent, binding } = spyBinding();
    const { fetchFn } = fakeSiteVerify(true);
    const endpoint = createContactEndpoint(productionEnv(binding), fetchFn);

    const response = await endpoint(formRequest(validFields));

    expect(response.status).toBe(200);
    expect(await body(response)).toEqual({ status: "sent" });
    expect(sent).toHaveLength(1);
    expect(sent[0]).toMatchObject({
      to: "owner@example.com",
      from: "contact@example.com",
      replyTo: "ada@example.com",
    });
  });

  it("never sends email with the preview settings (log-only adapter)", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const { sent, binding } = spyBinding();
    const { fetchFn } = fakeSiteVerify(true);
    const endpoint = createContactEndpoint(
      { ...productionEnv(binding), MAIL_ADAPTER: "log" },
      fetchFn,
    );

    const response = await endpoint(formRequest(validFields));

    expect(response.status).toBe(200);
    expect(sent).toHaveLength(0);
    expect(log).toHaveBeenCalledTimes(1);
  });

  it("verifies the Turnstile token with the secret and the visitor IP", async () => {
    const { binding } = spyBinding();
    const { fetchFn, bodies } = fakeSiteVerify(true);
    const endpoint = createContactEndpoint(productionEnv(binding), fetchFn);

    await endpoint(
      formRequest(validFields, { "CF-Connecting-IP": "203.0.113.7" }),
    );

    expect(bodies).toHaveLength(1);
    expect(bodies[0]?.get("secret")).toBe("secret");
    expect(bodies[0]?.get("response")).toBe("token-123");
    expect(bodies[0]?.get("remoteip")).toBe("203.0.113.7");
  });

  it("rejects a token Turnstile does not accept, without sending", async () => {
    const { sent, binding } = spyBinding();
    const { fetchFn } = fakeSiteVerify(false);
    const endpoint = createContactEndpoint(productionEnv(binding), fetchFn);

    const response = await endpoint(formRequest(validFields));

    expect(response.status).toBe(403);
    expect(await body(response)).toEqual({ status: "spam" });
    expect(sent).toHaveLength(0);
  });

  it("answers invalid input without calling Turnstile, even with no configuration", async () => {
    const { fetchFn, bodies } = fakeSiteVerify(true);
    const endpoint = createContactEndpoint({}, fetchFn);

    const response = await endpoint(formRequest({ name: "Ada" }));

    expect(response.status).toBe(400);
    expect(await body(response)).toEqual({
      status: "invalid",
      fields: ["email", "message"],
    });
    expect(bodies).toHaveLength(0);
  });

  it("answers invalid input before checking incomplete mail settings", async () => {
    const { binding } = spyBinding();
    const { fetchFn } = fakeSiteVerify(true);
    const env = productionEnv(binding);
    delete env.CONTACT_RECIPIENT;
    const endpoint = createContactEndpoint(env, fetchFn);

    const response = await endpoint(formRequest({ name: "Ada" }));

    expect(response.status).toBe(400);
  });

  it("reports a delivery error, not spam, when the Turnstile secret is missing", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const { sent, binding } = spyBinding();
    const { fetchFn, bodies } = fakeSiteVerify(true);
    const env = productionEnv(binding);
    delete env.TURNSTILE_SECRET_KEY;
    const endpoint = createContactEndpoint(env, fetchFn);

    const response = await endpoint(formRequest(validFields));

    expect(response.status).toBe(502);
    expect(await body(response)).toEqual({ status: "error" });
    expect(bodies).toHaveLength(0);
    expect(sent).toHaveLength(0);
    expect(error).toHaveBeenCalledTimes(1);
  });

  it("reports a delivery error when the production mail settings are incomplete", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const { binding } = spyBinding();
    const { fetchFn } = fakeSiteVerify(true);
    const env = productionEnv(binding);
    delete env.CONTACT_RECIPIENT;
    const endpoint = createContactEndpoint(env, fetchFn);

    const response = await endpoint(formRequest(validFields));

    expect(response.status).toBe(502);
    expect(await body(response)).toEqual({ status: "error" });
    expect(String(error.mock.calls[0]?.[0])).toContain("CONTACT_RECIPIENT");
  });

  it("is never cached and never sniffed", async () => {
    const { binding } = spyBinding();
    const { fetchFn } = fakeSiteVerify(true);
    const endpoint = createContactEndpoint(productionEnv(binding), fetchFn);

    const response = await endpoint(formRequest(validFields));

    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
  });
});
