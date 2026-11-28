import { describe, it, expect } from "vitest";
import {
  experimental_AstroContainer as AstroContainer,
  type ContainerRenderOptions,
} from "astro/container";

// DESIGN.md: the projects section is a list of comparable entries on the
// secondary surface — local narrative plus GitHub facts, with the margin
// notes motif next to each entry.

import ProjectsSection from "../../src/components/ProjectsSection.astro";
import type { Project } from "../../src/projects/types.js";
import { locales } from "../../src/i18n/locales.js";
import { t } from "../../src/i18n/ui.js";
import type { MarginNote } from "../../src/content/schemas.js";

const ADR =
  "https://github.com/JSisques/portfolio/blob/main/docs/adr/0004-astro-as-web-framework.md";

async function render(props: Record<string, unknown>) {
  const container = await AstroContainer.create();
  const renderToString = container.renderToString.bind(container) as (
    component: unknown,
    options?: ContainerRenderOptions,
  ) => Promise<string>;
  return renderToString(ProjectsSection, { props });
}

function github(overrides: Partial<Project["github"]> = {}): Project["github"] {
  return {
    fullName: "JSisques/portfolio",
    language: "TypeScript",
    stars: 12,
    updatedAt: "2026-11-01T10:00:00Z",
    url: "https://github.com/JSisques/portfolio",
    homepage: "https://jsisques.net",
    ...overrides,
  };
}

function project(overrides: Partial<Project> = {}): Project {
  return {
    repository: "JSisques/portfolio",
    title: "Portfolio",
    summary: "This personal website and portfolio.",
    story: "It started as a weekend experiment and grew into a portfolio.",
    notes: [],
    github: github(),
    ...overrides,
  };
}

function links(html: string): string[] {
  return html.match(/<a\b[^>]*>[\s\S]*?<\/a>/g) ?? [];
}

describe("projects section", () => {
  it.each(locales)(
    "is labelled with the localized headings in %s",
    async (locale) => {
      const html = await render({ locale, projects: [project()] });
      expect(html).toMatch(/<section\b[^>]*id="projects"/);
      expect(html).toMatch(/aria-labelledby="projects-heading"/);
      expect(html).toMatch(
        new RegExp(
          `<h2\\b[^>]*id="projects-heading"[^>]*>${t(locale, "projectsHeading")}</h2>`,
        ),
      );
      expect(html).toContain(t(locale, "projectStoryHeading"));
      expect(html).toContain(t(locale, "projectLanguage"));
      expect(html).toContain(t(locale, "projectStars"));
      expect(html).toContain(t(locale, "projectUpdated"));
      expect(html).toContain(t(locale, "projectRepositoryLink"));
      expect(html).toContain(t(locale, "projectHomepageLink"));
    },
  );

  it("renders every narrative and GitHub field passed for each project", async () => {
    const project: Project = {
      repository: "JSisques/agent-radar",
      title: "Agent Radar",
      summary: "A dashboard for following AI agent activity.",
      story: "It began as a script to follow a few models.",
      notes: [],
      github: {
        fullName: "JSisques/agent-radar",
        language: "Go",
        stars: 7,
        updatedAt: "2026-10-15T08:30:00Z",
        url: "https://github.com/JSisques/agent-radar",
        homepage: "https://agent-radar.example",
      },
    };
    const html = await render({ locale: "es", projects: [project] });
    for (const text of [
      project.title,
      project.summary,
      project.story,
      project.github.language,
      `<time datetime="${project.github.updatedAt}">`,
      `href="${project.github.url}"`,
      `href="${project.github.homepage}"`,
    ]) {
      expect(html).toContain(text);
    }
    expect(html).toContain(`<dd>${project.github.stars}</dd>`);
  });

  it.each(locales)(
    "renders the last update as a <time> with the localized UTC date in %s",
    async (locale) => {
      const updatedAt = "2026-11-01T10:00:00Z";
      const expected = new Intl.DateTimeFormat(locale, {
        dateStyle: "long",
        timeZone: "UTC",
      }).format(new Date(updatedAt));
      const html = await render({
        locale,
        projects: [project({ github: github({ updatedAt }) })],
      });
      expect(html).toContain(
        `<time datetime="${updatedAt}">${expected}</time>`,
      );
    },
  );

  it.each(locales)(
    "omits the language row when GitHub detects none in %s",
    async (locale) => {
      const html = await render({
        locale,
        projects: [project({ github: github({ language: null }) })],
      });
      expect(html).not.toContain(t(locale, "projectLanguage"));
    },
  );

  it("links the repository always and the homepage only when GitHub has one", async () => {
    const withHomepage = project();
    const htmlWith = await render({ locale: "es", projects: [withHomepage] });
    const homeLink = links(htmlWith).find((anchor) =>
      anchor.includes(`href="${withHomepage.github.homepage}"`),
    );
    expect(homeLink).toBeDefined();
    expect(homeLink).toContain(t("es", "projectHomepageLink"));

    const withoutHomepage = project({ github: github({ homepage: null }) });
    const htmlWithout = await render({
      locale: "es",
      projects: [withoutHomepage],
    });
    expect(
      links(htmlWithout).some((anchor) =>
        anchor.includes(`href="${withoutHomepage.github.url}"`),
      ),
    ).toBe(true);
    expect(
      links(htmlWithout).some((anchor) =>
        anchor.includes(`href="${withoutHomepage.github.homepage}"`),
      ),
    ).toBe(false);
    expect(htmlWithout).not.toContain(t("es", "projectHomepageLink"));
  });

  it("renders projects in the given order without mutating them", async () => {
    const first = project({ title: "First project" });
    const second = project({
      title: "Second project",
      github: github({ url: "https://github.com/JSisques/second" }),
    });
    const third = project({
      title: "Third project",
      github: github({ url: "https://github.com/JSisques/third" }),
    });
    const projects = [third, first, second];
    const html = await render({ locale: "es", projects });
    const position = (title: string) => html.indexOf(`>${title}</h3>`);
    expect(position("Third project")).toBeGreaterThanOrEqual(0);
    expect(position("Third project")).toBeLessThan(position("First project"));
    expect(position("First project")).toBeLessThan(position("Second project"));
    expect(projects.map((p) => p.title)).toEqual([
      "Third project",
      "First project",
      "Second project",
    ]);
  });

  it("gives each link an accessible name that includes the project title", async () => {
    const a = project();
    const b = project({
      title: "Agent Radar",
      github: github({
        fullName: "JSisques/agent-radar",
        url: "https://github.com/JSisques/agent-radar",
        homepage: null,
      }),
    });
    const html = await render({ locale: "es", projects: [a, b] });
    for (const p of [a, b]) {
      const link = links(html).find((anchor) =>
        anchor.includes(`href="${p.github.url}"`),
      );
      expect(link).toBeDefined();
      expect(link).toContain("sr-only");
      expect(link).toContain(p.title);
    }
  });

  it("links each note to its target", async () => {
    const notes: MarginNote[] = [
      { label: "Why Astro: ADR-0004", href: ADR },
      {
        label: "Why pnpm: ADR-0009",
        href: "https://github.com/JSisques/portfolio",
      },
    ];
    const html = await render({ locale: "es", projects: [project({ notes })] });
    expect(html).toMatch(/data-margin-notes/);
    for (const note of notes) {
      expect(html).toMatch(
        new RegExp(`<a\\b[^>]*href="${note.href}"[^>]*>${note.label}</a>`),
      );
    }
  });

  it("renders no margin notes block for a project without notes", async () => {
    const html = await render({
      locale: "es",
      projects: [project({ notes: [] })],
    });
    expect(html).not.toMatch(/data-margin-notes/);
  });

  it("renders nothing without projects", async () => {
    const html = await render({ locale: "es", projects: [] });
    expect(html.trim()).toBe("");
  });
});
