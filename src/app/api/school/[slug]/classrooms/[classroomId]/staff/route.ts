import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  assignStaffToClassroom,
  ClassroomError,
  listClassroomStaff,
  removeStaffFromClassroom,
  type ClassroomStaffRole,
} from "@/lib/school-admin/classrooms";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/school/[slug]/classrooms/[classroomId]/staff";

type RouteContext = {
  params: Promise<{ slug: string; classroomId: string }>;
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

export async function GET(request: Request, context: RouteContext) {
  const { slug, classroomId } = await context.params;
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

    const staff = await listClassroomStaff(admin, organizationId, classroomId);
    return NextResponse.json({ staff });
  } catch (error) {
    if (error instanceof SchoolAdminAuthError) {
      return apiError(ROUTE, {
        status: error.status,
        error: error.message,
        code: error.code,
        cause: error,
      });
    }

    if (error instanceof ClassroomError) {
      return apiError(ROUTE, {
        status: error.status,
        error: error.message,
        code: error.code,
        cause: error,
      });
    }

    return apiError(ROUTE, {
      status: 500,
      error: "Failed to load classroom staff.",
      code: "internal_error",
      cause: error,
    });
  }
}

type PatchClassroomStaffBody = {
  staffMemberId?: string;
  role?: ClassroomStaffRole;
  action?: "remove";
};

export async function PATCH(request: Request, context: RouteContext) {
  const { slug, classroomId } = await context.params;
  const supabase = await createClientFromRequest(request);

  try {
    let body: PatchClassroomStaffBody;
    try {
      body = (await request.json()) as PatchClassroomStaffBody;
    } catch {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Invalid request body.",
        code: "invalid_body",
      });
    }

    if (!body.staffMemberId) {
      return apiError(ROUTE, {
        status: 400,
        error: "staffMemberId is required.",
        code: "invalid_body",
      });
    }

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

    if (body.action === "remove") {
      await removeStaffFromClassroom(admin, {
        organizationId,
        classroomId,
        staffMemberId: body.staffMemberId,
      });
    } else {
      await assignStaffToClassroom(admin, {
        organizationId,
        classroomId,
        staffMemberId: body.staffMemberId,
        role: body.role,
      });
    }

    const staff = await listClassroomStaff(admin, organizationId, classroomId);
    return NextResponse.json({ staff });
  } catch (error) {
    if (error instanceof SchoolAdminAuthError) {
      return apiError(ROUTE, {
        status: error.status,
        error: error.message,
        code: error.code,
        cause: error,
      });
    }

    if (error instanceof ClassroomError) {
      return apiError(ROUTE, {
        status: error.status,
        error: error.message,
        code: error.code,
        cause: error,
      });
    }

    return apiError(ROUTE, {
      status: 500,
      error: "Failed to update classroom staff.",
      code: "internal_error",
      cause: error,
    });
  }
}
