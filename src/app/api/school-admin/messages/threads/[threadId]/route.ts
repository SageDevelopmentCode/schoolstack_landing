import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  getThreadDetail,
  markThreadRead,
  requireSchoolAdminUser,
} from "@/lib/messages/api-helpers";
import { SchoolAdminAuthError } from "@/lib/school-admin/access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/school-admin/messages/threads/[threadId]";

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

  try {
    const user = await requireSchoolAdminUser(supabase, organizationId);
    const admin = createAdminClient();

    const thread = await getThreadDetail(
      admin,
      organizationId,
      threadId,
      user.id,
      `${schoolName} Office`,
      "admin",
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
      console.error("[school-admin/messages] markThreadRead failed:", readErr);
    });
    return NextResponse.json({ thread });
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
      error: err instanceof Error ? err.message : "Failed to load thread.",
      code: "internal_error",
      cause: err,
    });
  }
}
