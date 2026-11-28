import { describe, expect, it } from "vitest";
import {
  experimental_AstroContainer as AstroContainer,
  type ContainerRenderOptions,
} from "astro/container";

// The about section is presentational: the page hands in the visible entry
// (L3 in the task doc), and the section only renders it.
import AboutSection from "../../src/components/AboutSection.astro";
import type { About, MarginNote } from "../../src/content/schemas.js";
import { locales, type Locale } from "../../src/i18n/locales.js";
import { t } from "../../src/i18n/ui.js";

const ADR =
  "https://github.com/JSisques/portfolio/blob/main/docs/adr/0004-astro-as-web-framework.md";
const REPO = "https://github.com/JSisques/portfolio";

async function render(locale: Locale, about: About) {
  const container = await AstroContainer.create();
  const renderToString = container.renderToString.bind(container) as (
    component: unknown,
    options?: ContainerRenderOptions,
  ) => Promise<string>;
  return renderToString(AboutSection, { props: { locale, about } });
}

function fixture(locale: Locale, notes: MarginNote[]): About {
  return {
    locale,
    visibility: "site",
    summary: "Summary text.",
    stack: "Stack text.",
    workingStyle: "Working style text.",
    notes,
  };
}

describe("about section", () => {
  for (const locale of locales) {
    it(`labels the section from its heading (${locale})`, async () => {
      const html = await render(locale, fixture(locale, []));
      expect(html).toMatch(/<section\b[^>]*id="about"/);
      expect(html).toMatch(/<section\b[^>]*aria-labelledby="about-heading"/);
      expect(html).toMatch(
        new RegExp(
          `<h2\\b[^>]*id="about-heading"[^>]*>${t(locale, "aboutHeading")}</h2>`,
        ),
      );
    });

    it(`renders summary, stack and working style from props (${locale})`, async () => {
      const about = fixture(locale, []);
      const html = await render(locale, about);
      for (const text of [about.summary, about.stack, about.workingStyle]) {
        expect(html).toMatch(new RegExp(`<p\\b[^>]*>[^<]*${text}</p>`));
      }
    });

    it(`links each margin note to its target (${locale})`, async () => {
      const notes: MarginNote[] = [
        { label: "Why Astro: ADR-0004", href: ADR },
        { label: "Repository", href: REPO },
      ];
      const html = await render(locale, fixture(locale, notes));
      for (const note of notes) {
        expect(html).toMatch(
          new RegExp(`<a\\b[^>]*href="${note.href}"[^>]*>${note.label}</a>`),
        );
      }
    });

    it(`renders no margin notes block without notes (${locale})`, async () => {
      const html = await render(locale, fixture(locale, []));
      expect(html).not.toMatch(/data-margin-notes/);
    });
  }
});
