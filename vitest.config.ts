// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="vitest/config" />
import { getViteConfig } from "astro/config";
import { configDefaults } from "vitest/config";

export default getViteConfig({
  test: {
    include: ["src/**/*.test.ts", "tests/**/*.test.ts"],
    exclude: [...configDefaults.exclude, "tests/e2e/**"],
  },
});
