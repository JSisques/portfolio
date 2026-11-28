import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import {
  aboutSchema,
  experienceSchema,
  projectSchema,
} from "./content/schemas.js";

// One file per entry and locale, for example `about/es.yaml` or
// `experience/en/role-slug.yaml`.
const about = defineCollection({
  loader: glob({ pattern: "**/*.yaml", base: "./src/content/about" }),
  schema: aboutSchema,
});

const experience = defineCollection({
  loader: glob({ pattern: "**/*.yaml", base: "./src/content/experience" }),
  schema: experienceSchema,
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.yaml", base: "./src/content/projects" }),
  schema: projectSchema,
});

export const collections = { about, experience, projects };
