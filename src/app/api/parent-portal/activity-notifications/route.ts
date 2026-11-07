import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { fetchParentActivityNotifications } from "@/lib/parent-portal/parent-activity-notifications";
import { resolveParentNotificationContextForApi } from "@/lib/parent-portal/parent-notification-context";
import { parentPortalAccessAllowsNotificationContext } from "@/lib/parent-portal/parent-portal-access-rpc";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/activity-notifications";
const DEFAULT_LIMIT = 15;
const MAX_LIMIT = 30;

function parseLimit(value: string | null): number {
  if (!value) return DEFAULT_LIMIT;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return DEFAULT_LIMIT;
  return Math.min(parsed, MAX_LIMIT);
}

export const GET = withParentPortalRoute(
  {
    route: ROUTE,
    // Access depends on the notification context (main portal or one program), checked below.
    enforceAccess: false,
    missingOrganizationMessage: "organizationId and slug are required.",
    fallbackErrorMessage: "Failed to load activity notifications.",
  },
  async ({ request, supabase, organizationId, access, familyId }) => {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug")?.trim() ?? "";
    const cursor = searchParams.get("cursor")?.trim() || null;
    const limit = parseLimit(searchParams.get("limit"));
    if (!slug) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "organizationId and slug are required.",
        code: "missing_fields",
      });
    }

    try {
      const org = await fetchOrganizationWithSettings(slug);
      if (!org || org.id !== organizationId) {
        return apiError(ROUTE, {
          request,
          status: 404,
          error: "School not found.",
          code: "not_found",
        });
      }

      const notificationContext = await resolveParentNotificationContextForApi(supabase, {
        organizationId,
        slug,
        searchParams,
      });
      if (!notificationContext) {
        return apiError(ROUTE, {
          request,
          status: 404,
          error: "Program not found.",
          code: "not_found",
        });
      }

      if (!parentPortalAccessAllowsNotificationContext(access, notificationContext)) {
        return apiError(ROUTE, {
          request,
          status: 403,
          error: "You do not have access to the parent portal.",
          code: "forbidden",
        });
      }

      if (!familyId) {
        return apiError(ROUTE, {
          request,
          status: 404,
          error: "No family found for this account.",
          code: "family_not_found",
        });
      }

      const admin = createAdminClient();
      const page = await fetchParentActivityNotifications(admin, organizationId, slug, familyId, {
        cursor,
        limit,
        notificationContext,
        parentNavBasePath: notificationContext.parentNavBasePath,
        applyBasePath: notificationContext.applyBasePath,
      });

      return NextResponse.json(page);
    } catch (error) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: "Failed to load activity notifications.",
        code: "internal_error",
        cause: error,
      });
    }
  },
);
