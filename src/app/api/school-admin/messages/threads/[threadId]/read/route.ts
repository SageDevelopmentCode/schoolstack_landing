import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { markThreadRead, requireSchoolAdminUser } from "@/lib/messages/api-helpers";
import { SchoolAdminAuthError } from "@/lib/school-admin/access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/school-admin/messages/threads/[threadId]/read";

type RouteContext = { params: Promise<{ threadId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
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

    const user = await requireSchoolAdminUser(supabase, organizationId);
    const admin = createAdminClient();
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

    return apiError(ROUTE, {
      request,
      status: 500,
      error: err instanceof Error ? err.message : "Failed to mark thread read.",
      code: "internal_error",
      cause: err,
    });
  }
}
