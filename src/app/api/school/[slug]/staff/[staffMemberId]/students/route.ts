import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { listAssignedEnrolledStudents } from "@/lib/school-admin/enrolled-students";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/school/[slug]/staff/[staffMemberId]/students";

type RouteContext = {
  params: Promise<{ slug: string; staffMemberId: string }>;
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

async function assertStaffMemberInOrg(
  admin: ReturnType<typeof createAdminClient>,
  organizationId: string,
  staffMemberId: string,
): Promise<boolean> {
  const { data, error } = await admin
    .from("staff_members")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("id", staffMemberId)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

export async function GET(request: Request, context: RouteContext) {
  const { slug, staffMemberId } = await context.params;
  const supabase = await createClientFromRequest(request);

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

    await requireSchoolAdminUser(supabase, organizationId, request);

    const staffExists = await assertStaffMemberInOrg(
      admin,
      organizationId,
      staffMemberId,
    );

    if (!staffExists) {
      return apiError(ROUTE, {
        status: 404,
        error: "Staff member not found.",
        code: "not_found",
      });
    }

    const students = await listAssignedEnrolledStudents(
      admin,
      organizationId,
      staffMemberId,
      { limit: 500 },
    );

    return NextResponse.json({ students });
  } catch (error) {
    if (error instanceof SchoolAdminAuthError) {
      return apiError(ROUTE, {
        status: error.status,
        error: error.message,
        code: error.code,
        cause: error,
      });
    }

    return apiError(ROUTE, {
      status: 500,
      error: "Failed to load assigned students.",
      code: "internal_error",
      cause: error,
    });
  }
}
