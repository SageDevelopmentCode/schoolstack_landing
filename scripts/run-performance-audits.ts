/**
 * Process pending local performance audit runs via Lighthouse CLI.
 *
 * Usage:
 *   npm run performance:audit
 *   npm run performance:audit:watch
 */

import { execFile } from "node:child_process";
import { readFile, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import { config } from "dotenv";
import { metricsToResultRow, upsertPerformanceAuditResult } from "@/lib/performance/api-helpers";
import {
  buildLighthouseArgs,
  formatExecError,
} from "@/lib/performance/lighthouse-cli";
import {
  buildCookieHeader,
  loadCookiesForPageAuth,
} from "@/lib/performance/lighthouse-auth";
import { normalizeLighthouseResult } from "@/lib/performance/lighthouse-parse";
import {
  getPageTargetById,
  resolvePageUrl,
} from "@/lib/performance/page-manifest";
import type { AuditFormFactor } from "@/lib/performance/types";
import { createAdminClient } from "@/utils/supabase/admin";

config({ path: resolve(process.cwd(), ".env.local") });

const execFileAsync = promisify(execFile);
const WATCH_INTERVAL_MS = 5000;

function log(message: string) {
  console.log(`[performance] ${message}`);
}

async function readLighthouseOutput(outputPath: string) {
  const rawText = await readFile(outputPath, "utf8");
  return JSON.parse(rawText) as unknown;
}

async function runLighthouse(
  url: string,
  formFactor: AuditFormFactor,
  extraHeaders?: Record<string, string>,
) {
  const outputPath = join(
    tmpdir(),
    `lighthouse-${Date.now()}-${Math.random().toString(36).slice(2)}.json`,
  );

  const args = buildLighthouseArgs(url, formFactor, outputPath, { extraHeaders });

  try {
    await execFileAsync("npx", ["lighthouse", ...args], {
      env: process.env,
      maxBuffer: 20 * 1024 * 1024,
    });

    return await readLighthouseOutput(outputPath);
  } catch (error) {
    try {
      return await readLighthouseOutput(outputPath);
    } catch {
      throw new Error(formatExecError(error));
    }
  } finally {
    await unlink(outputPath).catch(() => undefined);
  }
}

async function processPendingRun() {
  const admin = createAdminClient();

  const { data: run, error: fetchError } = await admin
    .from("performance_audit_runs")
    .select("*")
    .eq("environment", "local")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (fetchError) {
    throw fetchError;
  }

  if (!run) {
    return false;
  }

  log(`Processing run ${run.id} (${run.page_ids.length} pages)`);

  await admin
    .from("performance_audit_runs")
    .update({
      status: "running",
      updated_at: new Date().toISOString(),
    })
    .eq("id", run.id);

  let completedCount = 0;
  let firstError: string | null = null;
  const formFactor = (run.form_factor as AuditFormFactor) ?? "mobile";

  for (const pageId of run.page_ids) {
    const page = getPageTargetById(pageId);
    if (!page) {
      const message = "Unknown page id in manifest.";
      log(`Failed ${pageId}: ${message}`);

      await upsertPerformanceAuditResult(admin, {
        run_id: run.id,
        page_id: pageId,
        environment: "local",
        form_factor: formFactor,
        label: pageId,
        category: "unknown",
        url: "",
        status: "failed",
        error_message: message,
      });
      completedCount += 1;
      continue;
    }

    const url = resolvePageUrl(page.path, "local");
    const auth = page.requiresAuth;
    let extraHeaders: Record<string, string> | undefined;

    if (auth !== "none") {
      const cookies = loadCookiesForPageAuth(auth, new URL(url).hostname);
      extraHeaders = { Cookie: buildCookieHeader(cookies) };
    }

    const authSuffix = auth === "none" ? "" : `, ${auth}`;
    log(`Auditing (${formFactor}${authSuffix}) ${url}`);

    try {
      const raw = await runLighthouse(url, formFactor, extraHeaders);
      const lighthousePayload =
        raw && typeof raw === "object" && "lhr" in raw
          ? (raw as { lhr: unknown }).lhr
          : raw;
      const metrics = normalizeLighthouseResult(
        lighthousePayload as Parameters<typeof normalizeLighthouseResult>[0],
      );

      await upsertPerformanceAuditResult(admin, {
        run_id: run.id,
        page_id: page.id,
        environment: "local",
        form_factor: formFactor,
        label: page.label,
        category: page.category,
        url,
        status: "success",
        ...metricsToResultRow(metrics),
        raw_report: raw,
      });

      log(
        `OK ${page.label}${metrics.performanceScore !== null ? ` — score ${metrics.performanceScore}` : ""}`,
      );
    } catch (error) {
      const message = formatExecError(error);

      if (!firstError) firstError = message;
      log(`Failed ${page.label}: ${message}`);

      await upsertPerformanceAuditResult(admin, {
        run_id: run.id,
        page_id: page.id,
        environment: "local",
        form_factor: formFactor,
        label: page.label,
        category: page.category,
        url,
        status: "failed",
        error_message: message,
      });
    }

    completedCount += 1;

    await admin
      .from("performance_audit_runs")
      .update({
        completed_count: completedCount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", run.id);
  }

  await admin
    .from("performance_audit_runs")
    .update({
      status: "completed",
      completed_count: completedCount,
      error_message: firstError,
      updated_at: new Date().toISOString(),
    })
    .eq("id", run.id);

  log(`Completed run ${run.id}`);
  return true;
}

async function main() {
  const watch = process.argv.includes("--watch");

  if (watch) {
    log("Watching for pending local performance audit runs...");
    while (true) {
      try {
        const processed = await processPendingRun();
        if (!processed) {
          await new Promise((resolve) => setTimeout(resolve, WATCH_INTERVAL_MS));
        }
      } catch (error) {
        console.error("Performance audit runner error:", error);
        await new Promise((resolve) => setTimeout(resolve, WATCH_INTERVAL_MS));
      }
    }
  }

  try {
    const processed = await processPendingRun();
    if (!processed) {
      log("No pending local performance audit runs.");
    }
  } catch (error) {
    console.error("Performance audit runner error:", error);
    process.exit(1);
  }
}

void main();
