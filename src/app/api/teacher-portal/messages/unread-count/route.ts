import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { getTeacherMessagesUnreadCount } from "@/lib/messages/unread-count-api";
import { requireTeacherPortalUser } from "@/lib/staff/teacher-portal-access";
import { TeacherPortalAuthError } from "@/lib/staff/teacher-portal-access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/teacher-portal/messages/unread-count";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const url = new URL(request.url);
  const organizationId = url.searchParams.get("organizationId")?.trim() ?? "";
  const schoolName = url.searchParams.get("schoolName")?.trim() ?? "School";

  if (!organizationId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId is required.",
      code: "missing_fields",
    });
  }

  try {
    const user = await requireTeacherPortalUser(supabase, organizationId);
    const admin = createAdminClient();
    const unreadCount = await getTeacherMessagesUnreadCount(
      admin,
      supabase,
      organizationId,
      user.id,
      schoolName,
    );
    return NextResponse.json({ unreadCount });
  } catch (err) {
    if (err instanceof TeacherPortalAuthError) {
      return apiError(ROUTE, {
        request,
        status: err.status,
        error: err.message,
        code: err.code,
        cause: err,
      });
    }

    return apiError(ROUTE, {
      request,
      status: 500,
      error: err instanceof Error ? err.message : "Failed to load unread count.",
      code: "internal_error",
      cause: err,
    });
  }
}
