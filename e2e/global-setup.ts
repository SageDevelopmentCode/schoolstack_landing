import fs from "node:fs";
import dotenv from "dotenv";
import { seedE2eDatabase } from "./fixtures/seed";

const BLOCKED_SUPABASE_HOSTS = ["rxrmlfyoqzdpjxztluyd"];

function loadE2eEnv(): void {
  if (fs.existsSync(".env.e2e.local")) {
    dotenv.config({ path: ".env.e2e.local", override: true });
  } else {
    dotenv.config({ path: ".env.e2e.example", override: true });
  }
}

function assertE2eEnvironment(): void {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const stripeKey = process.env.STRIPE_SECRET_KEY ?? "";

  if (!supabaseUrl) {
    throw new Error(
      "E2E aborted: NEXT_PUBLIC_SUPABASE_URL is not set. Copy .env.e2e.example to .env.e2e.local and fill local Supabase keys from `supabase status`.",
    );
  }

  if (BLOCKED_SUPABASE_HOSTS.some((ref) => supabaseUrl.includes(ref))) {
    throw new Error(
      `E2E aborted: refusing to run against blocked Supabase host (${supabaseUrl}).`,
    );
  }

  const isLocal =
    supabaseUrl.includes("127.0.0.1") || supabaseUrl.includes("localhost");

  if (!isLocal && process.env.E2E_ALLOW_REMOTE_SUPABASE !== "1") {
    throw new Error(
      "E2E aborted: remote Supabase URL detected. Use local Supabase (supabase start) or set E2E_ALLOW_REMOTE_SUPABASE=1 for a dedicated test project only.",
    );
  }

  if (stripeKey.startsWith("sk_live_")) {
    throw new Error("E2E aborted: live Stripe key detected.");
  }
}

export default async function globalSetup(): Promise<void> {
  loadE2eEnv();
  assertE2eEnvironment();
  await seedE2eDatabase();
}
