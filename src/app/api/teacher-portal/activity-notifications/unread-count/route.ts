import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { fetchUnreadTeacherActivityNotificationCount } from "@/lib/school-teacher/activity-notifications";
import {
  getStaffMemberIdForUser,
  requireTeacherPortalUser,
  TeacherPortalAuthError,
} from "@/lib/staff/teacher-portal-access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/teacher-portal/activity-notifications/unread-count";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

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

    const user = await requireTeacherPortalUser(supabase, organizationId);
    const staffMemberId = await getStaffMemberIdForUser(
      supabase,
      user.id,
      organizationId,
    );

    if (!staffMemberId) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Staff profile not found.",
        code: "staff_not_found",
      });
    }

    const admin = createAdminClient();
    const unreadCount = await fetchUnreadTeacherActivityNotificationCount(
      admin,
      user.id,
      organizationId,
      slug,
      staffMemberId,
    );

    return NextResponse.json({ unreadCount });
  } catch (error) {
    if (error instanceof TeacherPortalAuthError) {
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
      error: "Failed to load unread notification count.",
      code: "internal_error",
      cause: error,
    });
  }
}
