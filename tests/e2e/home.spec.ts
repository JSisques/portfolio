import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// ADR-0016, ADR-0023: e2e tests - run against the built site and
// check accessibility with axe-core WCAG tags.
//
// ADR-0026: locale-prefixed routes; the root redirects to /es/.

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const MOBILE_VIEWPORT = { width: 320, height: 640 };

async function expectNoAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  expect(results.violations).toEqual([]);
}

test.describe("home page", () => {
  test("the root redirects to the Spanish home", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/es\/$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
  });

  test("Spanish home passes accessibility audit", async ({ page }) => {
    await page.goto("/es/");
    await expectNoAxeViolations(page);
  });

  test("English home passes accessibility audit", async ({ page }) => {
    await page.goto("/en/");
    await expectNoAxeViolations(page);
  });

  test("language switcher switches locale and back", async ({ page }) => {
    await page.goto("/es/");
    await page.getByRole("link", { name: "English" }).click();
    await expect(page).toHaveURL(/\/en\/$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await page.getByRole("link", { name: "Español" }).click();
    await expect(page).toHaveURL(/\/es\/$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
  });

  test("has no horizontal overflow at 320px", async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto("/es/");
    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );
    const innerWidth = await page.evaluate(() => window.innerWidth);
    expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
  });

  test("header interactive elements are at least 44px tap targets", async ({
    page,
  }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto("/es/");
    const boxes = await page.$$eval("header a, header button", (els) =>
      els.map((el) => {
        const rect = el.getBoundingClientRect();
        return { width: rect.width, height: rect.height };
      }),
    );
    expect(boxes.length).toBeGreaterThan(0);
    for (const box of boxes) {
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });
});
