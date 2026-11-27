// ADR-0033: the security headers and the strict CSP are defined once here.
// The Cloudflare target renders them to a `_headers` file and the Node
// target applies them to `astro preview`; both consume these exports.
import { createHash } from "node:crypto";

// ADR-0028: the theme is applied before the first paint. The stored "theme"
// choice wins; without a valid one, the system preference decides and dark
// is the fallback. localStorage access is wrapped in try/catch because
// storage can throw (private mode, blocked). This exact source ships inline
// in the document head, so the CSP allows it by hash (see
// contentSecurityPolicy below).
export const themeScript = `(() => {
  let stored = null;
  try {
    stored = localStorage.getItem("theme");
  } catch {
  }
  const theme =
    stored === "light" || stored === "dark"
      ? stored
      : matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark";
  document.documentElement.dataset.theme = theme;
})();`;

// Returns the quoted CSP hash source `'sha256-<base64>'` of a script. The
// quotes are required: unquoted, the browser parses it as a host source.
export function scriptHash(source: string): string {
  const digest = createHash("sha256").update(source, "utf8").digest("base64");
  return `'sha256-${digest}'`;
}

// A strict CSP (S2): self-only sources, the inline theme script allowed by
// its hash, no framing, no objects, no unsafe-inline or unsafe-eval.
// Turnstile and Cloudflare Web Analytics origins are added by their own
// tasks. `upgrade-insecure-requests` is deliberately omitted: it would break
// the http://localhost preview.
export const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' ${scriptHash(themeScript)}`,
  "style-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

// `preload` is deliberately absent from the HSTS directive: preload-list
// submission is an owner decision.
export const securityHeaders: Readonly<Record<string, string>> = {
  "Content-Security-Policy": contentSecurityPolicy,
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
};

// Renders headers in the Cloudflare Workers `_headers` format: a `/*` glob
// route followed by one two-space-indented `Name: value` line per header.
export function toCloudflareHeaders(headers: Record<string, string>): string {
  const lines = Object.entries(headers).map(
    ([name, value]) => `  ${name}: ${value}`,
  );
  return `/*\n${lines.join("\n")}\n`;
}
