import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { portalRouteErrorStatus } from "@/lib/api/portal-route-errors";
import {
  assertTeacherCanAccessThread,
  getStaffMemberIdForUser,
  requireTeacherPortalUser,
} from "@/lib/messages/api-helpers";
import { sendMessageForViewer } from "@/lib/messages/api-helpers-server";
import { parseMessagePostRequest } from "@/lib/messages/parse-message-post-request";
import { MAX_MESSAGE_ATTACHMENTS } from "@/lib/messages/message-attachment-storage";
import { TeacherPortalAuthError } from "@/lib/staff/teacher-portal-access";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/teacher-portal/messages/threads/[threadId]/messages";

type RouteContext = { params: Promise<{ threadId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const supabase = await createClientFromRequest(request);
  const { threadId } = await context.params;

  try {
    const parsed = await parseMessagePostRequest(request);
    const {
      organizationId,
      organizationSlug,
      schoolName,
      body: messageBody,
      files,
    } = parsed;

    if (!organizationId || (!messageBody && files.length === 0)) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "organizationId and message content are required.",
        code: "missing_fields",
      });
    }

    if (files.length > MAX_MESSAGE_ATTACHMENTS) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: `You can attach up to ${MAX_MESSAGE_ATTACHMENTS} files.`,
        code: "too_many_files",
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

    const message = await sendMessageForViewer(admin, {
      organizationId,
      organizationSlug: organizationSlug || organizationId,
      threadId,
      body: messageBody,
      files,
      userId: user.id,
      viewer: "teacher",
      staffMemberId,
      schoolName,
      schoolOfficeLabel: `${schoolName} Office`,
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

    const resolved = portalRouteErrorStatus(err, "Failed to send message.");
    return apiError(ROUTE, {
      request,
      status: resolved.status,
      error: resolved.message,
      code: resolved.code,
      cause: err,
    });
  }
}
