import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requirePlatformAdminUser } from "@/lib/admin/require-platform-admin-api";
import { AuthError } from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import {
  getSentryAdminConfig,
  isSentryAdminConfigured,
} from "@/lib/sentry/admin-config";
import {
  buildSentryPerformanceExploreUrl,
  queryDiscoverPerformance,
  resolvePerformanceQuery,
  type SentryPerformancePreset,
} from "@/lib/sentry/admin-api";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admin/sentry/performance/summary";

const PRESETS = new Set<SentryPerformancePreset>([
  "parent_committees",
  "api_routes",
  "parent_portal",
  "custom",
]);

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    await requirePlatformAdminUser(supabase, request);

    if (!isSentryAdminConfigured()) {
      return NextResponse.json(
        { error: "Sentry is not configured on this deployment." },
        { status: 503 },
      );
    }

    const { searchParams } = new URL(request.url);
    const presetParam = searchParams.get("preset") ?? "parent_committees";
    const preset = PRESETS.has(presetParam as SentryPerformancePreset)
      ? (presetParam as SentryPerformancePreset)
      : "parent_committees";
    const customQuery = searchParams.get("query") ?? undefined;
    const statsPeriod = searchParams.get("statsPeriod") ?? undefined;

    const query = resolvePerformanceQuery(preset, customQuery);
    const rows = await queryDiscoverPerformance({
      preset,
      customQuery,
      statsPeriod,
    });

    const config = getSentryAdminConfig();
    return NextResponse.json({
      preset,
      query,
      statsPeriod: statsPeriod ?? "7d",
      rows,
      exploreUrl: buildSentryPerformanceExploreUrl(config, query),
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to load Sentry performance summary.",
      cause: err,
    });
  }
}
