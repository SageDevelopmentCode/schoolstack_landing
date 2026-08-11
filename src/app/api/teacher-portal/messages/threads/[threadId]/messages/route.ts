import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  assertTeacherCanAccessThread,
  getStaffMemberIdForUser,
  requireTeacherPortalUser,
  sendMessageForViewer,
} from "@/lib/messages/api-helpers";
import { parseMessagePostRequest } from "@/lib/messages/parse-message-post-request";
import { MAX_MESSAGE_ATTACHMENTS } from "@/lib/messages/message-attachment-storage";
import { TeacherPortalAuthError } from "@/lib/staff/teacher-portal-access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/teacher-portal/messages/threads/[threadId]/messages";

type RouteContext = { params: Promise<{ threadId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
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

    const message = err instanceof Error ? err.message : "Failed to send message.";
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
