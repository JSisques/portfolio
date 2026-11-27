import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { AstroIntegration } from "astro";
import { securityHeaders, toCloudflareHeaders } from "./headers.js";

// ADR-0033 (S3): applies the headers defined in headers.ts to both targets.

// Cloudflare Workers static assets read `_headers` from the assets directory
// (ADR-0035, https://developers.cloudflare.com/workers/static-assets/headers/).
export async function writeCloudflareHeaders(outDir: string): Promise<void> {
  await writeFile(
    join(outDir, "_headers"),
    toCloudflareHeaders(securityHeaders),
    "utf8",
  );
}

export function securityHeadersIntegration(): AstroIntegration {
  return {
    name: "security-headers",
    hooks: {
      // Node target: `astro preview` serves `server.headers`. Dev is skipped:
      // Vite injects inline styles and HMR scripts the strict CSP would block.
      "astro:config:setup": ({ command, updateConfig }) => {
        if (command === "preview") {
          updateConfig({ server: { headers: { ...securityHeaders } } });
        }
      },
      "astro:build:done": async ({ dir }) => {
        await writeCloudflareHeaders(fileURLToPath(dir));
      },
    },
  };
}
