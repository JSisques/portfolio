import { z } from "astro/zod";
import { locales, type Locale } from "../i18n/locales.js";

// ADR-0029: one source for the site and the CV; each entry declares where it
// is shown.
export const visibilitySchema = z.enum(["site", "cv", "both"]);
export type Visibility = z.infer<typeof visibilitySchema>;

export function isVisibleOnSite(visibility: Visibility): boolean {
  return visibility !== "cv";
}

// DESIGN.md: margin notes always link to something real (an ADR, a pull
// request, a repository), so only absolute https URLs are accepted.
export const marginNoteSchema = z.object({
  label: z.string().min(1),
  href: z.url({ protocol: /^https$/ }),
});
export type MarginNote = z.infer<typeof marginNoteSchema>;

const entryBase = {
  locale: z.enum(locales),
  visibility: visibilitySchema,
  notes: z.array(marginNoteSchema).default([]),
};

export const aboutSchema = z.object({
  ...entryBase,
  summary: z.string().min(1),
  stack: z.string().min(1),
  workingStyle: z.string().min(1),
});
export type About = z.infer<typeof aboutSchema>;

export const experienceSchema = z.object({
  ...entryBase,
  order: z.number().int(),
  role: z.string().min(1),
  company: z.string().min(1),
  period: z.string().min(1),
  responsibilities: z.array(z.string().min(1)).min(1),
  impact: z.array(z.string().min(1)).min(1),
});
export type Experience = z.infer<typeof experienceSchema>;

interface LocalizedEntry {
  data: { locale: Locale; visibility: Visibility };
}

export function siteEntries<T extends LocalizedEntry>(
  entries: T[],
  locale: Locale,
): T[] {
  return entries.filter(
    (e) => e.data.locale === locale && isVisibleOnSite(e.data.visibility),
  );
}
