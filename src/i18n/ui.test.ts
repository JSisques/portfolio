import { describe, expect, it } from "vitest";
import { defaultLocale, locales } from "./locales.js";
import { t, ui } from "./ui.js";

describe("ui strings", () => {
  it("keeps identical keys in every locale", () => {
    const esKeys = Object.keys(ui.es).sort();
    for (const locale of locales) {
      expect(Object.keys(ui[locale]).sort()).toEqual(esKeys);
    }
  });

  it("has no empty strings", () => {
    for (const locale of locales) {
      for (const [key, value] of Object.entries(ui[locale])) {
        expect(value.trim(), `${locale}.${key}`).not.toHaveLength(0);
      }
    }
  });

  it("labels the language switcher in the target language", () => {
    expect(t("es", "languageSwitcher")).toBe("English");
    expect(t("en", "languageSwitcher")).toBe("Español");
  });

  it("uses Spanish as the default locale", () => {
    expect(defaultLocale).toBe("es");
  });
});
