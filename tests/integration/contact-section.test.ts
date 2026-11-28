import { afterAll, describe, expect, it, vi } from "vitest";
import {
  experimental_AstroContainer as AstroContainer,
  type ContainerRenderOptions,
} from "astro/container";

// The contact section is presentational: the page hands in the locale, and
// the section renders the direct links (S1), the form with the Turnstile
// widget (S2), the privacy notice, and the aria-live status region (S6).
import ContactSection from "../../src/components/ContactSection.astro";
import { locales, type Locale } from "../../src/i18n/locales.js";
import { t } from "../../src/i18n/ui.js";

const FALLBACK_SITE_KEY = "1x00000000000000000000AA";

async function render(locale: Locale) {
  const container = await AstroContainer.create();
  const renderToString = container.renderToString.bind(container) as (
    component: unknown,
    options?: ContainerRenderOptions,
  ) => Promise<string>;
  return renderToString(ContactSection, { props: { locale } });
}

describe("contact section", () => {
  afterAll(() => {
    vi.unstubAllEnvs();
  });

  for (const locale of locales) {
    it(`labels the section from its heading (${locale})`, async () => {
      const html = await render(locale);
      expect(html).toMatch(/<section\b[^>]*id="contact"/);
      expect(html).toMatch(/<section\b[^>]*aria-labelledby="contact-heading"/);
      expect(html).toMatch(
        new RegExp(
          `<h2\\b[^>]*id="contact-heading"[^>]*>${t(locale, "contactHeading")}</h2>`,
        ),
      );
    });

    it(`renders the direct contact links (${locale})`, async () => {
      const html = await render(locale);
      expect(html).toMatch(
        /<a\b[^>]*href="mailto:hello@jsisques\.net"[^>]*>hello@jsisques\.net<\/a>/,
      );
      expect(html).toMatch(/<a\b[^>]*href="\[REAL DATA\]"[^>]*>LinkedIn<\/a>/);
      expect(html).toMatch(
        /<a\b[^>]*href="https:\/\/github\.com\/JSisques"[^>]*>github\.com\/JSisques<\/a>/,
      );
    });

    it(`renders the form posting to the contact endpoint (${locale})`, async () => {
      const html = await render(locale);
      expect(html).toMatch(
        /<form\b[^>]*id="contact-form"[^>]*method="post"[^>]*action="\/api\/contact"/,
      );
    });

    it(`renders labelled, required form fields (${locale})`, async () => {
      const html = await render(locale);
      expect(html).toMatch(/<label\b[^>]*for="contact-name"/);
      expect(html).toMatch(/<label\b[^>]*for="contact-email"/);
      expect(html).toMatch(/<label\b[^>]*for="contact-message"/);
      expect(html).toMatch(
        /<input\b[^>]*id="contact-name"[^>]*name="name"[^>]*type="text"[^>]*required[^>]*autocomplete="name"/,
      );
      expect(html).toMatch(
        /<input\b[^>]*id="contact-email"[^>]*name="email"[^>]*type="email"[^>]*required[^>]*autocomplete="email"/,
      );
      expect(html).toMatch(
        /<textarea\b[^>]*id="contact-message"[^>]*name="message"[^>]*required/,
      );
    });

    it(`renders the Turnstile widget with the site key (${locale})`, async () => {
      const html = await render(locale);
      expect(html).toMatch(
        /<div\b[^>]*class="cf-turnstile"[^>]*data-sitekey="/,
      );
    });

    it(`renders the privacy notice and the aria-live status region (${locale})`, async () => {
      const html = await render(locale);
      expect(html).toContain(t(locale, "contactPrivacy"));
      expect(html).toMatch(/<p\b[^>]*aria-live="polite"/);
    });
  }

  it("falls back to the Cloudflare test site key when the env var is unset", async () => {
    vi.stubEnv("PUBLIC_TURNSTILE_SITE_KEY", undefined);
    const html = await render("es");
    expect(html).toContain(`data-sitekey="${FALLBACK_SITE_KEY}"`);
  });

  it("uses the configured site key when the env var is set", async () => {
    vi.stubEnv("PUBLIC_TURNSTILE_SITE_KEY", "configured-site-key");
    const html = await render("es");
    expect(html).toContain(`data-sitekey="configured-site-key"`);
  });
});
