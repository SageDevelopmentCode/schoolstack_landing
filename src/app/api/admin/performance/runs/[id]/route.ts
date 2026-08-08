import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requirePlatformAdminUser } from "@/lib/admin/require-platform-admin-api";
import { AuthError } from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admin/performance/runs/[id]";

const RUN_SUMMARY_COLUMNS =
  "id, environment, status, triggered_by, page_ids, form_factor, completed_count, error_message, created_at, updated_at";

const RESULT_LIST_COLUMNS =
  "id, run_id, page_id, label, category, url, status, skip_reason, error_message, performance_score, fcp_ms, lcp_ms, tbt_ms, cls, speed_index_ms, total_byte_weight, opportunities, created_at";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { id } = await context.params;

  try {
    await requirePlatformAdminUser(supabase);

    const url = new URL(request.url);
    const summary = url.searchParams.get("summary") === "1";
    const resultId = url.searchParams.get("resultId");

    const admin = createAdminClient();
    const { data: run, error: runError } = await admin
      .from("performance_audit_runs")
      .select(summary ? RUN_SUMMARY_COLUMNS : "*")
      .eq("id", id)
      .maybeSingle();

    if (runError) {
      return apiError(ROUTE, {
        status: 500,
        error: runError.message,
        cause: runError,
      });
    }

    if (!run) {
      return apiError(ROUTE, {
        status: 404,
        error: "Audit run not found.",
        code: "not_found",
      });
    }

    if (summary) {
      const { data: lastResult, error: lastResultError } = await admin
        .from("performance_audit_results")
        .select("label, created_at")
        .eq("run_id", id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lastResultError) {
        return apiError(ROUTE, {
          status: 500,
          error: lastResultError.message,
          cause: lastResultError,
        });
      }

      return NextResponse.json({
        run,
        results: lastResult ? [lastResult] : [],
      });
    }

    if (resultId) {
      const { data: result, error: resultError } = await admin
        .from("performance_audit_results")
        .select("*")
        .eq("run_id", id)
        .eq("id", resultId)
        .maybeSingle();

      if (resultError) {
        return apiError(ROUTE, {
          status: 500,
          error: resultError.message,
          cause: resultError,
        });
      }

      if (!result) {
        return apiError(ROUTE, {
          status: 404,
          error: "Audit result not found.",
          code: "not_found",
        });
      }

      return NextResponse.json({
        run,
        results: [result],
      });
    }

    const { data: results, error: resultsError } = await admin
      .from("performance_audit_results")
      .select(RESULT_LIST_COLUMNS)
      .eq("run_id", id)
      .order("created_at", { ascending: true });

    if (resultsError) {
      return apiError(ROUTE, {
        status: 500,
        error: resultsError.message,
        cause: resultsError,
      });
    }

    return NextResponse.json({
      run,
      results: results ?? [],
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
      error: "Failed to load audit run.",
      code: "internal_error",
      cause: error,
    });
  }
}
