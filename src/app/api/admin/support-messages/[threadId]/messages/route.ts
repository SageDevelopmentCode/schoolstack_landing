import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requirePlatformAdminUser } from "@/lib/admin/require-platform-admin-api";
import { sendPlatformSupportReply } from "@/lib/admin/platform-support-messages";
import { AuthError } from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import { PortalRouteError } from "@/lib/api/portal-route-errors";
import { MAX_MESSAGE_ATTACHMENTS } from "@/lib/messages/message-attachment-storage";
import { parseMessagePostRequest } from "@/lib/messages/parse-message-post-request";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admin/support-messages/[threadId]/messages";

type RouteContext = { params: Promise<{ threadId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { threadId } = await context.params;

  if (!threadId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "threadId is required.",
      code: "missing_fields",
    });
  }

  try {
    const user = await requirePlatformAdminUser(supabase, request);
    const parsed = await parseMessagePostRequest(request);
    const messageBody = parsed.body;
    const files = parsed.files;

    if (!messageBody && files.length === 0) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Message cannot be empty.",
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

    const admin = createAdminClient();
    const message = await sendPlatformSupportReply(admin, {
      threadId,
      userId: user.id,
      body: messageBody,
      files,
    });
    return NextResponse.json({ message });
  } catch (error) {
    if (error instanceof AuthError) {
      return apiError(ROUTE, {
        request,
        status: error.status,
        error: error.message,
        code: error.code,
        cause: error,
      });
    }

    if (error instanceof PortalRouteError) {
      return apiError(ROUTE, {
        request,
        status: error.status,
        error: error.message,
        code: error.code,
        cause: error,
      });
    }

    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to send support reply.",
      code: "internal_error",
      cause: error,
    });
  }
}
