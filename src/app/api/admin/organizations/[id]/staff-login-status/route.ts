import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requirePlatformAdminUser } from "@/lib/admin/require-platform-admin-api";
import { AuthError } from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import { listStaffMembers } from "@/lib/staff/staff-members";
import {
  listStaffMembersWithLoginStatus,
  summarizeStaffPortalLoginStatus,
} from "@/lib/staff/staff-portal-login-status";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admin/organizations/[id]/staff-login-status";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { id: organizationId } = await context.params;

  try {
    await requirePlatformAdminUser(supabase);

    const admin = createAdminClient();
    const staffMembers = await listStaffMembersWithLoginStatus(
      admin,
      organizationId,
      listStaffMembers,
    );

    return NextResponse.json({
      staffMembers,
      summary: summarizeStaffPortalLoginStatus(staffMembers),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return apiError(ROUTE, {
        status: error.status,
        error: error.message,
        code: error.code,
        cause: error,
      });
    }

    return apiError(ROUTE, {
      status: 500,
      error: "Failed to load staff portal sign-in status.",
      code: "internal_error",
      cause: error,
    });
  }
}
