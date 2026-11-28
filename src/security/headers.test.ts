import { describe, expect, it } from "vitest";
import {
  contentSecurityPolicy,
  scriptHash,
  securityHeaders,
  themeScript,
  toCloudflareHeaders,
} from "./headers.js";

// ADR-0033: the security headers and the strict CSP are behavior, so they
// are asserted here (S4). ADR-0015.

describe("securityHeaders", () => {
  it("contains the four S1 headers with their exact values", () => {
    expect(securityHeaders["Strict-Transport-Security"]).toBe(
      "max-age=31536000; includeSubDomains",
    );
    expect(securityHeaders["X-Content-Type-Options"]).toBe("nosniff");
    expect(securityHeaders["Referrer-Policy"]).toBe(
      "strict-origin-when-cross-origin",
    );
    expect(securityHeaders["Permissions-Policy"]).toBe(
      "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
    );
  });

  it("includes a Content-Security-Policy", () => {
    expect(securityHeaders["Content-Security-Policy"]).toBe(
      contentSecurityPolicy,
    );
  });

  it("does not preload the HSTS policy (owner decision)", () => {
    expect(securityHeaders["Strict-Transport-Security"]).not.toContain(
      "preload",
    );
  });
});

describe("contentSecurityPolicy", () => {
  it("is strict: self-only defaults, no framing, no objects", () => {
    expect(contentSecurityPolicy).toContain("default-src 'self'");
    expect(contentSecurityPolicy).toContain("frame-ancestors 'none'");
    expect(contentSecurityPolicy).toContain("object-src 'none'");
  });

  it("allows the Turnstile origin for scripts and frames (S5)", () => {
    expect(contentSecurityPolicy).toContain(
      `script-src 'self' ${scriptHash(themeScript)} https://challenges.cloudflare.com`,
    );
    expect(contentSecurityPolicy).toContain(
      "frame-src https://challenges.cloudflare.com",
    );
  });

  it("allows the inline theme script by its hash only", () => {
    expect(contentSecurityPolicy).toContain(
      `script-src 'self' ${scriptHash(themeScript)}`,
    );
    expect(contentSecurityPolicy).not.toContain("unsafe-inline");
    expect(contentSecurityPolicy).not.toContain("unsafe-eval");
  });

  it("does not force upgrade-insecure-requests (breaks http://localhost)", () => {
    expect(contentSecurityPolicy).not.toContain("upgrade-insecure-requests");
  });
});

describe("scriptHash", () => {
  it("hashes a known string to its sha256 base64", () => {
    // Expected vector computed independently with node's crypto.
    expect(scriptHash("alert(1)")).toBe(
      "'sha256-bhHHL3z2vDgxUt0W3dWQOrprscmda2Y5pLsLg4GF+pI='",
    );
  });
});

describe("toCloudflareHeaders", () => {
  it("renders the Cloudflare _headers format", () => {
    const rendered = toCloudflareHeaders(securityHeaders);
    expect(rendered.startsWith("/*\n")).toBe(true);
    expect(rendered).toContain("  X-Content-Type-Options: nosniff\n");
    const lines = rendered.split("\n").filter((line) => line.length > 0);
    expect(lines[0]).toBe("/*");
    const entries = Object.entries(securityHeaders);
    for (const [name, value] of entries) {
      expect(lines).toContain(`  ${name}: ${value}`);
    }
    // One indented line per header, nothing else.
    expect(lines.length).toBe(entries.length + 1);
  });
});
