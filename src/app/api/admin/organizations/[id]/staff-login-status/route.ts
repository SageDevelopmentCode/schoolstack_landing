import { NextResponse } from "next/server";
import { requirePlatformAdminUser } from "@/lib/admin/require-platform-admin-api";
import { AuthError } from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import { listStaffMembers } from "@/lib/staff/staff-members";
import {
  listStaffMembersWithLoginStatus,
  summarizeStaffPortalLoginStatus,
} from "@/lib/staff/staff-portal-login-status";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/admin/organizations/[id]/staff-login-status";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const supabase = await createClientFromRequest(request);
  const { id: organizationId } = await context.params;

  try {
    await requirePlatformAdminUser(supabase, request);

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
