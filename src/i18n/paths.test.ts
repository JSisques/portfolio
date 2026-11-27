import { describe, expect, it } from "vitest";
import { alternateLinks, getLocaleFromPath, localizePath } from "./paths.js";

const SITE = "https://jsisques.net";

describe("getLocaleFromPath", () => {
  it("returns the locale from the first path segment", () => {
    expect(getLocaleFromPath("/es/")).toBe("es");
    expect(getLocaleFromPath("/en/projects")).toBe("en");
  });

  it("falls back to the default locale for unprefixed or unknown prefixes", () => {
    expect(getLocaleFromPath("/")).toBe("es");
    expect(getLocaleFromPath("/projects/foo")).toBe("es");
    expect(getLocaleFromPath("/fr/")).toBe("es");
  });
});

describe("localizePath", () => {
  it("swaps the locale prefix of nested paths", () => {
    expect(localizePath("/es/projects/foo", "en")).toBe("/en/projects/foo");
    expect(localizePath("/en/projects/foo", "es")).toBe("/es/projects/foo");
  });

  it("keeps the localized root canonical with a trailing slash", () => {
    expect(localizePath("/es/", "en")).toBe("/en/");
    expect(localizePath("/es", "en")).toBe("/en/");
  });

  it("prefixes the target locale when there is no locale prefix", () => {
    expect(localizePath("/", "en")).toBe("/en/");
    expect(localizePath("/projects/foo", "en")).toBe("/en/projects/foo");
    // A segment that is not a served locale is content, not a locale slot.
    expect(localizePath("/fr/projects", "en")).toBe("/en/fr/projects");
  });
});

describe("alternateLinks", () => {
  it("returns es, en and x-default absolute URLs for a localized root", () => {
    expect(alternateLinks("/es/", SITE)).toEqual([
      { hreflang: "es", href: "https://jsisques.net/es/" },
      { hreflang: "en", href: "https://jsisques.net/en/" },
      { hreflang: "x-default", href: "https://jsisques.net/es/" },
    ]);
  });

  it("keeps the path when computing alternates and points x-default at Spanish", () => {
    expect(alternateLinks("/en/projects/foo", SITE)).toEqual([
      { hreflang: "es", href: "https://jsisques.net/es/projects/foo" },
      { hreflang: "en", href: "https://jsisques.net/en/projects/foo" },
      { hreflang: "x-default", href: "https://jsisques.net/es/projects/foo" },
    ]);
  });
});
