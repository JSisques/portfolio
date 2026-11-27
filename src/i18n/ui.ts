import type { Locale } from "./locales.js";

interface UiStrings {
  siteDescription: string;
  skipLink: string;
  languageSwitcher: string;
  navLabel: string;
}

const es: UiStrings = {
  siteDescription: "Web personal y portfolio de Javier Plaza Sisqués.",
  skipLink: "Saltar al contenido",
  languageSwitcher: "English",
  navLabel: "Principal",
};

const en: UiStrings = {
  siteDescription: "Personal website and portfolio of Javier Plaza Sisqués.",
  skipLink: "Skip to content",
  languageSwitcher: "Español",
  navLabel: "Main",
};

export const ui: Record<Locale, UiStrings> = { es, en };

export type UiKey = keyof UiStrings;

export function t(locale: Locale, key: UiKey): string {
  return ui[locale][key];
}
