/**
 * Upload Lighthouse CI filesystem results to Supabase performance tables.
 *
 * Usage:
 *   npm run performance:ci:upload
 *
 * Skips gracefully when Supabase credentials are not configured.
 */

import { readFile, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { config } from "dotenv";
import {
  metricsToResultRow,
  upsertPerformanceAuditResult,
} from "@/lib/performance/api-helpers";
import {
  getPerformancePageManifest,
  resolvePageUrl,
} from "@/lib/performance/page-manifest";
import { normalizeLighthouseResult } from "@/lib/performance/lighthouse-parse";
import type { AuditFormFactor } from "@/lib/performance/types";
import { createAdminClient } from "@/utils/supabase/admin";

config({ path: resolve(process.cwd(), ".env.local") });

const OUTPUT_DIR = resolve(process.cwd(), ".lighthouseci");

type LhciManifestEntry = {
  url?: string;
  jsonPath?: string;
  isRepresentativeRun?: boolean;
};

function log(message: string) {
  console.log(`[performance:ci:upload] ${message}`);
}

function resolveFormFactor(): AuditFormFactor {
  return process.env.PERFORMANCE_FORM_FACTOR === "desktop" ? "desktop" : "mobile";
}

function normalizeUrl(url: string) {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    if (parsed.pathname.length > 1 && parsed.pathname.endsWith("/")) {
      parsed.pathname = parsed.pathname.slice(0, -1);
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

function findPageForUrl(url: string) {
  const normalized = normalizeUrl(url);
  const manifest = getPerformancePageManifest();

  return manifest.find((page) => {
    const pageUrl = normalizeUrl(resolvePageUrl(page.path, "local"));
    return pageUrl === normalized;
  });
}

async function loadManifestEntries(): Promise<LhciManifestEntry[]> {
  const manifestPath = join(OUTPUT_DIR, "manifest.json");

  try {
    const raw = await readFile(manifestPath, "utf8");
    const parsed = JSON.parse(raw) as LhciManifestEntry[] | { entries?: LhciManifestEntry[] };

    if (Array.isArray(parsed)) return parsed;
    if (Array.isArray(parsed.entries)) return parsed.entries;
  } catch {
    // Fall back to scanning JSON files below.
  }

  const files = await readdir(OUTPUT_DIR);
  const entries: LhciManifestEntry[] = [];

  for (const file of files) {
    if (!file.endsWith(".json") || file === "manifest.json" || file === "links.json") {
      continue;
    }

    const jsonPath = join(OUTPUT_DIR, file);
    try {
      const payload = JSON.parse(await readFile(jsonPath, "utf8")) as {
        requestedUrl?: string;
        finalUrl?: string;
        lhr?: { requestedUrl?: string; finalUrl?: string };
      };

      const url =
        payload.requestedUrl ??
        payload.finalUrl ??
        payload.lhr?.requestedUrl ??
        payload.lhr?.finalUrl;

      if (url) {
        entries.push({ url, jsonPath: file, isRepresentativeRun: true });
      }
    } catch {
      // ignore invalid json
    }
  }

  return entries;
}

async function loadLighthouseReport(jsonPath: string) {
  const absolutePath = jsonPath.startsWith("/")
    ? jsonPath
    : join(OUTPUT_DIR, jsonPath);

  const raw = JSON.parse(await readFile(absolutePath, "utf8")) as {
    lhr?: unknown;
    requestedUrl?: string;
    finalUrl?: string;
    categories?: unknown;
    audits?: unknown;
  };

  if (raw.lhr && typeof raw.lhr === "object") {
    return raw.lhr;
  }

  if (raw.categories || raw.audits) {
    return raw;
  }

  throw new Error(`Unrecognized Lighthouse report format: ${jsonPath}`);
}

async function main() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    log("Supabase credentials not configured — skipping upload.");
    return;
  }

  const entries = await loadManifestEntries();
  const representative = entries.filter((entry) => entry.isRepresentativeRun !== false);

  if (!representative.length) {
    log("No Lighthouse CI reports found in .lighthouseci — skipping upload.");
    return;
  }

  const admin = createAdminClient();
  const formFactor = resolveFormFactor();
  const commit = process.env.GITHUB_SHA?.slice(0, 7) ?? "local";
  const branch = process.env.GITHUB_REF_NAME ?? "unknown";
  const sourceRef = `${commit} on ${branch}`;

  let uploadedCount = 0;

  for (const entry of representative) {
    if (!entry.url || !entry.jsonPath) continue;

    const page = findPageForUrl(entry.url);
    if (!page) {
      log(`No manifest page for ${entry.url} — skipping.`);
      continue;
    }

    const url = resolvePageUrl(page.path, "local");

    try {
      const lighthousePayload = await loadLighthouseReport(entry.jsonPath);
      const metrics = normalizeLighthouseResult(
        lighthousePayload as Parameters<typeof normalizeLighthouseResult>[0],
      );

      await upsertPerformanceAuditResult(admin, {
        page_id: page.id,
        environment: "ci",
        form_factor: formFactor,
        label: page.label,
        category: page.category,
        url,
        status: "success",
        source_ref: sourceRef,
        ...metricsToResultRow(metrics),
        raw_report: lighthousePayload,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to parse Lighthouse report.";

      await upsertPerformanceAuditResult(admin, {
        page_id: page.id,
        environment: "ci",
        form_factor: formFactor,
        label: page.label,
        category: page.category,
        url,
        status: "failed",
        source_ref: sourceRef,
        error_message: message,
      });
    }

    uploadedCount += 1;
  }

  if (!uploadedCount) {
    log("No manifest matches for Lighthouse CI URLs — skipping upload.");
    return;
  }

  log(`Upserted ${uploadedCount} result(s) for CI (${formFactor}).`);
}

void main().catch((error) => {
  console.error("[performance:ci:upload] Failed:", error);
  process.exit(1);
});
