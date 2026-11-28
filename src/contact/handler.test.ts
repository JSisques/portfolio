import { describe, expect, it } from "vitest";
import { handleContact } from "./handler.js";
import type { ContactMessage, MailPort } from "./port.js";
import type { TurnstileVerifier } from "./turnstile.js";

const validFields = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  message: "Hello there",
};

function formRequest(fields: Record<string, string>): Request {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    data.append(key, value);
  }
  return new Request("http://localhost/api/contact", {
    method: "POST",
    body: data,
  });
}

function recordingMail(): { port: MailPort; sent: ContactMessage[] } {
  const sent: ContactMessage[] = [];
  const port: MailPort = {
    send: async (message) => {
      sent.push(message);
    },
  };
  return { port, sent };
}

function stubVerifier(accepted: boolean): {
  verify: TurnstileVerifier;
  tokens: string[];
} {
  const tokens: string[] = [];
  const verify: TurnstileVerifier = async (token) => {
    tokens.push(token);
    return accepted;
  };
  return { verify, tokens };
}

describe("handleContact", () => {
  it("sends a valid submission exactly once, keeping the visitor email for the reply", async () => {
    const { port, sent } = recordingMail();
    const { verify, tokens } = stubVerifier(true);
    const response = await handleContact(
      formRequest({ ...validFields, "cf-turnstile-response": "token-123" }),
      { mail: port, verifyTurnstile: verify },
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "sent" });
    expect(sent).toEqual([
      {
        name: "Ada Lovelace",
        email: "ada@example.com",
        message: "Hello there",
      },
    ]);
    expect(tokens).toEqual(["token-123"]);
  });

  it.each([
    ["name", { ...validFields, name: "" }],
    ["email", { ...validFields, email: "not-an-address" }],
    ["message", { ...validFields, message: "" }],
  ])("returns 400 with the invalid %s field", async (field, fields) => {
    const { port, sent } = recordingMail();
    const { verify, tokens } = stubVerifier(true);
    const response = await handleContact(
      formRequest({ ...fields, "cf-turnstile-response": "token-123" }),
      { mail: port, verifyTurnstile: verify },
    );
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      status: "invalid",
      fields: [field],
    });
    expect(sent).toHaveLength(0);
    expect(tokens).toHaveLength(0);
  });

  it("returns 403 spam without calling the deps when the Turnstile token is missing", async () => {
    const { port, sent } = recordingMail();
    const { verify, tokens } = stubVerifier(true);
    const response = await handleContact(formRequest(validFields), {
      mail: port,
      verifyTurnstile: verify,
    });
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ status: "spam" });
    expect(tokens).toHaveLength(0);
    expect(sent).toHaveLength(0);
  });

  it("returns 403 spam and never calls the mail port when the token is rejected", async () => {
    const { port, sent } = recordingMail();
    const { verify, tokens } = stubVerifier(false);
    const response = await handleContact(
      formRequest({ ...validFields, "cf-turnstile-response": "bad-token" }),
      { mail: port, verifyTurnstile: verify },
    );
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ status: "spam" });
    expect(tokens).toEqual(["bad-token"]);
    expect(sent).toHaveLength(0);
  });

  it("returns 502 when the mail port throws", async () => {
    const failing: MailPort = {
      send: async () => {
        throw new Error("mail delivery failed");
      },
    };
    const { verify, tokens } = stubVerifier(true);
    const response = await handleContact(
      formRequest({ ...validFields, "cf-turnstile-response": "token-123" }),
      { mail: failing, verifyTurnstile: verify },
    );
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ status: "error" });
    expect(tokens).toEqual(["token-123"]);
  });

  it("returns 400 with every field when the body is not a form", async () => {
    const { port, sent } = recordingMail();
    const { verify, tokens } = stubVerifier(true);
    const request = new Request("http://localhost/api/contact", {
      method: "POST",
      body: "not a form",
      headers: { "content-type": "text/plain" },
    });
    const response = await handleContact(request, {
      mail: port,
      verifyTurnstile: verify,
    });
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      status: "invalid",
      fields: ["name", "email", "message"],
    });
    expect(tokens).toHaveLength(0);
    expect(sent).toHaveLength(0);
  });
});
