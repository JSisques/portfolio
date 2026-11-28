import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import {
  createContactEndpoint,
  type ContactEnv,
} from "../../contact/endpoint.js";

// ADR-0007: the only on-demand route. Every page stays prerendered.
export const prerender = false;

// The Worker environment: vars and the send_email binding from wrangler.jsonc,
// secrets from `wrangler secret put` (ADR-0014, ADR-0021).
const endpoint = createContactEndpoint(env as ContactEnv);

export const POST: APIRoute = ({ request }) => endpoint(request);
