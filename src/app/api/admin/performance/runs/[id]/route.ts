import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requirePlatformAdminUser } from "@/lib/admin/require-platform-admin-api";
import { AuthError } from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admin/performance/runs/[id]";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { id } = await context.params;

  try {
    await requirePlatformAdminUser(supabase);

    const admin = createAdminClient();
    const { data: run, error: runError } = await admin
      .from("performance_audit_runs")
      .select("*")
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

    const { data: results, error: resultsError } = await admin
      .from("performance_audit_results")
      .select("*")
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
