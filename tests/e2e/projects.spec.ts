import { test, expect } from "@playwright/test";
import fixture from "./fixtures/github.json" with { type: "json" };

// Issue #10: featured projects render with GitHub data and the local
// narrative in both locales. The build reads `fixtures/github.json`
// (ADR-0036), so no test calls the real GitHub API.

const LOCALES = ["es", "en"] as const;
const FEATURED = ["JSisques/portfolio", "JSisques/agent-radar"] as const;

for (const locale of LOCALES) {
  test.describe(`${locale} projects`, () => {
    test("renders every featured project in order with its GitHub data", async ({
      page,
    }) => {
      await page.goto(`/${locale}/`);
      const section = page.locator("section#projects");
      await expect(section).toBeVisible();
      await expect(section.getByRole("heading", { level: 2 })).toBeVisible();

      const items = section.locator(":scope > ul > li");
      await expect(items).toHaveCount(FEATURED.length);

      for (const [index, repository] of FEATURED.entries()) {
        const data = fixture[repository];
        const item = items.nth(index);
        await expect(item.getByRole("heading", { level: 3 })).toBeVisible();
        await expect(item.locator(`a[href="${data.url}"]`)).toBeVisible();
        await expect(
          item.locator(`time[datetime="${data.updatedAt}"]`),
        ).toBeVisible();
        await expect(item).toContainText(String(data.stars));
        if (data.language) await expect(item).toContainText(data.language);
        if (data.homepage) {
          await expect(
            item.locator(`a[href="${data.homepage}"]`),
          ).toBeVisible();
        } else {
          await expect(item.locator("a")).toHaveCount(1);
        }
      }
    });
  });
}
