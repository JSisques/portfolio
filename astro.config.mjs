// @ts-check
import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { securityHeadersIntegration } from "./src/security/integration.ts";

// ADR-0026: locale-prefixed routes, Spanish is the default locale.
export default defineConfig({
  site: "https://jsisques.net",
  // ADR-0035: pages stay prerendered (static output); the adapter serves the
  // on-demand contact endpoint from the Worker (ADR-0007). Prerendering runs
  // in Node, not workerd, so the build keeps reading `process.env` and the
  // filesystem (GitHub data and its fixture seam, ADR-0036).
  // The site has no `astro:assets` images and no sessions, so no Images or
  // KV binding is added to the Worker or provisioned on deploy.
  adapter: cloudflare({
    prerenderEnvironment: "node",
    imageService: "passthrough",
  }),
  session: false,
  i18n: {
    locales: ["es", "en"],
    defaultLocale: "es",
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false,
    },
  },
  // ADR-0033: security headers and the strict CSP on every response.
  integrations: [securityHeadersIntegration()],
  vite: {
    plugins: [tailwindcss()],
    // Astro inlines small bundled scripts and styles, which the hash-only
    // CSP would block. With inlining off, the only inline script is the
    // hashed theme script.
    build: { assetsInlineLimit: 0 },
  },
});
