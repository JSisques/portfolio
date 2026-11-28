import { describe, it, expect } from "vitest";
import {
  experimental_AstroContainer as AstroContainer,
  type ContainerRenderOptions,
} from "astro/container";

// DESIGN.md identity motif: margin notes link to the real decisions behind
// the text they annotate.

import MarginNotes from "../../src/components/MarginNotes.astro";

const ADR =
  "https://github.com/JSisques/portfolio/blob/main/docs/adr/0004-astro-as-web-framework.md";

async function render(props: Record<string, unknown>) {
  const container = await AstroContainer.create();
  const renderToString = container.renderToString.bind(container) as (
    component: unknown,
    options?: ContainerRenderOptions,
  ) => Promise<string>;
  return renderToString(MarginNotes, { props });
}

describe("margin notes", () => {
  it("links each note to its target", async () => {
    const html = await render({
      notes: [
        { label: "Why Astro: ADR-0004", href: ADR },
        { label: "Second", href: "https://github.com/JSisques/portfolio" },
      ],
    });
    expect(html).toMatch(
      new RegExp(`<a\\b[^>]*href="${ADR}"[^>]*>Why Astro: ADR-0004</a>`),
    );
    expect(html).toMatch(
      /<a\b[^>]*href="https:\/\/github.com\/JSisques\/portfolio"[^>]*>Second<\/a>/,
    );
  });

  it("marks the notes so the layout can place them", async () => {
    const html = await render({ notes: [{ label: "x", href: ADR }] });
    expect(html).toMatch(/<aside\b[^>]*data-margin-notes/);
  });

  it("renders nothing without notes", async () => {
    const html = await render({ notes: [] });
    expect(html.trim()).toBe("");
  });
});
