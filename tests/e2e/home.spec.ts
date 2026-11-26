import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// ADR-0016, ADR-0023: e2e tests - run against the built site and
// check accessibility with axe-core WCAG tags.

test.describe("home page", () => {
  test("loads with Spanish locale", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.ok()).toBe(true);

    // ADR-0003: the default locale is Spanish
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
  });

  test("passes accessibility audit", async ({ page }) => {
    await page.goto("/");

    // Axe accessibility audit - WCAG 2.2 AA (ADR-0023)
    const accessibilityResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    expect(accessibilityResults.violations).toEqual([]);
  });
});
