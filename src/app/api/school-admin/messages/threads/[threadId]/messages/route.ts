import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  getStaffMemberIdForUser,
  requireSchoolAdminUser,
  sendMessageForViewer,
} from "@/lib/messages/api-helpers";
import { parseMessagePostRequest } from "@/lib/messages/parse-message-post-request";
import { MAX_MESSAGE_ATTACHMENTS } from "@/lib/messages/message-attachment-storage";
import { SchoolAdminAuthError } from "@/lib/school-admin/access";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/school-admin/messages/threads/[threadId]/messages";

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

    const user = await requireSchoolAdminUser(supabase, organizationId, request);
    const staffMemberId = await getStaffMemberIdForUser(
      supabase,
      user.id,
      organizationId,
    );

    const admin = createAdminClient();
    const message = await sendMessageForViewer(admin, {
      organizationId,
      organizationSlug: organizationSlug || organizationId,
      threadId,
      body: messageBody,
      files,
      userId: user.id,
      viewer: "admin",
      staffMemberId,
      schoolName,
      schoolOfficeLabel: `${schoolName} Office`,
    });

    return NextResponse.json({ message });
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
      error: err instanceof Error ? err.message : "Failed to send message.",
      code: "internal_error",
      cause: err,
    });
  }
}
