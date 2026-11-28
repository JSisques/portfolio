import { test as base, expect } from "@playwright/test";

// Every built page loads the Cloudflare Turnstile script (contact form, S5).
// This automatic fixture stubs that origin for every e2e test, so no suite
// makes a real external call (AGENTS.md). Specs import `test` from here.
export const test = base.extend<{ stubTurnstile: void }>({
  stubTurnstile: [
    async ({ page }, use) => {
      await page.route("https://challenges.cloudflare.com/**", (route) =>
        route.fulfill({
          contentType: "application/javascript",
          body: "/* Turnstile stub */",
        }),
      );
      await use();
    },
    { auto: true },
  ],
});

export { expect };
