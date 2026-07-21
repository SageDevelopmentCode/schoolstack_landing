import fs from "node:fs";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import ws from "ws";

const BLOCKED_SUPABASE_HOSTS = ["rxrmlfyoqzdpjxztluyd"];

export function loadTestEnv(): void {
  if (fs.existsSync(".env.e2e.local")) {
    dotenv.config({ path: ".env.e2e.local", override: true });
  }

  process.env.DISABLE_OUTBOUND_EMAIL ??= "1";
  process.env.NEXT_PUBLIC_SITE_URL ??= "http://localhost:3000";
}

export function requireLocalSupabase(): void {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

  if (!supabaseUrl) {
    throw new Error(
      "Integration tests require NEXT_PUBLIC_SUPABASE_URL. Copy .env.e2e.example to .env.e2e.local and run `supabase start`.",
    );
  }

  if (BLOCKED_SUPABASE_HOSTS.some((host) => supabaseUrl.includes(host))) {
    throw new Error(
      `Integration tests aborted: refusing blocked Supabase host (${supabaseUrl}).`,
    );
  }

  const isLocal =
    supabaseUrl.includes("127.0.0.1") || supabaseUrl.includes("localhost");

  if (!isLocal) {
    throw new Error(
      "Integration tests require local Supabase (127.0.0.1 or localhost).",
    );
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "Integration tests require SUPABASE_SERVICE_ROLE_KEY from `supabase status`.",
    );
  }
}

export function integrationTestsEnabled(): boolean {
  try {
    loadTestEnv();
    requireLocalSupabase();
    return true;
  } catch {
    return false;
  }
}

export function createTestAdminClient(): SupabaseClient {
  loadTestEnv();
  requireLocalSupabase();

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      realtime: {
        transport: ws as never,
      },
    },
  );
}
