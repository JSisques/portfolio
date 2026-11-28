import { type Page, type Route } from "@playwright/test";
import { test, expect } from "./test-base.js";
import AxeBuilder from "@axe-core/playwright";
import { t } from "../../src/i18n/ui.js";

// S6, S9: contact form states, keyboard operability, and axe are tested
// against the built site. Cloudflare Turnstile and the contact endpoint are
// stubbed with page.route: tests never make real external calls (AGENTS.md)
// and the endpoint does not exist in the static build.
//
// ADR-0023: accessibility with axe-core, same WCAG tags as home.spec.ts.

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const FALLBACK_SITE_KEY = "1x00000000000000000000AA";
const NAME = "Javier";
const EMAIL = "javier@example.com";
const MESSAGE = "Hola";

async function expectNoAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  expect(results.violations).toEqual([]);
}

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

const json = (status: number, body: object) => (route: Route) =>
  route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  });

async function stubContactRoutes(
  page: Page,
  responder: (route: Route) => void,
) {
  // Turnstile is stubbed for every test by ./test-base.ts.
  await page.route("**/api/contact", responder);
}

async function fillForm(page: Page) {
  await page.fill("#contact-name", NAME);
  await page.fill("#contact-email", EMAIL);
  await page.fill("#contact-message", MESSAGE);
}

async function hasVisibleFocus(page: Page) {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el) return false;
    const style = window.getComputedStyle(el);
    const outlineWidth = Number.parseFloat(style.outlineWidth);
    const hasOutline = style.outlineStyle !== "none" && outlineWidth > 0;
    return hasOutline || style.boxShadow !== "none";
  });
}

for (const locale of ["es", "en"] as const) {
  test.describe(`${locale} contact section`, () => {
    test("submits with fetch and shows the success state", async ({ page }) => {
      await stubContactRoutes(page, json(200, { status: "sent" }));
      await page.goto(`/${locale}/`);
      const requestPromise = page.waitForRequest((request) =>
        request.url().endsWith("/api/contact"),
      );
      await fillForm(page);
      await page
        .getByRole("button", { name: t(locale, "contactSubmit") })
        .click();
      const request = await requestPromise;
      expect(request.method()).toBe("POST");
      await expect(page.locator("#contact-status")).toHaveText(
        t(locale, "contactSuccess"),
      );
      await expect(page.locator("#contact-name")).toHaveValue("");
      await expect(page.locator("#contact-email")).toHaveValue("");
      await expect(page.locator("#contact-message")).toHaveValue("");
      await expect(page.locator("#contact-form")).not.toHaveAttribute(
        "aria-busy",
      );
      await expect(
        page.getByRole("button", { name: t(locale, "contactSubmit") }),
      ).toBeEnabled();
    });

    test("marks invalid fields, announces the error, and keeps the input", async ({
      page,
    }) => {
      await stubContactRoutes(
        page,
        json(400, { status: "invalid", fields: ["email", "message"] }),
      );
      await page.goto(`/${locale}/`);
      await fillForm(page);
      await page
        .getByRole("button", { name: t(locale, "contactSubmit") })
        .click();
      await expect(page.locator("#contact-email")).toHaveAttribute(
        "aria-invalid",
        "true",
      );
      await expect(page.locator("#contact-message")).toHaveAttribute(
        "aria-invalid",
        "true",
      );
      await expect(page.locator("#contact-name")).not.toHaveAttribute(
        "aria-invalid",
      );
      await expect(page.locator("#contact-status")).toHaveText(
        t(locale, "contactInvalid"),
      );
      await expect(page.locator("#contact-email")).toBeFocused();
      await expect(page.locator("#contact-name")).toHaveValue(NAME);
      await expect(page.locator("#contact-email")).toHaveValue(EMAIL);
    });

    test("shows the spam state without marking fields", async ({ page }) => {
      await stubContactRoutes(page, json(403, { status: "spam" }));
      await page.goto(`/${locale}/`);
      await fillForm(page);
      await page
        .getByRole("button", { name: t(locale, "contactSubmit") })
        .click();
      await expect(page.locator("#contact-status")).toHaveText(
        t(locale, "contactSpam"),
      );
      await expect(page.locator("#contact-name")).not.toHaveAttribute(
        "aria-invalid",
      );
      await expect(page.locator("#contact-email")).toHaveValue(EMAIL);
    });

    test("shows the delivery error state", async ({ page }) => {
      await stubContactRoutes(page, json(502, { status: "error" }));
      await page.goto(`/${locale}/`);
      await fillForm(page);
      await page
        .getByRole("button", { name: t(locale, "contactSubmit") })
        .click();
      await expect(page.locator("#contact-status")).toHaveText(
        t(locale, "contactError"),
      );
      await expect(page.locator("#contact-message")).toHaveValue(MESSAGE);
    });

    test("shows the delivery error state when the request fails", async ({
      page,
    }) => {
      await stubContactRoutes(page, (route) => route.abort());
      await page.goto(`/${locale}/`);
      await fillForm(page);
      await page
        .getByRole("button", { name: t(locale, "contactSubmit") })
        .click();
      await expect(page.locator("#contact-status")).toHaveText(
        t(locale, "contactError"),
      );
    });

    test("disables submit and marks the form busy while loading", async ({
      page,
    }) => {
      await stubContactRoutes(page, (route) => {
        setTimeout(() => {
          void route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ status: "sent" }),
          });
        }, 600);
      });
      await page.goto(`/${locale}/`);
      await fillForm(page);
      const submit = page.getByRole("button", {
        name: t(locale, "contactSubmit"),
      });
      await submit.click();
      await expect(submit).toBeDisabled();
      await expect(page.locator("#contact-form")).toHaveAttribute(
        "aria-busy",
        "true",
      );
      await expect(page.locator("#contact-status")).toHaveText(
        t(locale, "contactLoading"),
      );
      await expect(submit).toBeEnabled();
      await expect(page.locator("#contact-status")).toHaveText(
        t(locale, "contactSuccess"),
      );
    });

    test("is keyboard operable with visible focus and submits", async ({
      page,
    }) => {
      await stubContactRoutes(page, json(200, { status: "sent" }));
      await page.goto(`/${locale}/`);
      // Tab from the top of the document until the first form field.
      let focused = "";
      for (let i = 0; i < 60; i++) {
        await page.keyboard.press("Tab");
        focused = await page.evaluate(() => document.activeElement?.id ?? "");
        if (focused === "contact-name") break;
      }
      expect(focused).toBe("contact-name");
      expect(await hasVisibleFocus(page)).toBe(true);
      for (const id of ["contact-email", "contact-message"]) {
        await page.keyboard.press("Tab");
        expect(
          await page.evaluate(() => document.activeElement?.id ?? ""),
        ).toBe(id);
        expect(await hasVisibleFocus(page)).toBe(true);
      }
      // Fill while focused, then tab to the submit button; the required
      // fields would otherwise block the submission with native validation.
      await fillForm(page);
      await page.keyboard.press("Tab");
      expect(await page.evaluate(() => document.activeElement?.id ?? "")).toBe(
        "contact-submit",
      );
      expect(await hasVisibleFocus(page)).toBe(true);
      const requestPromise = page.waitForRequest((request) =>
        request.url().endsWith("/api/contact"),
      );
      await page.keyboard.press("Enter");
      await requestPromise;
      await expect(page.locator("#contact-status")).toHaveText(
        t(locale, "contactSuccess"),
      );
    });

    test("passes the accessibility audit in the empty state", async ({
      page,
    }) => {
      await stubContactRoutes(page, json(200, { status: "sent" }));
      await page.goto(`/${locale}/`);
      await expectNoAxeViolations(page);
    });

    test("passes the accessibility audit in the error state", async ({
      page,
    }) => {
      await stubContactRoutes(
        page,
        json(400, { status: "invalid", fields: ["email"] }),
      );
      await page.goto(`/${locale}/`);
      await fillForm(page);
      await page
        .getByRole("button", { name: t(locale, "contactSubmit") })
        .click();
      await expect(page.locator("#contact-status")).toHaveText(
        t(locale, "contactInvalid"),
      );
      await expectNoAxeViolations(page);
    });

    test("renders the Turnstile widget and script with no CSP violation", async ({
      page,
    }) => {
      await recordViolations(page);
      await stubContactRoutes(page, json(200, { status: "sent" }));
      await page.goto(`/${locale}/`);
      await expect(
        page.locator(
          'script[src="https://challenges.cloudflare.com/turnstile/v0/api.js"]',
        ),
      ).toHaveCount(1);
      await expect(page.locator(".cf-turnstile")).toHaveAttribute(
        "data-sitekey",
        FALLBACK_SITE_KEY,
      );
      expect(await violations(page)).toEqual([]);
    });
  });
}
