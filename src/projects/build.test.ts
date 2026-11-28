import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { locales } from "../i18n/locales.js";
import type { ProjectNarrative } from "../content/schemas.js";
import { buildProjects } from "./build.js";
import { featuredRepositories } from "./featured.js";
import type { RepositoryData } from "./types.js";

const portfolio: RepositoryData = {
  fullName: "JSisques/portfolio",
  language: "TypeScript",
  stars: 3,
  updatedAt: "2026-11-28T08:00:00Z",
  url: "https://github.com/JSisques/portfolio",
  homepage: null,
};

const radar: RepositoryData = {
  fullName: "JSisques/agent-radar",
  language: null,
  stars: 0,
  updatedAt: "2026-11-28T08:00:00Z",
  url: "https://github.com/JSisques/agent-radar",
  homepage: null,
};

const githubData: Record<string, RepositoryData> = {
  "JSisques/portfolio": portfolio,
  "JSisques/agent-radar": radar,
};

function narrativeFor(
  repository: string,
  locale: (typeof locales)[number],
): ProjectNarrative {
  return {
    locale,
    visibility: "both",
    repository,
    title: "title",
    summary: "summary",
    story: "story",
    notes: [],
  };
}

function errorMessage(fn: () => void): string {
  try {
    fn();
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
  return "";
}

describe("buildProjects", () => {
  it("returns one project per featured repository in featured order", () => {
    const narratives = featuredRepositories.map((repository) =>
      narrativeFor(repository, "es"),
    );
    const projects = buildProjects(
      featuredRepositories,
      [...narratives].reverse(),
      githubData,
      "es",
    );
    expect(projects.map((project) => project.repository)).toEqual([
      ...featuredRepositories,
    ]);
  });

  it("combines the narrative of the requested locale with the GitHub data", () => {
    const narratives = [
      narrativeFor(featuredRepositories[0], "es"),
      {
        ...narrativeFor(featuredRepositories[0], "en"),
        title: "English title",
      },
    ];
    const [project] = buildProjects(
      [featuredRepositories[0]],
      narratives,
      githubData,
      "en",
    );
    expect(project?.title).toBe("English title");
    expect(project?.github).toEqual(portfolio);
  });

  it("ignores narratives for non-featured repositories", () => {
    const narratives = [
      ...featuredRepositories.map((repository) =>
        narrativeFor(repository, "es"),
      ),
      narrativeFor("JSisques/other", "es"),
    ];
    const projects = buildProjects(
      featuredRepositories,
      narratives,
      githubData,
      "es",
    );
    expect(projects.map((project) => project.repository)).toEqual([
      ...featuredRepositories,
    ]);
  });

  it("throws naming the repository and locale when the narrative is missing", () => {
    const repository = featuredRepositories[0];
    const narratives = [narrativeFor(featuredRepositories[1], "es")];
    const message = errorMessage(() =>
      buildProjects(featuredRepositories, narratives, githubData, "es"),
    );
    expect(message).toContain(repository);
    expect(message).toContain("es");
  });

  it("throws naming the repository when the GitHub data is missing", () => {
    const repository = featuredRepositories[1];
    const data: Record<string, RepositoryData> = {
      [featuredRepositories[0]]: portfolio,
    };
    const narratives = featuredRepositories.map((name) =>
      narrativeFor(name, "es"),
    );
    const message = errorMessage(() =>
      buildProjects(featuredRepositories, narratives, data, "es"),
    );
    expect(message).toContain(repository);
  });

  it("does not mutate its inputs", () => {
    const narratives = featuredRepositories.map((repository) =>
      narrativeFor(repository, "es"),
    );
    const snapshot = structuredClone(narratives);
    const projects = buildProjects(
      featuredRepositories,
      narratives,
      githubData,
      "es",
    );
    for (const project of projects) {
      project.notes.push({ label: "x", href: "https://example.com" });
      project.github.stars = 99;
    }
    expect(narratives).toEqual(snapshot);
    expect(portfolio.stars).toBe(3);
    expect(radar.stars).toBe(0);
  });
});

describe("placeholder narratives", () => {
  it("covers every featured repository in every locale", () => {
    const projectsDir = fileURLToPath(
      new URL("../content/projects/", import.meta.url),
    );
    for (const locale of locales) {
      for (const repository of featuredRepositories) {
        const name = repository.split("/").at(-1) as string;
        const text = readFileSync(
          path.join(projectsDir, locale, `${name}.yaml`),
          "utf8",
        );
        const lines = text.split(/\r?\n/).map((line) => line.trim());
        expect(lines).toContain(`repository: "${repository}"`);
      }
    }
  });
});
