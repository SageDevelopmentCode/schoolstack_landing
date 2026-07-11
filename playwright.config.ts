import fs from "node:fs";
import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import { AUTH_STATE_PATHS } from "./e2e/fixtures/constants";

if (fs.existsSync(".env.e2e.local")) {
  dotenv.config({ path: ".env.e2e.local", override: true });
}

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  globalSetup: require.resolve("./e2e/global-setup"),
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: "smoke",
      testMatch: /smoke\//,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "school-admin",
      testMatch: /admin\/admissions-submissions\.spec\.ts/,
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        storageState: AUTH_STATE_PATHS.schoolAdmin,
      },
    },
    {
      name: "non-admin",
      testMatch: /admin\/access-denied\.spec\.ts/,
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        storageState: AUTH_STATE_PATHS.nonAdmin,
      },
    },
    {
      name: "parent",
      testMatch: /parent\/apply-dashboard\.spec\.ts/,
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        storageState: AUTH_STATE_PATHS.parent,
      },
    },
  ],
  webServer: {
    command: "npm run dev:next",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? baseURL,
      STRIPE_SECRET_KEY: "",
      STRIPE_WEBHOOK_SECRET: "",
    },
  },
});
