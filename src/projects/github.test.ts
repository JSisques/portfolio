import { describe, expect, it } from "vitest";
import {
  fetchRepositories,
  fetchRepository,
  GitHubDataError,
  repositoriesFromFixture,
} from "./github.js";
import type { RepositoryData } from "./types.js";

type FakeOutcome = { status?: number; body?: unknown; error?: unknown };

function mockFetch(outcome: FakeOutcome | ((url: string) => FakeOutcome)) {
  const calls: { url: string; init?: RequestInit | undefined }[] = [];
  const doFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    calls.push({ url, init });
    const { status, body, error } =
      typeof outcome === "function" ? outcome(url) : outcome;
    if (error !== undefined) {
      throw error;
    }
    return new Response(JSON.stringify(body ?? {}), { status: status ?? 200 });
  };
  return { calls, fetch: doFetch as typeof fetch };
}

async function captureRejection(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise;
  } catch (error) {
    return error;
  }
  throw new Error("expected the promise to reject");
}

function captureError(fn: () => void): unknown {
  try {
    fn();
  } catch (error) {
    return error;
  }
  throw new Error("expected the function to throw");
}

const payload = {
  full_name: "JSisques/portfolio",
  language: "TypeScript",
  stargazers_count: 42,
  pushed_at: "2026-11-27T09:30:00Z",
  html_url: "https://github.com/JSisques/portfolio",
  homepage: "https://jsisques.net",
  forks: 7,
};

const expected: RepositoryData = {
  fullName: "JSisques/portfolio",
  language: "TypeScript",
  stars: 42,
  updatedAt: "2026-11-27T09:30:00Z",
  url: "https://github.com/JSisques/portfolio",
  homepage: "https://jsisques.net",
};

describe("fetchRepository", () => {
  it("requests the repository with the GitHub headers and no authorization header", async () => {
    const { calls, fetch } = mockFetch({ body: payload });
    await fetchRepository("jsisques/portfolio", { fetch });
    expect(calls).toHaveLength(1);
    const [call] = calls;
    expect(call?.url).toBe("https://api.github.com/repos/jsisques/portfolio");
    expect(call?.init?.headers).toEqual({
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    });
  });

  it("sends the token as a bearer header only when the token is non-empty", async () => {
    const withToken = mockFetch({ body: payload });
    await fetchRepository("jsisques/portfolio", {
      fetch: withToken.fetch,
      token: "gh-token",
    });
    expect(withToken.calls[0]?.init?.headers).toMatchObject({
      Authorization: "Bearer gh-token",
    });

    const emptyToken = mockFetch({ body: payload });
    await fetchRepository("jsisques/portfolio", {
      fetch: emptyToken.fetch,
      token: "",
    });
    expect(emptyToken.calls[0]?.init?.headers).not.toHaveProperty(
      "Authorization",
    );
  });

  it("uses the custom API url when given", async () => {
    const { calls, fetch } = mockFetch({ body: payload });
    await fetchRepository("jsisques/portfolio", {
      fetch,
      apiUrl: "https://github.example.test/api",
    });
    expect(calls[0]?.url).toBe(
      "https://github.example.test/api/repos/jsisques/portfolio",
    );
  });

  it("maps the GitHub payload to RepositoryData", async () => {
    const full = mockFetch({ body: payload });
    expect(
      await fetchRepository("jsisques/portfolio", { fetch: full.fetch }),
    ).toEqual(expected);

    const nullable = mockFetch({
      body: { ...payload, language: null, homepage: null },
    });
    const data = await fetchRepository("jsisques/portfolio", {
      fetch: nullable.fetch,
    });
    expect(data.language).toBeNull();
    expect(data.homepage).toBeNull();
  });

  it("maps an empty homepage to null", async () => {
    const { fetch } = mockFetch({ body: { ...payload, homepage: "" } });
    const data = await fetchRepository("jsisques/portfolio", { fetch });
    expect(data.homepage).toBeNull();
  });

  it.each(["jsisques.net", "javascript:alert(1)"])(
    "maps a homepage that is not an http(s) URL (%s) to null",
    async (homepage) => {
      const { fetch } = mockFetch({ body: { ...payload, homepage } });
      const data = await fetchRepository("jsisques/portfolio", { fetch });
      expect(data.homepage).toBeNull();
    },
  );

  it("fails with a GitHubDataError that names the repository and the HTTP status", async () => {
    const { fetch } = mockFetch({
      status: 404,
      body: { message: "Not Found" },
    });
    const error = await captureRejection(
      fetchRepository("jsisques/portfolio", { fetch }),
    );
    expect(error).toBeInstanceOf(GitHubDataError);
    expect((error as GitHubDataError).repository).toBe("jsisques/portfolio");
    expect((error as GitHubDataError).message).toContain("jsisques/portfolio");
    expect((error as GitHubDataError).message).toContain("404");
  });

  it("wraps a network error in a GitHubDataError with the original error as cause", async () => {
    const networkError = new Error("network unreachable");
    const { fetch } = mockFetch({ error: networkError });
    const error = await captureRejection(
      fetchRepository("jsisques/portfolio", { fetch }),
    );
    expect(error).toBeInstanceOf(GitHubDataError);
    expect((error as GitHubDataError).repository).toBe("jsisques/portfolio");
    expect((error as GitHubDataError).message).toContain("jsisques/portfolio");
    expect((error as GitHubDataError).cause).toBe(networkError);
  });

  it("fails with a GitHubDataError when the payload is invalid", async () => {
    const { fetch } = mockFetch({ body: { ...payload, stargazers_count: -1 } });
    const error = await captureRejection(
      fetchRepository("jsisques/portfolio", { fetch }),
    );
    expect(error).toBeInstanceOf(GitHubDataError);
    expect((error as GitHubDataError).repository).toBe("jsisques/portfolio");
    expect((error as GitHubDataError).message).toContain("jsisques/portfolio");
  });
});

describe("fetchRepositories", () => {
  const radar = {
    full_name: "JSisques/agent-radar",
    language: null,
    stargazers_count: 3,
    pushed_at: "2026-11-20T08:00:00Z",
    html_url: "https://github.com/JSisques/agent-radar",
    homepage: null,
  };

  it("returns the repositories keyed by the requested name", async () => {
    const mock = mockFetch((url) =>
      url.endsWith("/portfolio") ? { body: payload } : { body: radar },
    );
    const data = await fetchRepositories(
      ["jsisques/portfolio", "jsisques/agent-radar"],
      {
        fetch: mock.fetch,
      },
    );
    expect(Object.keys(data)).toEqual([
      "jsisques/portfolio",
      "jsisques/agent-radar",
    ]);
    expect(data["jsisques/portfolio"]).toEqual(expected);
    expect(data["jsisques/agent-radar"]).toEqual({
      fullName: "JSisques/agent-radar",
      language: null,
      stars: 3,
      updatedAt: "2026-11-20T08:00:00Z",
      url: "https://github.com/JSisques/agent-radar",
      homepage: null,
    });
  });

  it("rejects with the GitHubDataError when any repository fails", async () => {
    const mock = mockFetch((url) =>
      url.endsWith("/portfolio")
        ? { body: payload }
        : { status: 404, body: { message: "Not Found" } },
    );
    const error = await captureRejection(
      fetchRepositories(["jsisques/portfolio", "jsisques/agent-radar"], {
        fetch: mock.fetch,
      }),
    );
    expect(error).toBeInstanceOf(GitHubDataError);
    expect((error as GitHubDataError).repository).toBe("jsisques/agent-radar");
  });
});

describe("repositoriesFromFixture", () => {
  const radar: RepositoryData = {
    fullName: "JSisques/agent-radar",
    language: null,
    stars: 3,
    updatedAt: "2026-11-20T08:00:00Z",
    url: "https://github.com/JSisques/agent-radar",
    homepage: null,
  };

  it("returns only the requested repositories, keyed by the requested name", () => {
    const fixture = {
      "jsisques/portfolio": expected,
      "jsisques/agent-radar": radar,
    };
    const data = repositoriesFromFixture(fixture, ["jsisques/agent-radar"]);
    expect(Object.keys(data)).toEqual(["jsisques/agent-radar"]);
    expect(data["jsisques/agent-radar"]).toEqual(radar);
  });

  it("fails with a GitHubDataError when a requested entry is missing", () => {
    const error = captureError(() =>
      repositoriesFromFixture({ "jsisques/portfolio": expected }, [
        "jsisques/agent-radar",
      ]),
    );
    expect(error).toBeInstanceOf(GitHubDataError);
    expect((error as GitHubDataError).repository).toBe("jsisques/agent-radar");
    expect((error as GitHubDataError).message).toContain(
      "jsisques/agent-radar",
    );
  });

  it("fails with a GitHubDataError when a fixture entry is invalid", () => {
    const invalid = { ...expected, stars: -1 };
    const error = captureError(() =>
      repositoriesFromFixture({ "jsisques/portfolio": invalid }, [
        "jsisques/portfolio",
      ]),
    );
    expect(error).toBeInstanceOf(GitHubDataError);
    expect((error as GitHubDataError).repository).toBe("jsisques/portfolio");
  });
});
