import { NextResponse } from "next/server";
import { listOrganizationMobileUsers } from "@/lib/admin/organization-mobile-users";
import { requirePlatformAdminUser } from "@/lib/admin/require-platform-admin-api";
import { AuthError } from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/admin/organizations/[id]/mobile-users";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const supabase = await createClientFromRequest(request);
  const { id: organizationId } = await context.params;

  try {
    await requirePlatformAdminUser(supabase, request);

    const admin = createAdminClient();
    const { users, summary } = await listOrganizationMobileUsers(
      admin,
      organizationId,
    );

    return NextResponse.json({ users, summary });
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
      error: "Failed to load mobile app users.",
      code: "internal_error",
      cause: error,
    });
  }
}
