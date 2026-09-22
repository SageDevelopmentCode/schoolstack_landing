import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { reportOperationalError } from "@/lib/operational-errors";
import {
  getThreadDetail,
  markThreadRead,
  requireSchoolAdminUser,
} from "@/lib/messages/api-helpers";
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

    void markThreadRead(admin, threadId, user.id).catch((readErr) => {
      void reportOperationalError({
        supabase: admin,
        surface: "school_admin",
        organizationId,
        operation: "school_admin_messages_mark_thread_read",
        error: "Failed to mark thread read.",
      cause: readErr,
        entityType: "message_thread",
        entityId: threadId,
        notify: true,
        actor: { type: "school_admin", userId: user.id, email: user.email },
      });
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

    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to load thread.",
      cause: err,
      code: "internal_error",
    });
  }
}
