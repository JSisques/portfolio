// @ts-check
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { securityHeadersIntegration } from "./src/security/integration.ts";

// ADR-0026: locale-prefixed routes, Spanish is the default locale.
export default defineConfig({
  site: "https://jsisques.net",
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
