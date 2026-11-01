import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { portalRouteErrorStatus } from "@/lib/api/portal-route-errors";
import {
  assertTeacherCanAccessThread,
  getStaffMemberIdForUser,
  getThreadDetail,
  requireTeacherPortalUser,
} from "@/lib/messages/api-helpers";
import { scheduleMarkThreadReadAfterResponse } from "@/lib/messages/schedule-mark-thread-read";
import { TeacherPortalAuthError } from "@/lib/staff/teacher-portal-access";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/teacher-portal/messages/threads/[threadId]";

type RouteContext = { params: Promise<{ threadId: string }> };

export async function GET(request: Request, context: RouteContext) {
  const supabase = await createClientFromRequest(request);
  const { threadId } = await context.params;
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";
  const organizationSlug = searchParams.get("organizationSlug")?.trim() ?? "";
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
    const user = await requireTeacherPortalUser(supabase, organizationId, request);
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

    const readCutoffAt = new Date().toISOString();
    const thread = await getThreadDetail(
      admin,
      organizationId,
      threadId,
      user.id,
      `${schoolName} Office`,
      "teacher",
      { currentStaffMemberId: staffMemberId },
    );

    if (!thread) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Thread not found.",
        code: "not_found",
      });
    }

    scheduleMarkThreadReadAfterResponse({
      admin,
      threadId,
      userId: user.id,
      lastReadAt: readCutoffAt,
      organizationId,
      organizationName: schoolName,
      organizationSlug: organizationSlug || undefined,
      surface: "teacher_portal",
      operation: "teacher_portal_messages_mark_thread_read",
      actor: { type: "teacher", userId: user.id, email: user.email },
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

    const resolved = portalRouteErrorStatus(err, "Failed to load thread.");
    return apiError(ROUTE, {
      request,
      status: resolved.status,
      error: resolved.message,
      code: resolved.code,
      cause: err,
    });
  }
}
