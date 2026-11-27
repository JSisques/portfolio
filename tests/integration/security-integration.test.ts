import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  securityHeaders,
  toCloudflareHeaders,
} from "../../src/security/headers.js";
import {
  securityHeadersIntegration,
  writeCloudflareHeaders,
} from "../../src/security/integration.js";

// ADR-0033 (S3): the headers are defined once in headers.ts and applied on
// both targets: the Cloudflare `_headers` file (ADR-0035) and the Node
// `astro preview` server. ADR-0015: test the behavior, not the copy.

const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

function tempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "jsisques-security-headers-"));
  tempDirs.push(dir);
  return dir;
}

const integration = securityHeadersIntegration();

type SetupHook = NonNullable<(typeof integration.hooks)["astro:config:setup"]>;
type SetupOptions = Parameters<SetupHook>[0];

function setupOptions(
  command: "dev" | "build" | "preview",
  updateConfig: SetupOptions["updateConfig"],
): SetupOptions {
  return {
    config: {} as SetupOptions["config"],
    command,
    isRestart: false,
    updateConfig,
    addRenderer: () => {},
    addWatchFile: () => {},
    injectScript: () => {},
    injectRoute: () => {},
    addClientDirective: () => {},
    addDevToolbarApp: () => {},
    addMiddleware: () => {},
    createCodegenDir: () => new URL("file:///codegen/"),
    logger: {} as SetupOptions["logger"],
  };
}

describe("writeCloudflareHeaders (Cloudflare target)", () => {
  it("writes _headers as toCloudflareHeaders(securityHeaders)", async () => {
    const dir = tempDir();
    await writeCloudflareHeaders(dir);
    expect(readFileSync(join(dir, "_headers"), "utf8")).toBe(
      toCloudflareHeaders(securityHeaders),
    );
  });
});

describe("astro:build:done hook", () => {
  it("writes _headers to the output dir Astro passes", async () => {
    const done = integration.hooks["astro:build:done"];
    expect(done, "astro:build:done hook is registered").toBeTypeOf("function");
    if (!done) return;
    const dir = tempDir();
    await done({
      pages: [],
      dir: pathToFileURL(dir),
      assets: new Map<string, URL[]>(),
      logger: {} as SetupOptions["logger"],
    });
    expect(readFileSync(join(dir, "_headers"), "utf8")).toBe(
      toCloudflareHeaders(securityHeaders),
    );
  });
});

describe("astro:config:setup hook (Node preview target)", () => {
  it("applies securityHeaders to the preview server", async () => {
    const setup = integration.hooks["astro:config:setup"];
    expect(setup, "astro:config:setup hook is registered").toBeTypeOf(
      "function",
    );
    if (!setup) return;
    const updateConfig = vi.fn();
    await setup(setupOptions("preview", updateConfig));
    expect(updateConfig).toHaveBeenCalledTimes(1);
    expect(updateConfig).toHaveBeenCalledWith({
      server: { headers: { ...securityHeaders } },
    });
  });

  it("does not apply headers to dev", async () => {
    const setup = integration.hooks["astro:config:setup"];
    if (!setup) return;
    const updateConfig = vi.fn();
    await setup(setupOptions("dev", updateConfig));
    expect(updateConfig).not.toHaveBeenCalled();
  });
});
