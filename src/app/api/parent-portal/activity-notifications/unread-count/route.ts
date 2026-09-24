import { NextResponse } from "next/server";
import { getFamilyIdsForUser } from "@/lib/admissions/application-auth";
import { userHasAccessForNotificationContext } from "@/lib/admissions/program-parent-portal-access";
import { apiError } from "@/lib/api/route-errors";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { fetchUnreadParentActivityNotificationCount } from "@/lib/parent-portal/parent-activity-notifications";
import { resolveParentNotificationContextForApi } from "@/lib/parent-portal/parent-notification-context";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClientFromRequest, getUserFromRequest } from "@/lib/supabase/request-client";

const ROUTE = "/api/parent-portal/activity-notifications/unread-count";

export async function GET(request: Request) {
  const supabase = await createClientFromRequest(request);
  const {
    data: { user },
  } = await getUserFromRequest(supabase, request);

  if (!user) {
    return apiError(ROUTE, {
      request,
      status: 401,
      error: "You must be signed in.",
      code: "unauthorized",
    });
  }

  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";
  const slug = searchParams.get("slug")?.trim() ?? "";
  if (!organizationId || !slug) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId and slug are required.",
      code: "missing_fields",
    });
  }

  try {
    const org = await fetchOrganizationWithSettings(supabase, slug);
    if (!org || org.id !== organizationId) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "School not found.",
        code: "not_found",
      });
    }

    const notificationContext = await resolveParentNotificationContextForApi(
      supabase,
      { organizationId, slug, searchParams },
    );
    if (!notificationContext) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Program not found.",
        code: "not_found",
      });
    }

    const hasAccess = await userHasAccessForNotificationContext(
      supabase,
      user.id,
      organizationId,
      notificationContext,
    );
    if (!hasAccess) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "You do not have access to the parent portal.",
        code: "forbidden",
      });
    }

    const familyIds = await getFamilyIdsForUser(
      supabase,
      user.id,
      organizationId,
    );
    const familyId = familyIds[0];
    if (!familyId) {
      return NextResponse.json({ unreadCount: 0 });
    }

    const admin = createAdminClient();
    const unreadCount = await fetchUnreadParentActivityNotificationCount(
      admin,
      user.id,
      organizationId,
      slug,
      familyId,
      {
        notificationContext,
        parentNavBasePath: notificationContext.parentNavBasePath,
        applyBasePath: notificationContext.applyBasePath,
      },
    );

    return NextResponse.json({ unreadCount });
  } catch (error) {
    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to load unread notification count.",
      code: "internal_error",
      cause: error,
    });
  }
}
