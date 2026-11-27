import { defaultLocale, isLocale, locales, type Locale } from "./locales.js";

export function getLocaleFromPath(pathname: string): Locale {
  const first = pathname.split("/").filter(Boolean)[0];
  return first !== undefined && isLocale(first) ? first : defaultLocale;
}

export function localizePath(pathname: string, target: Locale): string {
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];
  if (first === undefined) return `/${target}/`;
  if (isLocale(first)) {
    // A locale prefix is swapped; a bare one localizes to the target root.
    if (segments.length === 1) return `/${target}/`;
    segments[0] = target;
  } else {
    // No locale prefix: prefix the target locale instead of dropping a segment.
    segments.unshift(target);
  }
  return `/${segments.join("/")}`;
}

export interface AlternateLink {
  hreflang: string;
  href: string;
}

// ADR-0026: one alternate per locale plus x-default, always the Spanish page.
export function alternateLinks(
  pathname: string,
  site: string,
): AlternateLink[] {
  return [
    ...locales.map((locale) => ({
      hreflang: locale,
      href: new URL(localizePath(pathname, locale), site).href,
    })),
    {
      hreflang: "x-default",
      href: new URL(localizePath(pathname, defaultLocale), site).href,
    },
  ];
}
