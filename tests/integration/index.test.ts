import { describe, it, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";

// ADR-0015: integration test - renders a page via the Astro Container API
// and asserts behavior, not static copy.

import Page from "../../src/pages/index.astro";

describe("index page", () => {
  it("renders with the default locale (Spanish)", async () => {
    const container = await AstroContainer.create();
    // ADR-0003: the default locale is Spanish
    const html = await container.renderToString(Page);
    expect(html).toMatch(/<html\b[^>]*\blang="es"/);
  });
});
