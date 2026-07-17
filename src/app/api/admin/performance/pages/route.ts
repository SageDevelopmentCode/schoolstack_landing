import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requirePlatformAdminUser } from "@/lib/admin/require-platform-admin-api";
import { AuthError } from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import {
  getPerformancePageManifest,
  resolvePageUrl,
} from "@/lib/performance/page-manifest";
import type { AuditEnvironment } from "@/lib/performance/types";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admin/performance/pages";

type LatestResultSummary = {
  id: string;
  runId: string;
  status: string;
  skipReason: string | null;
  errorMessage: string | null;
  performanceScore: number | null;
  fcpMs: number | null;
  lcpMs: number | null;
  tbtMs: number | null;
  cls: number | null;
  speedIndexMs: number | null;
  createdAt: string;
};

async function loadLatestResults(environment: AuditEnvironment) {
  const admin = createAdminClient();

  const { data: runs, error: runsError } = await admin
    .from("performance_audit_runs")
    .select("id")
    .eq("environment", environment)
    .order("created_at", { ascending: false })
    .limit(200);

  if (runsError) throw runsError;

  const runIds = (runs ?? []).map((run) => run.id);
  if (!runIds.length) return new Map<string, LatestResultSummary>();

  const { data: results, error: resultsError } = await admin
    .from("performance_audit_results")
    .select(
      "id, run_id, page_id, status, skip_reason, error_message, performance_score, fcp_ms, lcp_ms, tbt_ms, cls, speed_index_ms, created_at",
    )
    .in("run_id", runIds)
    .order("created_at", { ascending: false });

  if (resultsError) throw resultsError;

  const latestByPage = new Map<string, LatestResultSummary>();

  for (const row of results ?? []) {
    if (latestByPage.has(row.page_id)) continue;
    latestByPage.set(row.page_id, {
      id: row.id,
      runId: row.run_id,
      status: row.status,
      skipReason: row.skip_reason,
      errorMessage: row.error_message,
      performanceScore: row.performance_score,
      fcpMs: row.fcp_ms,
      lcpMs: row.lcp_ms,
      tbtMs: row.tbt_ms,
      cls: row.cls,
      speedIndexMs: row.speed_index_ms,
      createdAt: row.created_at,
    });
  }

  return latestByPage;
}

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    await requirePlatformAdminUser(supabase);

    const url = new URL(request.url);
    const environmentParam = url.searchParams.get("environment");
    const environment: AuditEnvironment =
      environmentParam === "local" ? "local" : "production";

    const admin = createAdminClient();
    const [{ count: pendingLocalRuns }, productionLatest, localLatest] =
      await Promise.all([
        admin
          .from("performance_audit_runs")
          .select("*", { count: "exact", head: true })
          .eq("environment", "local")
          .eq("status", "pending"),
        loadLatestResults("production"),
        loadLatestResults("local"),
      ]);

    const latest =
      environment === "local" ? localLatest : productionLatest;

    const pages = getPerformancePageManifest().map((page) => ({
      ...page,
      url: resolvePageUrl(page.path, environment),
      latestResult: latest.get(page.id) ?? null,
    }));

    return NextResponse.json({
      environment,
      pages,
      pendingLocalRuns: pendingLocalRuns ?? 0,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return apiError(ROUTE, {
        status: error.status,
        error: error.message,
        code: error.code,
        cause: error,
      });
    }

    return apiError(ROUTE, {
      status: 500,
      error: "Failed to load performance pages.",
      code: "internal_error",
      cause: error,
    });
  }
}
