import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { portalRouteErrorStatus } from "@/lib/api/portal-route-errors";
import {
  assertParentCanAccessThread,
  userHasEnrolledAccess,
} from "@/lib/messages/api-helpers";
import { editMessageForViewer } from "@/lib/messages/api-helpers-server";
import { parseMessagePatchRequest } from "@/lib/messages/parse-message-patch-request";
import { createClientFromRequest, getUserFromRequest, signedInErrorForRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE =
  "/api/parent-portal/messages/threads/[threadId]/messages/[messageId]";

type RouteContext = { params: Promise<{ threadId: string; messageId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const supabase = await createClientFromRequest(request);
  const { threadId, messageId } = await context.params;

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
    await assertParentCanAccessThread(
      admin,
      supabase,
      organizationId,
      user.id,
      threadId,
    );

    const message = await editMessageForViewer(admin, {
      organizationId,
      threadId,
      messageId,
      body: messageBody,
      userId: user.id,
      viewer: "parent",
      schoolOfficeLabel: `${schoolName} Office`,
    });

    return NextResponse.json({ message });
  } catch (err) {
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
