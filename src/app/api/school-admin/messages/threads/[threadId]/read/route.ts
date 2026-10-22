import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { portalRouteErrorStatus } from "@/lib/api/portal-route-errors";
import {
  assertSchoolAdminCanAccessThread,
  markThreadRead,
  requireSchoolAdminUser,
} from "@/lib/messages/api-helpers";
import { SchoolAdminAuthError } from "@/lib/school-admin/access";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/school-admin/messages/threads/[threadId]/read";

type RouteContext = { params: Promise<{ threadId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const supabase = await createClientFromRequest(request);
  const { threadId } = await context.params;

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

    const user = await requireSchoolAdminUser(supabase, organizationId, request);
    const admin = createAdminClient();
    await assertSchoolAdminCanAccessThread(admin, organizationId, threadId);
    await markThreadRead(admin, threadId, user.id);

    return NextResponse.json({ ok: true });
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

    const resolved = portalRouteErrorStatus(err, "Failed to mark thread read.");
    return apiError(ROUTE, {
      request,
      status: resolved.status,
      error: resolved.message,
      code: resolved.code,
      cause: err,
    });
  }
}
