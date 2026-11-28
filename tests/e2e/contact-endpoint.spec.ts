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
