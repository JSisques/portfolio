import type { MarginNote } from "../content/schemas.js";

// ADR-0002: technical facts come from GitHub; the narrative is local and
// translated. These types are the contract between the GitHub adapter, the
// narrative collection, and the projects section.

/** Facts about a repository, read from the GitHub API at build time. */
export interface RepositoryData {
  /** `owner/name`, as returned by GitHub. */
  fullName: string;
  /** Primary language, or `null` when GitHub detects none. */
  language: string | null;
  stars: number;
  /** Last push, as an ISO 8601 timestamp (GitHub `pushed_at`). */
  updatedAt: string;
  /** Repository page on GitHub. */
  url: string;
  /** Project homepage, or `null` when the repository has none. */
  homepage: string | null;
}

/** A featured project as rendered: local narrative plus GitHub facts. */
export interface Project {
  /** `owner/name` of the featured repository. */
  repository: string;
  title: string;
  summary: string;
  /** How the project was built. */
  story: string;
  notes: MarginNote[];
  github: RepositoryData;
}
