import { existsSync } from "node:fs";
import { test, expect, type Locator } from "@playwright/test";

// Issue #9: about and experience render in both locales, and margin notes
// (DESIGN.md identity motif) link to real targets and adapt on mobile.

const LOCALES = ["es", "en"] as const;
const MOBILE_VIEWPORT = { width: 320, height: 640 };
const DESKTOP_VIEWPORT = { width: 1440, height: 900 };
const REPO_BLOB = "https://github.com/JSisques/portfolio/blob/main/";

async function box(locator: Locator) {
  const rect = await locator.boundingBox();
  if (!rect) throw new Error("element is not rendered");
  return rect;
}

for (const locale of LOCALES) {
  test.describe(`${locale} home`, () => {
    test("renders the about and experience sections", async ({ page }) => {
      await page.goto(`/${locale}/`);
      for (const id of ["about", "experience"]) {
        const section = page.locator(`section#${id}`);
        await expect(section).toBeVisible();
        await expect(section.getByRole("heading", { level: 2 })).toBeVisible();
      }
      await expect(
        page.locator("section#experience").getByRole("listitem").first(),
      ).toBeVisible();
    });

    test("margin notes link to files that exist in this repository", async ({
      page,
    }) => {
      await page.goto(`/${locale}/`);
      const hrefs = await page
        .locator("[data-margin-notes] a")
        .evaluateAll((links) =>
          links.map((link) => link.getAttribute("href") ?? ""),
        );
      expect(hrefs.length).toBeGreaterThan(0);
      for (const href of hrefs) {
        expect(href).toMatch(/^https:\/\//);
        if (href.startsWith(REPO_BLOB)) {
          expect(existsSync(href.slice(REPO_BLOB.length))).toBe(true);
        }
      }
    });

    test("margin notes sit inline below the text on mobile", async ({
      page,
    }) => {
      await page.setViewportSize(MOBILE_VIEWPORT);
      await page.goto(`/${locale}/`);
      const notes = page.locator("section#about [data-margin-notes]");
      const text = page.locator("section#about p").first();
      const noteBox = await box(notes);
      const textBox = await box(text);
      expect(noteBox.y).toBeGreaterThan(textBox.y);
      expect(noteBox.x + noteBox.width).toBeLessThanOrEqual(
        MOBILE_VIEWPORT.width,
      );
      const scrollWidth = await page.evaluate(
        () => document.documentElement.scrollWidth,
      );
      expect(scrollWidth).toBeLessThanOrEqual(MOBILE_VIEWPORT.width);
    });

    test("margin notes sit in the margin beside the text on desktop", async ({
      page,
    }) => {
      await page.setViewportSize(DESKTOP_VIEWPORT);
      await page.goto(`/${locale}/`);
      const noteBox = await box(
        page.locator("section#about [data-margin-notes]"),
      );
      const mainBox = await box(page.locator("main"));
      expect(noteBox.x).toBeGreaterThanOrEqual(mainBox.x + mainBox.width);
      expect(noteBox.x + noteBox.width).toBeLessThanOrEqual(
        DESKTOP_VIEWPORT.width,
      );
    });
  });
}
