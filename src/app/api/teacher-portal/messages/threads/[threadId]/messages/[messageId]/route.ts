import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { portalRouteErrorStatus } from "@/lib/api/portal-route-errors";
import {
  assertTeacherCanAccessThread,
  getStaffMemberIdForUser,
  requireTeacherPortalUser,
} from "@/lib/messages/api-helpers";
import { editMessageForViewer } from "@/lib/messages/api-helpers-server";
import { parseMessagePatchRequest } from "@/lib/messages/parse-message-patch-request";
import { TeacherPortalAuthError } from "@/lib/staff/teacher-portal-access";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE =
  "/api/teacher-portal/messages/threads/[threadId]/messages/[messageId]";

type RouteContext = { params: Promise<{ threadId: string; messageId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const supabase = await createClientFromRequest(request);
  const { threadId, messageId } = await context.params;

  try {
    const { organizationId, body: messageBody, schoolName } =
      await parseMessagePatchRequest(request);

    if (!organizationId || !messageBody.trim()) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "organizationId and message body are required.",
        code: "missing_fields",
      });
    }

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

    const message = await editMessageForViewer(admin, {
      organizationId,
      threadId,
      messageId,
      body: messageBody,
      userId: user.id,
      viewer: "teacher",
      schoolOfficeLabel: `${schoolName} Office`,
      currentStaffMemberId: staffMemberId,
    });

    return NextResponse.json({ message });
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

    const resolved = portalRouteErrorStatus(err, "Failed to edit message.");
    return apiError(ROUTE, {
      request,
      status: resolved.status,
      error: resolved.message,
      code: resolved.code,
      cause: err,
    });
  }
}
