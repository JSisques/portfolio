import { describe, it, expect } from "vitest";
import {
  aboutSchema,
  experienceSchema,
  isVisibleOnSite,
  marginNoteSchema,
  projectSchema,
  siteEntries,
} from "./schemas.js";

// ADR-0029: entries are written once for the site and the CV and declare
// where they are shown.

const about = {
  locale: "es",
  visibility: "both",
  summary: "[REAL DATA]",
  stack: "[REAL DATA]",
  workingStyle: "[REAL DATA]",
};

const experience = {
  locale: "en",
  visibility: "site",
  order: 1,
  role: "[REAL DATA]",
  company: "[REAL DATA]",
  period: "[REAL DATA]",
  responsibilities: ["[REAL DATA]"],
  impact: ["[REAL DATA]"],
};

describe("visibility", () => {
  it.each([
    ["site", true],
    ["both", true],
    ["cv", false],
  ] as const)("shows %s entries on the site: %s", (visibility, expected) => {
    expect(isVisibleOnSite(visibility)).toBe(expected);
  });

  it("rejects an unknown visibility", () => {
    expect(aboutSchema.safeParse({ ...about, visibility: "web" }).success).toBe(
      false,
    );
  });
});

describe("locale", () => {
  it("rejects a locale the site does not serve", () => {
    expect(aboutSchema.safeParse({ ...about, locale: "fr" }).success).toBe(
      false,
    );
  });
});

describe("margin notes", () => {
  it("accepts an https link to a real artifact", () => {
    const note = {
      label: "ADR-0004",
      href: "https://github.com/JSisques/portfolio/blob/main/docs/adr/0004-astro-as-web-framework.md",
    };
    expect(marginNoteSchema.safeParse(note).success).toBe(true);
  });

  it.each(["#about", "/es/", "http://example.com", "javascript:alert(1)"])(
    "rejects %s as a target",
    (href) => {
      expect(marginNoteSchema.safeParse({ label: "x", href }).success).toBe(
        false,
      );
    },
  );

  it("defaults to no notes", () => {
    expect(aboutSchema.parse(about).notes).toEqual([]);
    expect(experienceSchema.parse(experience).notes).toEqual([]);
  });
});

describe("experience", () => {
  it.each(["responsibilities", "impact"] as const)(
    "requires at least one %s item",
    (field) => {
      expect(
        experienceSchema.safeParse({ ...experience, [field]: [] }).success,
      ).toBe(false);
    },
  );
});

describe("project", () => {
  const project = {
    locale: "es",
    visibility: "both",
    repository: "JSisques/portfolio",
    title: "[REAL DATA]",
    summary: "[REAL DATA]",
    story: "[REAL DATA]",
  };

  it("accepts a valid entry and defaults notes to []", () => {
    const parsed = projectSchema.parse(project);
    expect(parsed.notes).toEqual([]);
    expect(parsed.repository).toBe("JSisques/portfolio");
  });

  it.each(["no-slash", "owner/", "/name", "owner/name/extra", "owner/na me"])(
    "rejects a malformed repository %s",
    (repository) => {
      expect(projectSchema.safeParse({ ...project, repository }).success).toBe(
        false,
      );
    },
  );

  it.each(["title", "summary", "story"] as const)(
    "rejects an empty %s",
    (field) => {
      expect(projectSchema.safeParse({ ...project, [field]: "" }).success).toBe(
        false,
      );
    },
  );
});

describe("siteEntries", () => {
  const entry = (id: string, locale: string, visibility: string) => ({
    id,
    data: { locale, visibility } as {
      locale: "es" | "en";
      visibility: "site" | "cv" | "both";
    },
  });

  it("keeps the site-visible entries of one locale", () => {
    const entries = [
      entry("a", "es", "site"),
      entry("b", "es", "cv"),
      entry("c", "es", "both"),
      entry("d", "en", "site"),
    ];
    expect(siteEntries(entries, "es").map((e) => e.id)).toEqual(["a", "c"]);
  });
});
