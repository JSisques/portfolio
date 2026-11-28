import { readFile } from "node:fs/promises";
import {
  fetchRepositories,
  repositoriesFromFixture,
  type FetchRepositoryOptions,
} from "./github.js";
import type { RepositoryData } from "./types.js";

interface LoadEnv {
  GITHUB_DATA_FIXTURE?: string | undefined;
  GITHUB_TOKEN?: string | undefined;
}

// ADR-0036: the build reads GitHub data from the API and fails on any error.
// `GITHUB_DATA_FIXTURE` is the test seam used by e2e and Lighthouse builds.
export async function loadRepositoryData(
  repositories: readonly string[],
  env: LoadEnv = process.env,
  fetchImpl?: typeof fetch,
): Promise<Record<string, RepositoryData>> {
  if (env.GITHUB_DATA_FIXTURE) {
    const fixture: unknown = JSON.parse(
      await readFile(env.GITHUB_DATA_FIXTURE, "utf8"),
    );
    return repositoriesFromFixture(fixture, repositories);
  }
  const options: FetchRepositoryOptions = {};
  if (env.GITHUB_TOKEN) options.token = env.GITHUB_TOKEN;
  if (fetchImpl) options.fetch = fetchImpl;
  return fetchRepositories(repositories, options);
}
