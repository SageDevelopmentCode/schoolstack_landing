import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  assignStudentsToClassroom,
  ClassroomError,
  listClassroomStudents,
  removeStudentFromClassroom,
} from "@/lib/school-admin/classrooms";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/school/[slug]/classrooms/[classroomId]/students";

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

    const students = await listClassroomStudents(
      admin,
      organizationId,
      classroomId,
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
      error: "Failed to load classroom students.",
      code: "internal_error",
      cause: error,
    });
  }
}

type PatchClassroomStudentsBody = {
  studentIds?: string[];
  studentId?: string;
  action?: "remove";
};

export async function PATCH(request: Request, context: RouteContext) {
  const { slug, classroomId } = await context.params;
  const supabase = await createClientFromRequest(request);

  try {
    let body: PatchClassroomStudentsBody;
    try {
      body = (await request.json()) as PatchClassroomStudentsBody;
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

    await requireSchoolAdminUser(supabase, organizationId, request);

    if (body.action === "remove") {
      if (!body.studentId) {
        return apiError(ROUTE, {
          status: 400,
          error: "studentId is required to remove.",
          code: "invalid_body",
        });
      }

      await removeStudentFromClassroom(admin, {
        organizationId,
        classroomId,
        studentId: body.studentId,
      });
    } else {
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

      await assignStudentsToClassroom(admin, {
        organizationId,
        classroomId,
        studentIds,
      });
    }

    const students = await listClassroomStudents(
      admin,
      organizationId,
      classroomId,
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
      error: "Failed to update classroom students.",
      code: "internal_error",
      cause: error,
    });
  }
}
