import { defineConfig, devices } from "@playwright/test";

const port = 4173;

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  outputDir: "test-results",
  use: {
    baseURL: `http://127.0.0.1:${port}/GithubPages/ge/`,
    channel: process.platform === "win32" ? "msedge" : undefined,
    launchOptions: { args: ["--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] },
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 }, channel: process.platform === "win32" ? "msedge" : undefined } },
  ],
  webServer: { command: `node tools/serve.mjs --port ${port}`, url: `http://127.0.0.1:${port}/GithubPages/ge/`, reuseExistingServer: true },
});
