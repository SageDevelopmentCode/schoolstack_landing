/**
 * Seed local Supabase + generate Playwright auth storage for Lighthouse CI.
 *
 * Usage:
 *   npm run performance:ci:prepare
 *
 * Requires local Supabase env (same as E2E): NEXT_PUBLIC_SUPABASE_URL,
 * SUPABASE_SERVICE_ROLE_KEY, and PLAYWRIGHT_BASE_URL (optional).
 */

import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { createAuthStorageStates } from "../e2e/fixtures/auth";
import { seedE2eDatabase } from "../e2e/fixtures/seed";
import { buildCiLighthouseAuthRoutes } from "../src/lib/performance/page-manifest";

const BLOCKED_SUPABASE_HOSTS = ["rxrmlfyoqzdpjxztluyd"];
const AUTH_ROUTES_PATH = path.join(process.cwd(), "scripts/lhci-auth-routes.json");

function loadEnv(): void {
  if (fs.existsSync(".env.e2e.local")) {
    dotenv.config({ path: ".env.e2e.local", override: true });
    return;
  }

  if (process.env.CI || process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return;
  }

  dotenv.config({ path: ".env.e2e.example", override: false });
}

function assertEnvironment(): void {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

  if (!supabaseUrl) {
    throw new Error(
      "performance:ci:prepare aborted: NEXT_PUBLIC_SUPABASE_URL is not set.",
    );
  }

  if (BLOCKED_SUPABASE_HOSTS.some((host) => supabaseUrl.includes(host))) {
    throw new Error(
      `performance:ci:prepare aborted: refusing blocked Supabase host (${supabaseUrl}).`,
    );
  }

  const isLocal =
    supabaseUrl.includes("127.0.0.1") || supabaseUrl.includes("localhost");

  if (!isLocal && process.env.E2E_ALLOW_REMOTE_SUPABASE !== "1") {
    throw new Error(
      "performance:ci:prepare aborted: use local Supabase (supabase start) or set E2E_ALLOW_REMOTE_SUPABASE=1.",
    );
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!serviceKey || serviceKey.split(".").length !== 3) {
    throw new Error(
      "performance:ci:prepare aborted: SUPABASE_SERVICE_ROLE_KEY must be a JWT from supabase status.",
    );
  }
}

function log(message: string): void {
  console.log(`[performance:ci:prepare] ${message}`);
}

async function main(): Promise<void> {
  loadEnv();
  assertEnvironment();

  log("Seeding E2E database…");
  await seedE2eDatabase();

  log("Creating Playwright auth storage states…");
  await createAuthStorageStates();

  const routes = buildCiLighthouseAuthRoutes();
  fs.writeFileSync(AUTH_ROUTES_PATH, `${JSON.stringify(routes, null, 2)}\n`, "utf8");
  log(`Wrote ${Object.keys(routes).length} auth routes to ${AUTH_ROUTES_PATH}`);
}

void main().catch((error) => {
  console.error("[performance:ci:prepare] Failed:", error);
  process.exit(1);
});
