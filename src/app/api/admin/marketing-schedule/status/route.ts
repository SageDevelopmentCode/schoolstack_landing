import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requirePlatformAdminUser } from "@/lib/admin/require-platform-admin-api";
import { AuthError } from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import { listSchedulePostStatuses } from "@/lib/marketing/schedule-post-status";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admin/marketing-schedule/status";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    await requirePlatformAdminUser(supabase, request);
    const admin = createAdminClient();
    const statuses = await listSchedulePostStatuses(admin);
    return NextResponse.json({ statuses });
  } catch (error) {
    if (error instanceof AuthError) {
      return apiError(ROUTE, { request, status: error.status, error: error.message, code: error.code, cause: error });
    }
    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to load the posting schedule status.",
      code: "internal_error",
      cause: error,
    });
  }
}
