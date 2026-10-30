import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requirePlatformAdminUser } from "@/lib/admin/require-platform-admin-api";
import { AuthError } from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import {
  getSentryAdminConfigForTarget,
  isSentryAdminConfigured,
  isSentryMobileAdminConfigured,
  type SentryProjectTarget,
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

const WEB_PRESETS = new Set<SentryPerformancePreset>([
  "parent_committees",
  "api_routes",
  "parent_portal",
  "custom",
]);

const MOBILE_PRESETS = new Set<SentryPerformancePreset>([
  "mobile_all_screens",
  "mobile_parent_portal",
  "mobile_teacher_portal",
  "mobile_school_admin",
  "mobile_api_client",
  "custom",
]);

const DEFAULT_PRESET: Record<SentryProjectTarget, SentryPerformancePreset> = {
  web: "parent_committees",
  mobile: "mobile_all_screens",
};

function parseProjectTarget(value: string | null): SentryProjectTarget {
  return value === "mobile" ? "mobile" : "web";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const project = parseProjectTarget(searchParams.get("project"));
  const presetParam = searchParams.get("preset");
  const defaultPreset = DEFAULT_PRESET[project];
  const allowedPresets = project === "mobile" ? MOBILE_PRESETS : WEB_PRESETS;
  const preset =
    presetParam && allowedPresets.has(presetParam as SentryPerformancePreset)
      ? (presetParam as SentryPerformancePreset)
      : defaultPreset;
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

    const configured =
      project === "mobile"
        ? isSentryMobileAdminConfigured()
        : isSentryAdminConfigured();

    if (!configured) {
      return NextResponse.json(
        {
          error:
            project === "mobile"
              ? "Mobile Sentry is not configured. Set SENTRY_MOBILE_PROJECT on this deployment."
              : "Sentry is not configured on this deployment.",
        },
        { status: 503 },
      );
    }

    const config = getSentryAdminConfigForTarget(project);
    const projectId = await getSentryProjectId(config);
    const exploreUrl = buildSentryPerformanceExploreUrl(
      config,
      query,
      projectId,
      environment,
    );

    const rows = await queryDiscoverPerformance({
      project,
      preset,
      customQuery,
      statsPeriod,
      environment,
    });

    return NextResponse.json({
      project,
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
    const configured =
      project === "mobile"
        ? isSentryMobileAdminConfigured()
        : isSentryAdminConfigured();
    if (configured) {
      try {
        const config = getSentryAdminConfigForTarget(project);
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
      project,
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
