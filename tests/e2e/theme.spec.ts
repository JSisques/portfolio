import { type Page } from "@playwright/test";
import { test, expect } from "./test-base.js";

// ADR-0028: the theme follows the system preference (dark when none is
// declared); the visitor's "theme" choice in localStorage takes precedence
// on later visits; a classic inline script in <head> applies the theme
// before the first paint.

const HOME = "/es/";

function expectTheme(page: Page, theme: "light" | "dark") {
  return expect(page.locator("html")).toHaveAttribute("data-theme", theme);
}

test.describe("system light", () => {
  test.use({ colorScheme: "light" });

  test("initial theme is light", async ({ page }) => {
    await page.goto(HOME);
    await expectTheme(page, "light");
  });

  test("stored dark wins over system light", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("theme", "dark"));
    await page.goto(HOME);
    await expectTheme(page, "dark");
  });

  test("invalid stored value falls back to system light", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("theme", "blue"));
    await page.goto(HOME);
    await expectTheme(page, "light");
  });
});

test.describe("system dark", () => {
  test.use({ colorScheme: "dark" });

  test("initial theme is dark", async ({ page }) => {
    await page.goto(HOME);
    await expectTheme(page, "dark");
  });

  test("stored light wins over system dark", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("theme", "light"));
    await page.goto(HOME);
    await expectTheme(page, "light");
  });
});

test("initial theme is dark when the system declares no preference", async ({
  page,
}) => {
  // Chromium has no "no-preference" value, so emulate a no-preference browser in the page: prefers-color-scheme queries match nothing.
  await page.addInitScript(() => {
    const original = window.matchMedia.bind(window);
    window.matchMedia = (query) =>
      query.includes("prefers-color-scheme")
        ? ({ matches: false, media: query } as MediaQueryList)
        : original(query);
  });
  await page.goto(HOME);
  await expectTheme(page, "dark");
});

test.describe("theme toggle", () => {
  test.use({ colorScheme: "dark" });

  test("switches from dark to light and stores the choice", async ({
    page,
  }) => {
    await page.goto("/es/");
    const toggle = page.getByRole("button", { name: "Tema oscuro" });
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await toggle.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe(
      "light",
    );
  });

  test("stored choice survives a reload over system dark", async ({ page }) => {
    await page.goto("/es/");
    await page.getByRole("button", { name: "Tema oscuro" }).click();
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  });

  test("toggles with the keyboard", async ({ page }) => {
    await page.goto("/es/");
    const toggle = page.getByRole("button", { name: "Tema oscuro" });
    await toggle.focus();
    await page.keyboard.press("Space");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
  });

  test("is labeled in the page language", async ({ page }) => {
    await page.goto("/en/");
    await expect(
      page.getByRole("button", { name: "Dark theme" }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});

test("theme script is a classic inline script before the first stylesheet", async ({
  page,
}) => {
  await page.goto(HOME);
  const info = await page.evaluate(() => {
    const children = Array.from(document.head.children);
    const themeScript = Array.from(
      document.head.querySelectorAll("script"),
    ).find((script) => script.textContent?.includes("localStorage"));
    if (!themeScript) return { found: false as const };
    const styleIndex = children.findIndex(
      (el) =>
        el.tagName === "STYLE" ||
        (el.tagName === "LINK" &&
          (el.getAttribute("rel") ?? "").includes("stylesheet")),
    );
    return {
      found: true as const,
      src: themeScript.getAttribute("src"),
      type: themeScript.getAttribute("type"),
      defer: themeScript.defer,
      async: themeScript.async,
      scriptIndex: children.indexOf(themeScript),
      styleIndex,
    };
  });
  expect(info).toMatchObject({ found: true });
  if (!info.found) return;
  expect(info.src).toBeNull();
  expect(info.type).toBeNull();
  expect(info.defer).toBe(false);
  expect(info.async).toBe(false);
  expect(info.styleIndex).toBeGreaterThan(info.scriptIndex);
});

test.describe("hover states", () => {
  test.use({ colorScheme: "dark" });

  test("hovering a language switcher link underlines it", async ({ page }) => {
    await page.goto("/es/");
    const link = page.getByRole("link", { name: "English" });
    await link.hover();
    const decoration = await link.evaluate(
      (el) => getComputedStyle(el).textDecorationLine,
    );
    expect(decoration).toBe("underline");
  });

  test("hovering the theme toggle turns its background surface-colored", async ({
    page,
  }) => {
    await page.goto("/es/");
    const toggle = page.getByRole("button", { name: "Tema oscuro" });
    await toggle.hover();
    // Probe: read --surface in the same format the browser computes for a
    // background-color, so the comparison is format-stable.
    const isSurface = () =>
      page.evaluate(() => {
        const button = document.querySelector<HTMLElement>(
          "[data-theme-toggle]",
        );
        if (!button) return false;
        const probe = document.createElement("div");
        probe.style.backgroundColor = "var(--surface)";
        document.body.appendChild(probe);
        const surface = getComputedStyle(probe).backgroundColor;
        probe.remove();
        return getComputedStyle(button).backgroundColor === surface;
      });
    await expect.poll(isSurface).toBe(true);
  });
});
