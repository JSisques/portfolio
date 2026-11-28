import { defineConfig, devices } from "@playwright/test";

const CI = !!process.env.CI;

export default defineConfig({
  testDir: "tests/e2e",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 2 : 0,
  timeout: 30_000,
  use: {
    baseURL: "http://localhost:4321",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "pnpm build && pnpm preview --port 4321",
    // ADR-0036: the build reads GitHub data from a fixture, never the API.
    env: { GITHUB_DATA_FIXTURE: "tests/e2e/fixtures/github.json" },
    timeout: 120_000,
    port: 4321,
    reuseExistingServer: !CI,
    stdout: "pipe",
    stderr: "pipe",
  },
  reporter: CI ? [["dot"], ["html", { open: "never" }]] : "list",
});
