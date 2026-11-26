import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// ADR-0016, ADR-0023: e2e test - runs against the built site and
// checks accessibility with axe-core WCAG tags.

test("home page loads with Spanish locale and passes accessibility", async ({
  page,
}) => {
  const response = await page.goto("/");
  expect(response?.ok()).toBe(true);

  // ADR-0003: the default locale is Spanish
  await expect(page.locator("html")).toHaveAttribute("lang", "es");

  // Axe accessibility audit - WCAG 2.2 AA (ADR-0023)
  const accessibilityResults = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();

  expect(accessibilityResults.violations).toEqual([]);
});
