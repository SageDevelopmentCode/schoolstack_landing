import { defineConfig, devices, type PlaywrightTestConfig } from "@playwright/test";
import { AUTH_STATE_PATHS } from "./e2e/fixtures/constants";
import {
  buildE2eWebServerEnv,
  loadE2eDotenv,
  resolveE2eBaseUrl,
  resolveE2eWebServerCommand,
  resolveE2eWebServerPort,
  shouldSkipPlaywrightWebServer,
} from "./e2e/web-server-env";

loadE2eDotenv();

// Dedicated E2E port so `npm run dev` on 3000/3001 can stay running (local uses next start on 3100).
const baseURL = resolveE2eBaseUrl();
const webServerPort = resolveE2eWebServerPort(baseURL);
const skipWebServer = shouldSkipPlaywrightWebServer();

const config: PlaywrightTestConfig = {
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
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
      name: "teacher",
      testMatch: /teacher\/.*\.spec\.ts/,
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        storageState: AUTH_STATE_PATHS.staff,
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
      testMatch: /api\/(status|mark-enrolled)\.spec\.ts|tuition\/.*\.spec\.ts/,
      dependencies: ["setup"],
      use: {
        storageState: AUTH_STATE_PATHS.schoolAdmin,
      },
    },
  ],
};

if (!skipWebServer) {
  config.webServer = {
    command: resolveE2eWebServerCommand(webServerPort),
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: buildE2eWebServerEnv(baseURL),
  };
}

export default defineConfig(config);
