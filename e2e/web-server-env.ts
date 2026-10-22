import fs from "node:fs";
import dotenv from "dotenv";
import { E2E_BASE_URL, E2E_PORT } from "./fixtures/constants";

export function loadE2eDotenv(): void {
  if (fs.existsSync(".env.e2e.local")) {
    dotenv.config({ path: ".env.e2e.local", override: true });
    return;
  }

  if (fs.existsSync(".env.e2e.example")) {
    dotenv.config({ path: ".env.e2e.example", override: false });
  }
}

export function resolveE2eBaseUrl(): string {
  return process.env.PLAYWRIGHT_BASE_URL ?? E2E_BASE_URL;
}

export function resolveE2eWebServerPort(baseURL: string): number {
  if (process.env.PLAYWRIGHT_PORT) {
    return Number(process.env.PLAYWRIGHT_PORT);
  }

  try {
    const url = new URL(baseURL);
    if (url.port) {
      return Number(url.port);
    }
  } catch {
    // fall through
  }

  return E2E_PORT;
}

/** Env vars passed to the Playwright-managed Next server (dev or start). */
export function buildE2eWebServerEnv(baseURL: string): Record<string, string> {
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? baseURL,
    DISABLE_OUTBOUND_EMAIL: "1",
    DISCORD_E2E_ALERTS_WEBHOOK_URL: process.env.DISCORD_E2E_ALERTS_WEBHOOK_URL ?? "",
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
  };
}

export function shouldSkipPlaywrightWebServer(): boolean {
  const value = process.env.PLAYWRIGHT_SKIP_WEBSERVER?.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

/** CI: next dev (fast). Local: next start (coexists with next dev on 3000). */
export function resolveE2eWebServerCommand(port: number): string {
  if (process.env.CI) {
    return `npm run dev:next -- -p ${port}`;
  }

  return `node scripts/playwright-e2e-web-server.mjs ${port}`;
}
