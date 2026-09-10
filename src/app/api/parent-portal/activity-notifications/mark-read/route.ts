import { NextResponse } from "next/server";
import { userHasEnrolledAccess } from "@/lib/admissions/parent-portal-access";
import { apiError } from "@/lib/api/route-errors";
import { markParentActivityNotificationsRead } from "@/lib/parent-portal/parent-activity-notifications";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClientFromRequest } from "@/lib/supabase/request-client";

const ROUTE = "/api/parent-portal/activity-notifications/mark-read";

export async function POST(request: Request) {
  const supabase = await createClientFromRequest(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError(ROUTE, {
      request,
      status: 401,
      error: "You must be signed in.",
      code: "unauthorized",
    });
  }

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
    const hasAccess = await userHasEnrolledAccess(
      supabase,
      user.id,
      organizationId,
    );
    if (!hasAccess) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "You do not have access to the parent portal.",
        code: "forbidden",
      });
    }

    const admin = createAdminClient();
    const lastReadAt = await markParentActivityNotificationsRead(
      admin,
      user.id,
      organizationId,
    );

    return NextResponse.json({ unreadCount: 0, lastReadAt });
  } catch (error) {
    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to mark activity notifications as read.",
      code: "internal_error",
      cause: error,
    });
  }
}
