import { NextResponse } from "next/server";
import { requirePlatformAdminUser } from "@/lib/admin/require-platform-admin-api";
import { AuthError } from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import type { ActivityDatePreset } from "@/lib/activity-log";
import {
  fetchMobileFeatureAnalytics,
  type MobileFeatureAnalyticsSurface,
} from "@/lib/mobile-feature-analytics";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/admin/mobile-feature-analytics";

const VALID_PRESETS = new Set<ActivityDatePreset>([
  "today",
  "7d",
  "30d",
  "all",
]);

const VALID_SURFACES = new Set<MobileFeatureAnalyticsSurface>([
  "parent_portal",
  "teacher_portal",
  "school_admin",
]);

export async function GET(request: Request) {
  const supabase = await createClientFromRequest(request);

  try {
    await requirePlatformAdminUser(supabase, request);

    const { searchParams } = new URL(request.url);
    const presetParam = searchParams.get("preset")?.trim() ?? "7d";
    const datePreset = VALID_PRESETS.has(presetParam as ActivityDatePreset)
      ? (presetParam as ActivityDatePreset)
      : "7d";

    const organizationId = searchParams.get("organizationId")?.trim() || undefined;

    const surfaceParam = searchParams.get("surface")?.trim();
    const surface =
      surfaceParam && VALID_SURFACES.has(surfaceParam as MobileFeatureAnalyticsSurface)
        ? (surfaceParam as MobileFeatureAnalyticsSurface)
        : undefined;

    const admin = createAdminClient();
    const result = await fetchMobileFeatureAnalytics(admin, {
      datePreset,
      organizationId,
      surface,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AuthError) {
      return apiError(ROUTE, {
        request,
        status: error.status,
        error: error.message,
        code: error.code,
        cause: error,
      });
    }

    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to load mobile feature analytics.",
      code: "internal_error",
      cause: error,
    });
  }
}
