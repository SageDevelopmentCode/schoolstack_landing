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
      testMatch: /admin\/(?!access-denied).*\.spec\.ts/,
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
      testMatch: /parent\/.*\.spec\.ts/,
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        storageState: AUTH_STATE_PATHS.parent,
      },
    },
    {
      name: "api-parent",
      testMatch: /api\/(submit|bootstrap|checkout)\.spec\.ts/,
      dependencies: ["setup"],
      use: {
        storageState: AUTH_STATE_PATHS.parent,
      },
    },
    {
      name: "api-admin",
      testMatch: /api\/(status|mark-enrolled)\.spec\.ts/,
      dependencies: ["setup"],
      use: {
        storageState: AUTH_STATE_PATHS.schoolAdmin,
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
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? baseURL,
      DISABLE_OUTBOUND_EMAIL: "1",
      DISCORD_E2E_ALERTS_WEBHOOK_URL:
        process.env.DISCORD_E2E_ALERTS_WEBHOOK_URL ?? "",
      ROOTED_MEADOWS_WEBSITE_NOTIFICATION_DISCORD_WEBHOOK_URL: "",
      STRIPE_SECRET_KEY: "",
      STRIPE_WEBHOOK_SECRET: "",
      ZOHO_CLIENT_ID: "",
      ZOHO_CLIENT_SECRET: "",
      ZOHO_REDIRECT_URI: "",
      ZOHO_REFRESH_TOKEN: "",
      ZOHO_ACCOUNT_ID: "",
      ZOHO_FROM_ADDRESS: "",
      ZOHO_SMTP_USER: "",
      ZOHO_SMTP_PASSWORD: "",
    },
  },
});
