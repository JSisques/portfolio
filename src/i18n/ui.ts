import type { Locale } from "./locales.js";

interface UiStrings {
  siteDescription: string;
  skipLink: string;
  languageSwitcher: string;
  navLabel: string;
  themeToggle: string;
  aboutHeading: string;
  experienceHeading: string;
  responsibilitiesHeading: string;
  impactHeading: string;
  projectsHeading: string;
  projectStoryHeading: string;
  projectLanguage: string;
  projectStars: string;
  projectUpdated: string;
  projectRepositoryLink: string;
  projectHomepageLink: string;
}

const es: UiStrings = {
  siteDescription: "Web personal y portfolio de Javier Plaza Sisqués.",
  skipLink: "Saltar al contenido",
  languageSwitcher: "English",
  navLabel: "Principal",
  themeToggle: "Tema oscuro",
  aboutHeading: "Sobre mí",
  experienceHeading: "Experiencia",
  responsibilitiesHeading: "Responsabilidades",
  impactHeading: "Impacto",
  projectsHeading: "Proyectos",
  projectStoryHeading: "Cómo se construyó",
  projectLanguage: "Lenguaje",
  projectStars: "Estrellas",
  projectUpdated: "Última actualización",
  projectRepositoryLink: "Repositorio",
  projectHomepageLink: "Sitio web",
};

const en: UiStrings = {
  siteDescription: "Personal website and portfolio of Javier Plaza Sisqués.",
  skipLink: "Skip to content",
  languageSwitcher: "Español",
  navLabel: "Main",
  themeToggle: "Dark theme",
  aboutHeading: "About me",
  experienceHeading: "Experience",
  responsibilitiesHeading: "Responsibilities",
  impactHeading: "Impact",
  projectsHeading: "Projects",
  projectStoryHeading: "How it was built",
  projectLanguage: "Language",
  projectStars: "Stars",
  projectUpdated: "Last update",
  projectRepositoryLink: "Repository",
  projectHomepageLink: "Website",
};

export const ui: Record<Locale, UiStrings> = { es, en };

export type UiKey = keyof UiStrings;

export function t(locale: Locale, key: UiKey): string {
  return ui[locale][key];
}
