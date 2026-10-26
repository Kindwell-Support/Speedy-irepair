import { defineConfig, devices } from "@playwright/test";

/**
 * Viewports per PROJECT_SPEC.md §6: 375, 768, 1280, 1440, 1920.
 * Default: tests a production build via `next start` (run `pnpm build` first).
 * Set PLAYWRIGHT_BASE_URL to test a running server or the staging preview URL instead.
 */
const PORT = Number(process.env.PORT ?? 3100);
const externalBaseURL = process.env.PLAYWRIGHT_BASE_URL;
const baseURL = externalBaseURL ?? `http://127.0.0.1:${PORT}`;

const viewports: Array<[string, number, number]> = [
  ["mobile-375", 375, 812],
  ["tablet-768", 768, 1024],
  ["desktop-1280", 1280, 800],
  ["desktop-1440", 1440, 900],
  ["desktop-1920", 1920, 1080],
];

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  use: { baseURL, trace: "on-first-retry" },
  projects: viewports.map(([name, width, height]) => ({
    name,
    use: { ...devices["Desktop Chrome"], viewport: { width, height } },
  })),
  webServer: externalBaseURL
    ? undefined
    : {
        command: `pnpm exec next start -p ${PORT}`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
