import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { portalRouteErrorStatus } from "@/lib/api/portal-route-errors";
import {
  assertSchoolAdminCanAccessThread,
  getThreadDetail,
  requireSchoolAdminUser,
} from "@/lib/messages/api-helpers";
import { scheduleMarkThreadReadAfterResponse } from "@/lib/messages/schedule-mark-thread-read";
import { SchoolAdminAuthError } from "@/lib/school-admin/access";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/school-admin/messages/threads/[threadId]";

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
    const user = await requireSchoolAdminUser(supabase, organizationId, request);
    const admin = createAdminClient();

    await assertSchoolAdminCanAccessThread(admin, organizationId, threadId);

    const readCutoffAt = new Date().toISOString();
    const thread = await getThreadDetail(
      admin,
      organizationId,
      threadId,
      user.id,
      `${schoolName} Office`,
      "admin",
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
      surface: "school_admin",
      operation: "school_admin_messages_mark_thread_read",
      actor: { type: "school_admin", userId: user.id, email: user.email },
    });
    return NextResponse.json({ thread });
  } catch (err) {
    if (err instanceof SchoolAdminAuthError) {
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
