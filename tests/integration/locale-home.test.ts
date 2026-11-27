import { describe, it, expect } from "vitest";
import {
  experimental_AstroContainer as AstroContainer,
  type ContainerRenderOptions,
} from "astro/container";

// ADR-0015: integration test - renders a page via the Astro Container API
// and asserts behavior, not static copy.
//
// ADR-0026: locale-prefixed routes, hreflang alternates, x-default -> Spanish.

import Page from "../../src/pages/[lang]/index.astro";
import { locales, type Locale } from "../../src/i18n/locales.js";

const SITE = "https://jsisques.net";

async function renderHome(locale: Locale) {
  const container = await AstroContainer.create({
    astroConfig: { site: SITE },
  });
  // The container types .astro imports as a generic factory; widen the page
  // argument to match the renderToString call site.
  const render = container.renderToString.bind(container) as (
    page: unknown,
    options?: ContainerRenderOptions,
  ) => Promise<string>;
  return render(Page, {
    request: new Request(`${SITE}/${locale}/`),
    params: { lang: locale },
  });
}

describe("localized home page", () => {
  it.each(locales)(
    "renders <html lang=%s> for the %s locale",
    async (locale) => {
      const html = await renderHome(locale);
      expect(html).toMatch(new RegExp(`<html\\b[^>]*\\blang="${locale}"`));
    },
  );

  it.each(locales)(
    "sets the canonical URL of the %s locale",
    async (locale) => {
      const html = await renderHome(locale);
      expect(html).toContain(
        `<link rel="canonical" href="${SITE}/${locale}/">`,
      );
    },
  );

  it.each(locales)(
    "emits es, en and x-default alternates for the %s locale",
    async (locale) => {
      const html = await renderHome(locale);
      expect(html).toContain(
        `<link rel="alternate" hreflang="es" href="${SITE}/es/">`,
      );
      expect(html).toContain(
        `<link rel="alternate" hreflang="en" href="${SITE}/en/">`,
      );
      // ADR-0026: x-default always points at the Spanish page.
      expect(html).toContain(
        `<link rel="alternate" hreflang="x-default" href="${SITE}/es/">`,
      );
    },
  );

  it("links the Spanish home to the English home, labeled in English", async () => {
    const html = await renderHome("es");
    expect(html).toMatch(
      /<a\b[^>]*href="\/en\/"[^>]*lang="en"[^>]*>English<\/a>/,
    );
  });

  it("links the English home to the Spanish home, labeled in Spanish", async () => {
    const html = await renderHome("en");
    expect(html).toMatch(
      /<a\b[^>]*href="\/es\/"[^>]*lang="es"[^>]*>Espa\u00f1ol<\/a>/,
    );
  });
});
