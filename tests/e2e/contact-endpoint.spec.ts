import { test, expect } from "./test-base.js";

// ADR-0007: /api/contact is the one on-demand route, served by the Worker
// in the adapter's preview runtime. Invalid input is answered before any
// Turnstile or mail call, so this test makes no external request.
test("the contact endpoint answers an invalid submission from the Worker", async ({
  request,
}) => {
  const response = await request.post("/api/contact", {
    multipart: { name: "Ada", email: "not-an-address", message: "" },
  });

  expect(response.status()).toBe(400);
  expect(await response.json()).toEqual({
    status: "invalid",
    fields: ["email", "message"],
  });
  expect(response.headers()["cache-control"]).toBe("no-store");
  expect(response.headers()["x-content-type-options"]).toBe("nosniff");
});

// The preview Worker runs with the production vars and no secrets
// (MAIL_ADAPTER=cloudflare, no TURNSTILE_SECRET_KEY), so no case below can
// reach Turnstile or send mail.
test("the contact endpoint rejects a valid submission without a token as spam", async ({
  request,
}) => {
  const response = await request.post("/api/contact", {
    multipart: { name: "Ada", email: "ada@example.com", message: "Hi" },
  });

  expect(response.status()).toBe(403);
  expect(await response.json()).toEqual({ status: "spam" });
});

test("the contact endpoint answers a missing Turnstile secret as a delivery error", async ({
  request,
}) => {
  const response = await request.post("/api/contact", {
    multipart: {
      name: "Ada",
      email: "ada@example.com",
      message: "Hi",
      "cf-turnstile-response": "token",
    },
  });

  expect(response.status()).toBe(502);
  expect(await response.json()).toEqual({ status: "error" });
});

test("the contact endpoint only accepts POST", async ({ request }) => {
  const response = await request.get("/api/contact");

  expect(response.status()).not.toBe(200);
});
