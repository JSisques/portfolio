// The Workers runtime module the contact endpoint reads its environment from
// (vars, secrets, bindings). Declared here, narrowly, instead of adding
// @cloudflare/workers-types as a dependency; src/contact/endpoint.ts
// defines the shape it reads (ContactEnv).
declare module "cloudflare:workers" {
  export const env: Record<string, unknown>;
}
