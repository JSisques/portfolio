import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it, expect, vi } from "vitest";
import { GitHubDataError } from "./github.js";
import { loadRepositoryData } from "./load.js";

const REPOS = ["JSisques/portfolio"] as const;

const apiPayload = {
  full_name: "JSisques/portfolio",
  language: "TypeScript",
  stargazers_count: 2,
  pushed_at: "2026-03-01T00:00:00Z",
  html_url: "https://github.com/JSisques/portfolio",
  homepage: "https://jsisques.net",
};

const repositoryData = {
  fullName: "JSisques/portfolio",
  language: "TypeScript",
  stars: 2,
  updatedAt: "2026-03-01T00:00:00Z",
  url: "https://github.com/JSisques/portfolio",
  homepage: "https://jsisques.net",
};

function okFetch() {
  return vi.fn<typeof fetch>(async () => Response.json(apiPayload));
}

describe("loadRepositoryData", () => {
  it("reads the fixture named by GITHUB_DATA_FIXTURE without calling the API", async () => {
    const dir = mkdtempSync(join(tmpdir(), "projects-fixture-"));
    const path = join(dir, "github.json");
    writeFileSync(path, JSON.stringify({ [REPOS[0]]: repositoryData }));
    const fetchImpl = okFetch();

    const data = await loadRepositoryData(
      REPOS,
      { GITHUB_DATA_FIXTURE: path },
      fetchImpl,
    );

    expect(data).toEqual({ [REPOS[0]]: repositoryData });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("calls the GitHub API with GITHUB_TOKEN when no fixture is set", async () => {
    const fetchImpl = okFetch();

    const data = await loadRepositoryData(
      REPOS,
      { GITHUB_TOKEN: "secret" },
      fetchImpl,
    );

    expect(data).toEqual({ [REPOS[0]]: repositoryData });
    const [url, init] = fetchImpl.mock.calls[0] ?? [];
    expect(url).toBe("https://api.github.com/repos/JSisques/portfolio");
    expect(new Headers(init?.headers).get("Authorization")).toBe(
      "Bearer secret",
    );
  });

  it("calls the API without a token when GITHUB_TOKEN is unset", async () => {
    const fetchImpl = okFetch();

    await loadRepositoryData(REPOS, {}, fetchImpl);

    const [, init] = fetchImpl.mock.calls[0] ?? [];
    expect(new Headers(init?.headers).has("Authorization")).toBe(false);
  });

  it("rejects when the GitHub API fails, so the build fails (ADR-0036)", async () => {
    const fetchImpl = vi.fn<typeof fetch>(
      async () => new Response("unavailable", { status: 503 }),
    );

    await expect(loadRepositoryData(REPOS, {}, fetchImpl)).rejects.toThrow(
      GitHubDataError,
    );
  });

  it("rejects when the fixture file does not exist", async () => {
    await expect(
      loadRepositoryData(REPOS, {
        GITHUB_DATA_FIXTURE: join(tmpdir(), "missing-projects-fixture.json"),
      }),
    ).rejects.toThrow();
  });
});
