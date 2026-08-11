import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  assertParentCanAccessThread,
  sendMessageForViewer,
  userHasEnrolledAccess,
} from "@/lib/messages/api-helpers";
import { parseMessagePostRequest } from "@/lib/messages/parse-message-post-request";
import { MAX_MESSAGE_ATTACHMENTS } from "@/lib/messages/message-attachment-storage";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/parent-portal/messages/threads/[threadId]/messages";

type RouteContext = { params: Promise<{ threadId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { threadId } = await context.params;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError(ROUTE, {
      request,
      status: 401,
      error: "You must be signed in.",
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
    });

    return NextResponse.json({ message });
  } catch (err) {
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
