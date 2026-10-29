import { NextResponse } from "next/server";
import { mapMobileAnalyticsPortalFilter } from "@/lib/admin/mobile-push-analytics";
import { fetchAdminPushNotificationDeliveriesGlobal } from "@/lib/admin/push-notification-deliveries";
import { requirePlatformAdminUser } from "@/lib/admin/require-platform-admin-api";
import { AuthError } from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import type { ActivityDatePreset } from "@/lib/activity-log";
import { isMobilePushNotificationKind } from "@/lib/notifications/mobile-push-catalog";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/admin/mobile-push-analytics/deliveries";

const VALID_PRESETS = new Set<ActivityDatePreset>([
  "today",
  "7d",
  "30d",
  "all",
]);

const VALID_PORTAL_SURFACES = new Set([
  "",
  "parent_portal",
  "teacher_portal",
  "school_admin",
]);

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

function parseLimit(value: string | null): number {
  if (!value) return DEFAULT_LIMIT;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return DEFAULT_LIMIT;
  return Math.min(parsed, MAX_LIMIT);
}

export async function GET(request: Request) {
  const supabase = await createClientFromRequest(request);

  try {
    await requirePlatformAdminUser(supabase, request);

    const { searchParams } = new URL(request.url);
    const kindParam = searchParams.get("kind")?.trim() ?? "";
    if (!isMobilePushNotificationKind(kindParam)) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "kind must be a valid mobile push notification kind.",
        code: "invalid_kind",
      });
    }

    const presetParam = searchParams.get("preset")?.trim() ?? "7d";
    const datePreset = VALID_PRESETS.has(presetParam as ActivityDatePreset)
      ? (presetParam as ActivityDatePreset)
      : "7d";

    const organizationId = searchParams.get("organizationId")?.trim() || null;
    const cursor = searchParams.get("cursor")?.trim() || null;
    const limit = parseLimit(searchParams.get("limit"));

    const surfaceParam = searchParams.get("surface")?.trim() ?? "";
    const surfaceFilter = VALID_PORTAL_SURFACES.has(surfaceParam)
      ? (surfaceParam as "" | "parent_portal" | "teacher_portal" | "school_admin")
      : "";
    const recipientPortal = mapMobileAnalyticsPortalFilter(surfaceFilter) ?? null;

    const admin = createAdminClient();

    let organizationSlug: string | null = null;
    if (organizationId) {
      const { data: organization, error: organizationError } = await admin
        .from("organizations")
        .select("slug")
        .eq("id", organizationId)
        .maybeSingle();

      if (organizationError) {
        return apiError(ROUTE, {
          request,
          status: 500,
          error: "Failed to load push notification deliveries.",
          cause: organizationError,
        });
      }

      if (!organization?.slug) {
        return apiError(ROUTE, {
          request,
          status: 404,
          error: "Organization not found.",
          code: "organization_not_found",
        });
      }

      organizationSlug = String(organization.slug);
    }

    const page = await fetchAdminPushNotificationDeliveriesGlobal(admin, {
      organizationId,
      organizationSlug,
      notificationKind: kindParam,
      datePreset,
      recipientPortal,
      cursor,
      limit,
    });

    return NextResponse.json(page);
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
      error: "Failed to load push notification deliveries.",
      code: "internal_error",
      cause: error,
    });
  }
}
