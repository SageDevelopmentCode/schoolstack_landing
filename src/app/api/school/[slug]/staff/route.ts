import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  addStaffPortalAccess,
  listStaffMembers,
  StaffMemberError,
  type StaffPortalRole,
} from "@/lib/staff/staff-members";
import { listStaffMembersWithLoginStatus } from "@/lib/staff/staff-portal-login-status";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/school/[slug]/staff";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

type CreateStaffBody = {
  email?: string;
  firstName?: string;
  lastName?: string;
  roleTitle?: string;
  portalRole?: StaffPortalRole;
};

async function resolveOrganizationId(
  admin: ReturnType<typeof createAdminClient>,
  slug: string,
): Promise<string | null> {
  const { data, error } = await admin
    .from("organizations")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data?.id ? String(data.id) : null;
}

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    const admin = createAdminClient();
    const organizationId = await resolveOrganizationId(admin, slug);

    if (!organizationId) {
      return apiError(ROUTE, {
        status: 404,
        error: "School not found.",
        code: "not_found",
      });
    }

    await requireSchoolAdminUser(supabase, organizationId);

    const staffMembers = await listStaffMembersWithLoginStatus(
      admin,
      organizationId,
      listStaffMembers,
    );

    return NextResponse.json({ staffMembers });
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
      error: "Failed to load staff.",
      code: "internal_error",
      cause: error,
    });
  }
}

export async function POST(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    let body: CreateStaffBody;
    try {
      body = (await request.json()) as CreateStaffBody;
    } catch {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Invalid request body.",
        code: "invalid_body",
      });
    }

    const admin = createAdminClient();
    const organizationId = await resolveOrganizationId(admin, slug);

    if (!organizationId) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "School not found.",
        code: "not_found",
      });
    }

    await requireSchoolAdminUser(supabase, organizationId);

    const email = body.email?.trim();
    const firstName = body.firstName?.trim();
    const lastName = body.lastName?.trim();
    const roleTitle = body.roleTitle?.trim();
    const portalRole = body.portalRole;

    if (!email || !firstName || !lastName || !roleTitle || !portalRole) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "email, firstName, lastName, roleTitle, and portalRole are required.",
        code: "missing_fields",
      });
    }

    const staffMember = await addStaffPortalAccess(admin, {
      organizationId,
      email,
      firstName,
      lastName,
      roleTitle,
      portalRole,
    });

    return NextResponse.json({ staffMember });
  } catch (error) {
    if (error instanceof SchoolAdminAuthError) {
      return apiError(ROUTE, {
        request,
        status: error.status,
        error: error.message,
        code: error.code,
        cause: error,
      });
    }

    if (error instanceof StaffMemberError) {
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
      error:
        error instanceof Error ? error.message : "Failed to add staff access.",
      code: "internal_error",
      cause: error,
    });
  }
}
