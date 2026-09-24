import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { markTeacherActivityNotificationsRead } from "@/lib/school-teacher/activity-notifications";
import {
  TeacherPortalAuthError,
} from "@/lib/staff/teacher-portal-access";
import { requireTeacherPortalUser } from "@/lib/staff/teacher-portal-access-server";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/teacher-portal/activity-notifications/mark-read";

export async function POST(request: Request) {
  const supabase = await createClientFromRequest(request);

  let body: { organizationId?: string };
  try {
    body = (await request.json()) as { organizationId?: string };
  } catch {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Invalid JSON body.",
      code: "invalid_body",
    });
  }

  const organizationId = body.organizationId?.trim() ?? "";
  if (!organizationId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId is required.",
      code: "missing_fields",
    });
  }

  try {
    const user = await requireTeacherPortalUser(supabase, organizationId, request);
    const admin = createAdminClient();
    const lastReadAt = await markTeacherActivityNotificationsRead(
      admin,
      user.id,
      organizationId,
    );

    return NextResponse.json({ unreadCount: 0, lastReadAt });
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
      error: "Failed to mark activity notifications as read.",
      code: "internal_error",
      cause: error,
    });
  }
}
