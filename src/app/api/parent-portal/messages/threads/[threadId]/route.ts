import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  assertParentCanAccessThread,
  getThreadDetail,
  markThreadRead,
  userHasEnrolledAccess,
} from "@/lib/messages/api-helpers";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/parent-portal/messages/threads/[threadId]";

type RouteContext = { params: Promise<{ threadId: string }> };

export async function GET(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
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

    const thread = await getThreadDetail(
      admin,
      organizationId,
      threadId,
      user.id,
      `${schoolName} Office`,
      "parent",
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
      console.error("[parent-portal/messages] markThreadRead failed:", readErr);
    });
    return NextResponse.json({ thread });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load thread.";
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
