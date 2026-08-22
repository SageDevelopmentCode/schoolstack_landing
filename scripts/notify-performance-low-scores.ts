/**
 * Notify Discord when CI Lighthouse scores are below threshold.
 *
 * Usage:
 *   npm run performance:notify-low-scores
 *
 * Skips gracefully when webhook, Supabase, or GITHUB_SHA are not configured.
 */

import { resolve } from "node:path";
import { config } from "dotenv";
import { notifyCiLowScores } from "@/lib/performance/low-score-discord";
import { createAdminClient } from "@/utils/supabase/admin";

config({ path: resolve(process.cwd(), ".env.local") });

function log(message: string) {
  console.log(`[performance:notify-low-scores] ${message}`);
}

function resolveRunUrl(): string | undefined {
  const server = process.env.GITHUB_SERVER_URL?.trim();
  const repo = process.env.GITHUB_REPOSITORY?.trim();
  const runId = process.env.GITHUB_RUN_ID?.trim();

  if (!server || !repo || !runId) {
    return undefined;
  }

  return `${server}/${repo}/actions/runs/${runId}`;
}

async function main() {
  if (!process.env.DISCORD_PERFORMANCE_CHECKS_WEBHOOK_URL?.trim()) {
    log("DISCORD_PERFORMANCE_CHECKS_WEBHOOK_URL not configured — skipping.");
    return;
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    log("Supabase credentials not configured — skipping.");
    return;
  }

  const commitSha = process.env.GITHUB_SHA?.trim();
  if (!commitSha) {
    log("GITHUB_SHA not set — skipping.");
    return;
  }

  const branch = process.env.GITHUB_REF_NAME?.trim() ?? "unknown";
  const admin = createAdminClient();

  const result = await notifyCiLowScores(admin, {
    commitSha,
    branch,
    runUrl: resolveRunUrl(),
  });

  if (!result.notified) {
    log("No CI pages below threshold for this commit — skipping Discord.");
    return;
  }

  log(`Posted Discord alert for ${result.count} low-score page(s).`);
}

void main().catch((error) => {
  console.error("[performance:notify-low-scores] Failed:", error);
  process.exit(1);
});
