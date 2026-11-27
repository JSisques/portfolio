import { describe, it, expect } from "vitest";
import {
  experimental_AstroContainer as AstroContainer,
  type ContainerRenderOptions,
} from "astro/container";

// ADR-0015: integration test - renders via the Astro Container API and
// asserts behavior, not static copy.
//
// ADR-0033: the inline theme script must ship byte-for-byte as `themeScript`,
// so the sha256 hash in the CSP (S2) is the hash the browser computes.

import ThemeScript from "../../src/components/ThemeScript.astro";
import {
  scriptHash,
  securityHeaders,
  themeScript,
} from "../../src/security/headers.js";

const SITE = "https://jsisques.net";

async function renderThemeScript() {
  const container = await AstroContainer.create({
    astroConfig: { site: SITE },
  });
  // The container types .astro imports as a generic factory; widen the
  // argument to match the renderToString call site.
  const render = container.renderToString.bind(container) as (
    page: unknown,
    options?: ContainerRenderOptions,
  ) => Promise<string>;
  return render(ThemeScript, {
    request: new Request(`${SITE}/es/`),
  });
}

describe("inline theme script and CSP", () => {
  it("renders the inline script as the exported themeScript", async () => {
    const html = await renderThemeScript();
    expect(html).toContain(`<script>${themeScript}</script>`);
  });

  it("covers the shipped script bytes with the CSP script-src hash", async () => {
    const html = await renderThemeScript();
    // The component renders exactly one script element; slice its text.
    const open = "<script>";
    const start = html.indexOf(open) + open.length;
    const shipped = html.slice(start, html.indexOf("</script>", start));
    const csp = securityHeaders["Content-Security-Policy"] ?? "";
    expect(csp).toContain(`script-src 'self' ${scriptHash(shipped)}`);
  });
});
