import { NextResponse } from "next/server";
import {
  addOrganizationAdminMembership,
  listOrganizationMemberships,
  type OrganizationMembershipRole,
} from "@/lib/admin/organization-memberships";
import { requirePlatformAdminUser } from "@/lib/admin/require-platform-admin-api";
import { AuthError } from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/admin/organizations/[id]/memberships";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type CreateMembershipBody = {
  email?: string;
  role?: OrganizationMembershipRole;
};

export async function GET(request: Request, context: RouteContext) {
  const supabase = await createClientFromRequest(request);
  const { id: organizationId } = await context.params;

  try {
    await requirePlatformAdminUser(supabase);
    const admin = createAdminClient();
    const memberships = await listOrganizationMemberships(admin, organizationId);
    return NextResponse.json({ memberships });
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
      error: "Failed to load school admin access.",
      code: "internal_error",
      cause: error,
    });
  }
}

export async function POST(request: Request, context: RouteContext) {
  const supabase = await createClientFromRequest(request);
  const { id: organizationId } = await context.params;

  try {
    await requirePlatformAdminUser(supabase);

    let body: CreateMembershipBody;
    try {
      body = (await request.json()) as CreateMembershipBody;
    } catch {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Invalid request body.",
        code: "invalid_body",
      });
    }

    const email = body.email?.trim();
    const role = body.role;

    if (!email || !role) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "email and role are required.",
        code: "missing_fields",
      });
    }

    const admin = createAdminClient();
    const membership = await addOrganizationAdminMembership(
      admin,
      organizationId,
      email,
      role,
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

    if (error instanceof Error && error.message.includes("No account found")) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: error.message,
        code: "user_not_found",
      });
    }

    return apiError(ROUTE, {
      request,
      status: 500,
      error:
        error instanceof Error
          ? error.message
          : "Failed to assign school admin access.",
      code: "internal_error",
      cause: error,
    });
  }
}
