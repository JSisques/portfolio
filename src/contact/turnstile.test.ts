import { describe, expect, it } from "vitest";
import { createTurnstileVerifier } from "./turnstile.js";

type Outcome = {
  status?: number;
  body?: unknown;
  raw?: string;
  error?: unknown;
};

function mockFetch(outcome: Outcome) {
  const calls: { url: string; init: RequestInit | undefined }[] = [];
  const doFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    calls.push({ url, init });
    if (outcome.error !== undefined) {
      throw outcome.error;
    }
    if (outcome.raw !== undefined) {
      return new Response(outcome.raw, { status: outcome.status ?? 200 });
    }
    return new Response(JSON.stringify(outcome.body ?? {}), {
      status: outcome.status ?? 200,
    });
  };
  return { calls, fetch: doFetch as typeof fetch };
}

describe("createTurnstileVerifier", () => {
  it("posts form-encoded secret and response to the siteverify endpoint", async () => {
    const { calls, fetch } = mockFetch({ body: { success: true } });
    await createTurnstileVerifier("test-secret", fetch)("token-123");
    expect(calls).toHaveLength(1);
    const [call] = calls;
    expect(call?.url).toBe(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    );
    expect(call?.init?.method).toBe("POST");
    expect(call?.init?.headers).toEqual({
      "content-type": "application/x-www-form-urlencoded",
    });
    expect(call?.init?.body).toBe("secret=test-secret&response=token-123");
  });

  it("includes remoteip only when a remote IP is given", async () => {
    const withIp = mockFetch({ body: { success: true } });
    await createTurnstileVerifier("test-secret", withIp.fetch)(
      "token-123",
      "203.0.113.7",
    );
    expect(withIp.calls[0]?.init?.body).toBe(
      "secret=test-secret&response=token-123&remoteip=203.0.113.7",
    );

    const withoutIp = mockFetch({ body: { success: true } });
    await createTurnstileVerifier("test-secret", withoutIp.fetch)("token-123");
    expect(String(withoutIp.calls[0]?.init?.body)).not.toContain("remoteip");
  });

  it("returns true only when the verifier answers success: true", async () => {
    const ok = mockFetch({ body: { success: true, "error-codes": [] } });
    expect(
      await createTurnstileVerifier("test-secret", ok.fetch)("token-123"),
    ).toBe(true);

    const rejected = mockFetch({
      body: { success: false, "error-codes": ["invalid-input-response"] },
    });
    expect(
      await createTurnstileVerifier("test-secret", rejected.fetch)("token-123"),
    ).toBe(false);

    const missing = mockFetch({ body: {} });
    expect(
      await createTurnstileVerifier("test-secret", missing.fetch)("token-123"),
    ).toBe(false);
  });

  it("returns false on network failures, HTTP errors, and unparseable bodies", async () => {
    const network = mockFetch({ error: new Error("network unreachable") });
    expect(
      await createTurnstileVerifier("test-secret", network.fetch)("token-123"),
    ).toBe(false);

    const httpError = mockFetch({ status: 503, body: {} });
    expect(
      await createTurnstileVerifier(
        "test-secret",
        httpError.fetch,
      )("token-123"),
    ).toBe(false);

    const notJson = mockFetch({ raw: "not json" });
    expect(
      await createTurnstileVerifier("test-secret", notJson.fetch)("token-123"),
    ).toBe(false);
  });
});
