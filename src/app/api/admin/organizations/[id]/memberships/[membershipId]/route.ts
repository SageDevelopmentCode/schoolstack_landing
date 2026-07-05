import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  updateOrganizationMembership,
  type OrganizationMembershipRole,
  type OrganizationMembershipStatus,
} from "@/lib/admin/organization-memberships";
import { requirePlatformAdminUser } from "@/lib/admin/require-platform-admin-api";
import { AuthError } from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admin/organizations/[id]/memberships/[membershipId]";

type RouteContext = {
  params: Promise<{ id: string; membershipId: string }>;
};

type UpdateMembershipBody = {
  role?: OrganizationMembershipRole;
  status?: OrganizationMembershipStatus;
};

export async function PATCH(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { id: organizationId, membershipId } = await context.params;

  try {
    await requirePlatformAdminUser(supabase);

    let body: UpdateMembershipBody;
    try {
      body = (await request.json()) as UpdateMembershipBody;
    } catch {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Invalid request body.",
        code: "invalid_body",
      });
    }

    if (!body.role && !body.status) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "role or status is required.",
        code: "missing_fields",
      });
    }

    const admin = createAdminClient();
    const membership = await updateOrganizationMembership(
      admin,
      organizationId,
      membershipId,
      body,
    );

    return NextResponse.json({ membership });
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

    if (error instanceof Error && error.message === "Membership not found.") {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: error.message,
        code: "not_found",
      });
    }

    return apiError(ROUTE, {
      request,
      status: 500,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update school admin access.",
      code: "internal_error",
      cause: error,
    });
  }
}
