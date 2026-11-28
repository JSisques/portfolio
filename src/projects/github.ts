import { z } from "astro/zod";
import type { RepositoryData } from "./types.js";

// ADR-0036: any GitHub API failure fails the build, and every failure names
// the repository it happened on.
export class GitHubDataError extends Error {
  readonly repository: string;

  constructor(
    repository: string,
    message: string,
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.repository = repository;
  }
}

export interface FetchRepositoryOptions {
  fetch?: typeof fetch;
  token?: string;
  apiUrl?: string;
}

const repositoryApiSchema = z.object({
  full_name: z.string(),
  language: z.string().nullable(),
  stargazers_count: z.number().int().nonnegative(),
  pushed_at: z.iso.datetime(),
  html_url: z.url({ protocol: /^https$/ }),
  // GitHub returns "" when a repository has no homepage, and accepts any text
  // there; only an http(s) URL is rendered as a link.
  homepage: z
    .string()
    .nullable()
    .transform((value) =>
      value !== null && /^https?:\/\/\S+$/.test(value) ? value : null,
    ),
});

const repositoryDataSchema = z.object({
  fullName: z.string(),
  language: z.string().nullable(),
  stars: z.number().int().nonnegative(),
  updatedAt: z.iso.datetime(),
  url: z.url({ protocol: /^https$/ }),
  homepage: z.string().nullable(),
});

export async function fetchRepository(
  repository: string,
  options: FetchRepositoryOptions = {},
): Promise<RepositoryData> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }
  const apiUrl = options.apiUrl ?? "https://api.github.com";
  let response: Response;
  try {
    response = await (options.fetch ?? fetch)(`${apiUrl}/repos/${repository}`, {
      headers,
    });
  } catch (cause) {
    throw new GitHubDataError(
      repository,
      `Failed to fetch repository ${repository} from the GitHub API`,
      { cause },
    );
  }
  if (!response.ok) {
    throw new GitHubDataError(
      repository,
      `GitHub API returned HTTP ${response.status} for repository ${repository}`,
    );
  }
  let payload: unknown;
  try {
    payload = await response.json();
  } catch (cause) {
    throw new GitHubDataError(
      repository,
      `Invalid GitHub API response for repository ${repository}`,
      { cause },
    );
  }
  const parsed = repositoryApiSchema.safeParse(payload);
  if (!parsed.success) {
    throw new GitHubDataError(
      repository,
      `Invalid GitHub API response for repository ${repository}`,
    );
  }
  return {
    fullName: parsed.data.full_name,
    language: parsed.data.language,
    stars: parsed.data.stargazers_count,
    updatedAt: parsed.data.pushed_at,
    url: parsed.data.html_url,
    homepage: parsed.data.homepage,
  };
}

export async function fetchRepositories(
  repositories: readonly string[],
  options?: FetchRepositoryOptions,
): Promise<Record<string, RepositoryData>> {
  const data: Record<string, RepositoryData> = {};
  await Promise.all(
    repositories.map(async (repository) => {
      data[repository] = await fetchRepository(repository, options);
    }),
  );
  return data;
}

export function repositoriesFromFixture(
  fixture: unknown,
  repositories: readonly string[],
): Record<string, RepositoryData> {
  const entries =
    typeof fixture === "object" && fixture !== null && !Array.isArray(fixture)
      ? (fixture as Record<string, unknown>)
      : undefined;
  const data: Record<string, RepositoryData> = {};
  for (const repository of repositories) {
    const entry = entries?.[repository];
    if (entry === undefined) {
      throw new GitHubDataError(
        repository,
        `Missing fixture entry for repository ${repository}`,
      );
    }
    const parsed = repositoryDataSchema.safeParse(entry);
    if (!parsed.success) {
      throw new GitHubDataError(
        repository,
        `Invalid fixture entry for repository ${repository}`,
      );
    }
    data[repository] = parsed.data;
  }
  return data;
}
