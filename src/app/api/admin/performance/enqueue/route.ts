import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requirePlatformAdminUser } from "@/lib/admin/require-platform-admin-api";
import { AuthError } from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import { parseFormFactor, parsePageIds } from "@/lib/performance/api-helpers";
import { filterPagesForRun } from "@/lib/performance/page-manifest";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admin/performance/enqueue";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    const user = await requirePlatformAdminUser(supabase);
    const body = (await request.json()) as {
      pageIds?: unknown;
      formFactor?: unknown;
    };

    const formFactor = parseFormFactor(body.formFactor) ?? "mobile";
    const pageIds = parsePageIds(body.pageIds);
    const pages = filterPagesForRun(pageIds);

    if (!pages.length) {
      return apiError(ROUTE, {
        status: 400,
        error: "No pages selected for audit.",
        code: "no_pages",
      });
    }

    const admin = createAdminClient();
    const now = new Date().toISOString();

    const { data: run, error } = await admin
      .from("performance_audit_runs")
      .insert({
        environment: "local",
        status: "pending",
        triggered_by: user.id,
        page_ids: pages.map((page) => page.id),
        form_factor: formFactor,
        completed_count: 0,
        updated_at: now,
      })
      .select("*")
      .single();

    if (error || !run) {
      return apiError(ROUTE, {
        status: 500,
        error: error?.message ?? "Failed to enqueue local audit run.",
        cause: error,
      });
    }

    return NextResponse.json({ run });
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
      error: "Failed to enqueue local performance audit.",
      code: "internal_error",
      cause: error,
    });
  }
}
