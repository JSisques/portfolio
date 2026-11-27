import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { contrastRatio } from "./contrast";

const THEMES = ["light", "dark"] as const;
const ROLES = [
  "background",
  "surface",
  "body",
  "heading",
  "accent",
  "on-accent",
] as const;

type Theme = (typeof THEMES)[number];
type Role = (typeof ROLES)[number];

/** Foreground/background pairs that must meet WCAG 2 AA (4.5:1). */
const PAIRS: ReadonlyArray<readonly [Role, Role]> = [
  ["body", "background"],
  ["heading", "background"],
  ["accent", "background"],
  ["body", "surface"],
  ["accent", "surface"],
  ["on-accent", "accent"],
];

const MIN_RATIO = 4.5;

function readThemeTokens(): Record<Theme, Partial<Record<Role, string>>> {
  const css = readFileSync(
    fileURLToPath(new URL("./global.css", import.meta.url)),
    "utf8",
  );
  const tokens: Record<Theme, Partial<Record<Role, string>>> = {
    light: {},
    dark: {},
  };
  const pattern = /--(light|dark)-([a-z][a-z-]*):\s*(#[0-9a-f]{6})\b/gi;
  for (const match of css.matchAll(pattern)) {
    const theme = match[1] as Theme;
    const role = match[2] as Role;
    const hex = match[3];
    if (THEMES.includes(theme) && ROLES.includes(role) && hex !== undefined) {
      tokens[theme][role] = hex.toLowerCase();
    }
  }
  return tokens;
}

describe("DESIGN.md palette contrast (WCAG 2 AA)", () => {
  const tokens = readThemeTokens();

  it("defines all six roles for both themes in global.css", () => {
    for (const theme of THEMES) {
      for (const role of ROLES) {
        expect(tokens[theme][role], `--${theme}-${role} is missing`).toMatch(
          /^#[0-9a-f]{6}$/,
        );
      }
    }
  });

  for (const theme of THEMES) {
    it(`${theme} theme pairs meet a 4.5:1 contrast ratio`, () => {
      for (const [foreground, background] of PAIRS) {
        const fg = tokens[theme][foreground];
        const bg = tokens[theme][background];
        expect(fg, `--${theme}-${foreground} is missing`).toBeDefined();
        expect(bg, `--${theme}-${background} is missing`).toBeDefined();
        const ratio = contrastRatio(fg as string, bg as string);
        expect(
          ratio,
          `${theme} ${foreground}/${background} is ${ratio.toFixed(2)}`,
        ).toBeGreaterThanOrEqual(MIN_RATIO);
      }
    });
  }
});
