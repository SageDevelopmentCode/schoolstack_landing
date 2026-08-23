import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { markThreadRead, assertParentCanAccessThread, userHasEnrolledAccess } from "@/lib/messages/api-helpers";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/messages/threads/[threadId]/read";

type RouteContext = { params: Promise<{ threadId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const supabase = await createClientFromRequest(request);
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
    const body = (await request.json()) as { organizationId?: string };
    const organizationId = body.organizationId?.trim() ?? "";

    if (!organizationId) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "organizationId is required.",
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
    await markThreadRead(admin, threadId, user.id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiError(ROUTE, {
      request,
      status: 500,
      error: err instanceof Error ? err.message : "Failed to mark thread read.",
      code: "internal_error",
      cause: err,
    });
  }
}
