import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requirePlatformAdminUser } from "@/lib/admin/require-platform-admin-api";
import { getPlatformSupportThread } from "@/lib/admin/platform-support-messages";
import { AuthError } from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import { PortalRouteError } from "@/lib/api/portal-route-errors";
import { markThreadRead } from "@/lib/messages/threads";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admin/support-messages/[threadId]/read";

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
    const admin = createAdminClient();
    await getPlatformSupportThread(admin, threadId, user.id);
    await markThreadRead(admin, threadId, user.id);
    return NextResponse.json({ ok: true });
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
      error: "Failed to mark support conversation read.",
      code: "internal_error",
      cause: error,
    });
  }
}
