import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requirePlatformAdminUser } from "@/lib/admin/require-platform-admin-api";
import { listPlatformSupportConversations } from "@/lib/admin/platform-support-messages";
import { AuthError } from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admin/support-messages";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    const user = await requirePlatformAdminUser(supabase, request);
    const admin = createAdminClient();
    const conversations = await listPlatformSupportConversations(admin, user.id);
    return NextResponse.json({ conversations });
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

    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to load support conversations.",
      code: "internal_error",
      cause: error,
    });
  }
}
