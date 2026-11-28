import type { Locale } from "../i18n/locales.js";
import type { ProjectNarrative } from "../content/schemas.js";
import type { Project, RepositoryData } from "./types.js";

// ADR-0036: a featured repository without a narrative in the locale or
// without GitHub data fails the build; the message names the repository.
export function buildProjects(
  featured: readonly string[],
  narratives: readonly ProjectNarrative[],
  github: Readonly<Record<string, RepositoryData>>,
  locale: Locale,
): Project[] {
  return featured.map((repository) => {
    const narrative = narratives.find(
      (entry) => entry.repository === repository && entry.locale === locale,
    );
    if (!narrative) {
      throw new Error(
        `Project narrative for ${repository} is missing in locale ${locale}`,
      );
    }
    const data = github[repository];
    if (!data) {
      throw new Error(`GitHub data for ${repository} is missing`);
    }
    return {
      repository,
      title: narrative.title,
      summary: narrative.summary,
      story: narrative.story,
      notes: [...narrative.notes],
      github: { ...data },
    };
  });
}
