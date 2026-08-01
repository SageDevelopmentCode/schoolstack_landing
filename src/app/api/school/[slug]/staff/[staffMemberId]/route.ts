import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  deactivateStaffPortalAccess,
  reactivateStaffPortalAccess,
  StaffMemberError,
  updateStaffMember,
  type StaffEmploymentStatus,
  type StaffPortalRole,
} from "@/lib/staff/staff-members";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/school/[slug]/staff/[staffMemberId]";

type RouteContext = {
  params: Promise<{ slug: string; staffMemberId: string }>;
};

type PatchStaffBody = {
  firstName?: string;
  lastName?: string;
  roleTitle?: string;
  employmentStatus?: StaffEmploymentStatus;
  portalRole?: StaffPortalRole;
  action?: "deactivatePortalAccess" | "reactivatePortalAccess";
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

export async function PATCH(request: Request, context: RouteContext) {
  const { slug, staffMemberId } = await context.params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    let body: PatchStaffBody;
    try {
      body = (await request.json()) as PatchStaffBody;
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

    let staffMember;

    if (body.action === "deactivatePortalAccess") {
      staffMember = await deactivateStaffPortalAccess(
        admin,
        organizationId,
        staffMemberId,
      );
    } else if (body.action === "reactivatePortalAccess") {
      staffMember = await reactivateStaffPortalAccess(
        admin,
        organizationId,
        staffMemberId,
      );
    } else {
      staffMember = await updateStaffMember(admin, {
        organizationId,
        staffMemberId,
        firstName: body.firstName,
        lastName: body.lastName,
        roleTitle: body.roleTitle,
        employmentStatus: body.employmentStatus,
        portalRole: body.portalRole,
      });
    }

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
        error instanceof Error ? error.message : "Failed to update staff member.",
      code: "internal_error",
      cause: error,
    });
  }
}
