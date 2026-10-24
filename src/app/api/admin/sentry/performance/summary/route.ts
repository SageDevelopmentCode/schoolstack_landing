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
  getSentryProjectId,
  parseSentryPerformanceEnvironment,
  queryDiscoverPerformance,
  resolvePerformanceQuery,
  type SentryPerformancePreset,
} from "@/lib/sentry/admin-api";
import { sentryApiErrorResponse } from "@/lib/sentry/sentry-admin-route-response";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admin/sentry/performance/summary";

const PRESETS = new Set<SentryPerformancePreset>([
  "parent_committees",
  "api_routes",
  "parent_portal",
  "custom",
]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const presetParam = searchParams.get("preset") ?? "parent_committees";
  const preset = PRESETS.has(presetParam as SentryPerformancePreset)
    ? (presetParam as SentryPerformancePreset)
    : "parent_committees";
  const customQuery = searchParams.get("query") ?? undefined;
  const statsPeriod = searchParams.get("statsPeriod") ?? undefined;
  const environment = parseSentryPerformanceEnvironment(
    searchParams.get("environment"),
  );
  const query = resolvePerformanceQuery(preset, customQuery);
  const period = statsPeriod ?? "7d";

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

    const config = getSentryAdminConfig();
    const projectId = await getSentryProjectId(config);
    const exploreUrl = buildSentryPerformanceExploreUrl(
      config,
      query,
      projectId,
      environment,
    );

    const rows = await queryDiscoverPerformance({
      preset,
      customQuery,
      statsPeriod,
      environment,
    });

    return NextResponse.json({
      preset,
      query,
      statsPeriod: period,
      environment,
      projectSlug: config.projectSlug,
      rows,
      exploreUrl,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    let exploreUrl: string | undefined;
    if (isSentryAdminConfigured()) {
      try {
        const config = getSentryAdminConfig();
        const projectId = await getSentryProjectId(config);
        exploreUrl = buildSentryPerformanceExploreUrl(
          config,
          query,
          projectId,
          environment,
        );
      } catch {
        exploreUrl = undefined;
      }
    }
    const sentryResponse = sentryApiErrorResponse(err, {
      preset,
      query,
      statsPeriod: period,
      environment,
      rows: [],
      exploreUrl,
    });
    if (sentryResponse) return sentryResponse;
    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to load Sentry performance summary.",
      cause: err,
    });
  }
}
