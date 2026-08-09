import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  assertTeacherCanAccessThread,
  getStaffMemberIdForUser,
  getThreadDetail,
  markThreadRead,
  requireTeacherPortalUser,
} from "@/lib/messages/api-helpers";
import { TeacherPortalAuthError } from "@/lib/staff/teacher-portal-access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/teacher-portal/messages/threads/[threadId]";

type RouteContext = { params: Promise<{ threadId: string }> };

export async function GET(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { threadId } = await context.params;
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";
  const schoolName = searchParams.get("schoolName")?.trim() ?? "School";

  if (!organizationId || !threadId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId is required.",
      code: "missing_fields",
    });
  }

  try {
    const user = await requireTeacherPortalUser(supabase, organizationId);
    const staffMemberId = await getStaffMemberIdForUser(
      supabase,
      user.id,
      organizationId,
    );

    if (!staffMemberId) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "Staff profile not found.",
        code: "forbidden",
      });
    }

    const admin = createAdminClient();
    await assertTeacherCanAccessThread(
      admin,
      organizationId,
      staffMemberId,
      threadId,
    );

    const thread = await getThreadDetail(
      admin,
      organizationId,
      threadId,
      user.id,
      `${schoolName} Office`,
      "teacher",
    );

    if (!thread) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Thread not found.",
        code: "not_found",
      });
    }

    void markThreadRead(admin, threadId, user.id).catch((readErr) => {
      console.error("[teacher-portal/messages] markThreadRead failed:", readErr);
    });
    return NextResponse.json({ thread });
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

    const message = err instanceof Error ? err.message : "Failed to load thread.";
    const status = message.includes("access") ? 403 : 500;
    return apiError(ROUTE, {
      request,
      status,
      error: message,
      code: status === 403 ? "forbidden" : "internal_error",
      cause: err,
    });
  }
}
