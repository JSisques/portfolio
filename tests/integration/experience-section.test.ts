import { describe, it, expect } from "vitest";
import {
  experimental_AstroContainer as AstroContainer,
  type ContainerRenderOptions,
} from "astro/container";

// DESIGN.md: the experience section is the timeline — roles, responsibilities,
// and impact — with the margin notes motif next to each role.

import ExperienceSection from "../../src/components/ExperienceSection.astro";
import type { Experience, MarginNote } from "../../src/content/schemas.js";
import { locales } from "../../src/i18n/locales.js";
import { t } from "../../src/i18n/ui.js";

const ADR =
  "https://github.com/JSisques/portfolio/blob/main/docs/adr/0004-astro-as-web-framework.md";

async function render(props: Record<string, unknown>) {
  const container = await AstroContainer.create();
  const renderToString = container.renderToString.bind(container) as (
    component: unknown,
    options?: ContainerRenderOptions,
  ) => Promise<string>;
  return renderToString(ExperienceSection, { props });
}

function entry(overrides: Partial<Experience> = {}): Experience {
  return {
    locale: "es",
    visibility: "site",
    notes: [],
    order: 1,
    role: "Senior software engineer",
    company: "Example Corp",
    period: "2022 – 2024",
    responsibilities: ["Led the platform team"],
    impact: ["Shipped the design system"],
    ...overrides,
  };
}

describe("experience section", () => {
  it.each(locales)(
    "is labelled with the localized headings in %s",
    async (locale) => {
      const html = await render({ locale, entries: [entry({ locale })] });
      expect(html).toMatch(/<section\b[^>]*id="experience"/);
      expect(html).toMatch(/aria-labelledby="experience-heading"/);
      expect(html).toMatch(
        new RegExp(
          `<h2\\b[^>]*id="experience-heading"[^>]*>${t(locale, "experienceHeading")}</h2>`,
        ),
      );
      expect(html).toContain(t(locale, "responsibilitiesHeading"));
      expect(html).toContain(t(locale, "impactHeading"));
    },
  );

  it("renders every field passed for each role", async () => {
    const fields = entry({
      role: "Backend engineer",
      company: "Northwind Traders",
      period: "2021 – 2023",
      responsibilities: [
        "Owned the billing service",
        "Ran the on-call rotation",
      ],
      impact: ["Cut invoice failures in half", "Mentored two junior engineers"],
    });
    const html = await render({ locale: "es", entries: [fields] });
    for (const text of [
      fields.role,
      fields.company,
      fields.period,
      ...fields.responsibilities,
      ...fields.impact,
    ]) {
      expect(html).toContain(text);
    }
  });

  it("renders roles in ascending order without mutating the entries", async () => {
    const first = entry({ order: 1, role: "First role" });
    const second = entry({ order: 2, role: "Second role" });
    const third = entry({ order: 3, role: "Third role" });
    const entries = [third, first, second];
    const html = await render({ locale: "es", entries });
    const position = (e: Experience) => html.indexOf(`>${e.role}</h3>`);
    expect(position(first)).toBeGreaterThanOrEqual(0);
    expect(position(first)).toBeLessThan(position(second));
    expect(position(second)).toBeLessThan(position(third));
    expect(entries.map((e) => e.order)).toEqual([3, 1, 2]);
  });

  it("links each note to its target", async () => {
    const notes: MarginNote[] = [
      { label: "Why Astro: ADR-0004", href: ADR },
      {
        label: "Why pnpm: ADR-0009",
        href: "https://github.com/JSisques/portfolio",
      },
    ];
    const html = await render({ locale: "es", entries: [entry({ notes })] });
    expect(html).toMatch(/data-margin-notes/);
    for (const note of notes) {
      expect(html).toMatch(
        new RegExp(`<a\\b[^>]*href="${note.href}"[^>]*>${note.label}</a>`),
      );
    }
  });

  it("renders no margin notes block for a role without notes", async () => {
    const html = await render({
      locale: "es",
      entries: [entry({ notes: [] })],
    });
    expect(html).not.toMatch(/data-margin-notes/);
  });

  it("renders nothing without entries", async () => {
    const html = await render({ locale: "es", entries: [] });
    expect(html.trim()).toBe("");
  });
});
