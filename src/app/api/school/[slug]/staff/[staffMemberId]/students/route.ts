import { NextResponse } from "next/server";
import { ACTIVITY_ACTIONS } from "@/lib/activity-log";
import { apiError } from "@/lib/api/route-errors";
import {
  assignStudentsToStaff,
  listAssignedEnrolledStudents,
  StudentTeacherAssignmentError,
  unassignStudentFromStaff,
} from "@/lib/school-admin/enrolled-students";
import {
  getSchoolAdminUserProfile,
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { logSchoolAdminActivity } from "@/lib/school-admin/school-admin-activity";
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

type PatchStaffStudentsBody = {
  studentIds?: string[];
  studentId?: string;
  action?: "unassign";
};

export async function PATCH(request: Request, context: RouteContext) {
  const { slug, staffMemberId } = await context.params;
  const supabase = await createClientFromRequest(request);

  try {
    let body: PatchStaffStudentsBody;
    try {
      body = (await request.json()) as PatchStaffStudentsBody;
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
        status: 404,
        error: "School not found.",
        code: "not_found",
      });
    }

    const user = await requireSchoolAdminUser(supabase, organizationId, request);
    const actor = getSchoolAdminUserProfile(user);

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

    if (body.action === "unassign") {
      if (!body.studentId) {
        return apiError(ROUTE, {
          status: 400,
          error: "studentId is required to unassign.",
          code: "invalid_body",
        });
      }

      await unassignStudentFromStaff(admin, {
        organizationId,
        staffMemberId,
        studentId: body.studentId,
      });

      void logSchoolAdminActivity(admin, {
        organizationId,
        actorUserId: user.id,
        actorEmail: actor.email,
        actorName: actor.displayName,
        action: ACTIVITY_ACTIONS.STAFF_STUDENT_UNASSIGNED,
        summary: "Unassigned student from staff member",
        entityType: "staff_member",
        entityId: staffMemberId,
        metadata: { studentId: body.studentId },
        request,
      });

      return NextResponse.json({ ok: true });
    }

    const studentIds = Array.isArray(body.studentIds)
      ? body.studentIds.filter(
          (id): id is string => typeof id === "string" && id.trim() !== "",
        )
      : [];

    if (studentIds.length === 0) {
      return apiError(ROUTE, {
        status: 400,
        error: "studentIds is required.",
        code: "invalid_body",
      });
    }

    await assignStudentsToStaff(admin, {
      organizationId,
      staffMemberId,
      studentIds,
    });

    void logSchoolAdminActivity(admin, {
      organizationId,
      actorUserId: user.id,
      actorEmail: actor.email,
      actorName: actor.displayName,
      action: ACTIVITY_ACTIONS.STAFF_STUDENTS_ASSIGNED,
      summary: `Assigned ${studentIds.length} student${studentIds.length === 1 ? "" : "s"} to staff member`,
      entityType: "staff_member",
      entityId: staffMemberId,
      metadata: { studentIds },
      request,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof SchoolAdminAuthError) {
      return apiError(ROUTE, {
        status: error.status,
        error: error.message,
        code: error.code,
        cause: error,
      });
    }

    if (error instanceof StudentTeacherAssignmentError) {
      return apiError(ROUTE, {
        status: error.status,
        error: error.message,
        code: error.code,
        cause: error,
      });
    }

    return apiError(ROUTE, {
      status: 500,
      error: "Failed to update assigned students.",
      code: "internal_error",
      cause: error,
    });
  }
}
