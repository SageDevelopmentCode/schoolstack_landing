import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  listOrgParentPortalLoginStatus,
  summarizeParentPortalLoginStatus,
} from "@/lib/admissions/parent-portal-login-status";
import { apiError } from "@/lib/api/route-errors";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admissions/organizations/[organizationId]/parent-login-status";

type RouteContext = {
  params: Promise<{ organizationId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { organizationId } = await context.params;

  try {
    await requireSchoolAdminUser(supabase, organizationId);

    const admin = createAdminClient();
    const statuses = await listOrgParentPortalLoginStatus(admin, organizationId);

    return NextResponse.json({
      statuses,
      summary: summarizeParentPortalLoginStatus(statuses),
    });
  } catch (error) {
    if (error instanceof SchoolAdminAuthError) {
      return apiError(ROUTE, {
        status: error.status,
        error: error.message,
        code: error.code,
      });
    }

    return apiError(ROUTE, {
      status: 500,
      error: "Failed to load parent portal sign-in status.",
      code: "internal_error",
      cause: error,
    });
  }
}
