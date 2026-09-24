import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { portalRouteErrorStatus } from "@/lib/api/portal-route-errors";
import {
  assertParentCanAccessThread,
  userHasEnrolledAccess,
} from "@/lib/messages/api-helpers";
import { sendMessageForViewer } from "@/lib/messages/api-helpers-server";
import { parseMessagePostRequest } from "@/lib/messages/parse-message-post-request";
import { MAX_MESSAGE_ATTACHMENTS } from "@/lib/messages/message-attachment-storage";
import { activityClientMetadataFromRequest } from "@/lib/activity-client";
import { createClientFromRequest, getUserFromRequest, signedInErrorForRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/messages/threads/[threadId]/messages";

type RouteContext = { params: Promise<{ threadId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const supabase = await createClientFromRequest(request);
  const { threadId } = await context.params;

  const {
    data: { user },
    error: authError,
  } = await getUserFromRequest(supabase, request);

  if (!user) {
    return apiError(ROUTE, {
      request,
      status: 401,
      error: await signedInErrorForRequest(request, authError),
      code: "unauthorized",
    });
  }

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

    const hasAccess = await userHasEnrolledAccess(supabase, user.id, organizationId);
    if (!hasAccess) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "You do not have access to messages.",
        code: "forbidden",
      });
    }

    const admin = createAdminClient();
    const familyId = await assertParentCanAccessThread(
      admin,
      supabase,
      organizationId,
      user.id,
      threadId,
    );

    const message = await sendMessageForViewer(admin, {
      organizationId,
      organizationSlug: organizationSlug || organizationId,
      threadId,
      body: messageBody,
      files,
      userId: user.id,
      viewer: "parent",
      familyId,
      schoolName,
      schoolOfficeLabel: `${schoolName} Office`,
      activityMetadata: activityClientMetadataFromRequest(request),
    });

    return NextResponse.json({ message });
  } catch (err) {
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
