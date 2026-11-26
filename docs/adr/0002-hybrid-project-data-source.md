# 2. Hybrid project data source

- Status: Accepted
- Date: 2026-11-26

## Context

The site showcases projects hosted on GitHub. Two options were considered:

- **Manual curation:** full control of the narrative, but every data point must be maintained by hand.
- **Automatic from the GitHub API:** always up to date, but limited to what the repository exposes, and the repository description exists in a single language. That conflicts with a multilingual site.

## Decision

Use a hybrid model:

- **Selection:** an explicit list of featured repositories, maintained in this repository.
- **Live data from GitHub:** language, stars, last update, and links.
- **Narrative, local and translated:** title, summary, and project story written per language in this repository. GitHub descriptions are not used as displayed copy.

## Consequences

- I control which projects appear and how they are told.
- Technical metadata stays current without manual work.
- Translations are fully supported, because narrative text is local.
- The site depends on the GitHub API. When and how data is fetched (build time or runtime), and the behavior when the API fails, are still open decisions.
