import { type Page } from "@playwright/test";
import { test, expect } from "./test-base.js";
import { securityHeaders } from "../../src/security/headers.js";

// ADR-0033: every response carries the security headers and the strict CSP
// defined in src/security/headers.ts. This suite runs against `astro
// preview`, which runs the Worker and serves the generated `_headers` file
// (tests/integration/security-integration.test.ts).

// Records every CSP violation the page reports, before any page script runs.
async function recordViolations(page: Page) {
  await page.addInitScript(() => {
    const violations: string[] = [];
    Object.assign(window, { __cspViolations: violations });
    document.addEventListener("securitypolicyviolation", (event) => {
      violations.push(`${event.violatedDirective} ${event.blockedURI}`);
    });
  });
}

function violations(page: Page) {
  return page.evaluate(
    () => (window as unknown as { __cspViolations: string[] }).__cspViolations,
  );
}

for (const path of ["/es/", "/en/"]) {
  test(`${path} sends every security header`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.ok()).toBe(true);
    const headers = response?.headers() ?? {};
    for (const [name, value] of Object.entries(securityHeaders)) {
      expect(headers[name.toLowerCase()], name).toBe(value);
    }
  });
}

test.describe("theme script under the CSP", () => {
  test.use({ colorScheme: "light" });

  test("runs and sets the system theme with no CSP violation", async ({
    page,
  }) => {
    await recordViolations(page);
    const response = await page.goto("/es/");
    // Guard: the policy is actually enforced on this response.
    expect(response?.headers()["content-security-policy"]).toBeTruthy();
    // Only the theme script sets data-theme, so "light" proves it ran.
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    expect(await violations(page)).toEqual([]);
  });

  test("theme toggle still works with no CSP violation", async ({ page }) => {
    await recordViolations(page);
    await page.goto("/es/");
    await page.getByRole("button", { name: "Tema oscuro" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    expect(await violations(page)).toEqual([]);
  });
});
