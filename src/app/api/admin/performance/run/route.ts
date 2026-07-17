import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requirePlatformAdminUser } from "@/lib/admin/require-platform-admin-api";
import { AuthError } from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import {
  metricsToResultRow,
  parseFormFactor,
  parsePageIds,
} from "@/lib/performance/api-helpers";
import {
  filterPagesForRun,
  resolvePageUrl,
  shouldSkipOnProduction,
} from "@/lib/performance/page-manifest";
import { runPageSpeedInsights, sleep } from "@/lib/performance/psi-client";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admin/performance/run";
const PSI_THROTTLE_MS = 2000;

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    const user = await requirePlatformAdminUser(supabase);
    const body = (await request.json()) as {
      environment?: string;
      pageIds?: unknown;
      formFactor?: unknown;
    };

    if (body.environment !== "production") {
      return apiError(ROUTE, {
        status: 400,
        error: "Only production audits can be run synchronously.",
        code: "invalid_environment",
      });
    }

    const formFactor = parseFormFactor(body.formFactor) ?? "mobile";
    const pageIds = parsePageIds(body.pageIds);
    const pages = filterPagesForRun(pageIds, { publicOnly: !pageIds?.length });

    if (!pages.length) {
      return apiError(ROUTE, {
        status: 400,
        error: "No pages selected for audit.",
        code: "no_pages",
      });
    }

    const admin = createAdminClient();
    const now = new Date().toISOString();

    const { data: run, error: runError } = await admin
      .from("performance_audit_runs")
      .insert({
        environment: "production",
        status: "running",
        triggered_by: user.id,
        page_ids: pages.map((page) => page.id),
        form_factor: formFactor,
        completed_count: 0,
        updated_at: now,
      })
      .select("*")
      .single();

    if (runError || !run) {
      return apiError(ROUTE, {
        status: 500,
        error: runError?.message ?? "Failed to create audit run.",
        cause: runError,
      });
    }

    let completedCount = 0;
    let firstError: string | null = null;

    for (const [index, page] of pages.entries()) {
      const url = resolvePageUrl(page.path, "production");

      if (shouldSkipOnProduction(page)) {
        await admin.from("performance_audit_results").insert({
          run_id: run.id,
          page_id: page.id,
          label: page.label,
          category: page.category,
          url,
          status: "skipped",
          skip_reason: "auth_required_on_production",
        });
        completedCount += 1;
        continue;
      }

      try {
        const { raw, metrics } = await runPageSpeedInsights(url, formFactor);

        await admin.from("performance_audit_results").insert({
          run_id: run.id,
          page_id: page.id,
          label: page.label,
          category: page.category,
          url,
          status: "success",
          ...metricsToResultRow(metrics),
          raw_report: raw,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Audit failed unexpectedly.";

        if (!firstError) firstError = message;

        await admin.from("performance_audit_results").insert({
          run_id: run.id,
          page_id: page.id,
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

      if (index < pages.length - 1) {
        await sleep(PSI_THROTTLE_MS);
      }
    }

    const finalStatus = "completed";

    const { data: updatedRun, error: updateError } = await admin
      .from("performance_audit_runs")
      .update({
        status: finalStatus,
        completed_count: completedCount,
        error_message: firstError,
        updated_at: new Date().toISOString(),
      })
      .eq("id", run.id)
      .select("*")
      .single();

    if (updateError) {
      return apiError(ROUTE, {
        status: 500,
        error: updateError.message,
        cause: updateError,
      });
    }

    const { data: results } = await admin
      .from("performance_audit_results")
      .select("*")
      .eq("run_id", run.id)
      .order("created_at", { ascending: true });

    return NextResponse.json({
      run: updatedRun,
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
      error: "Failed to run production performance audit.",
      code: "internal_error",
      cause: error,
    });
  }
}
