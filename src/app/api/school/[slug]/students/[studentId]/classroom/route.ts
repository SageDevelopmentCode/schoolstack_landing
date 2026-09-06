import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  ClassroomError,
  setStudentClassroom,
  setStudentClassrooms,
} from "@/lib/school-admin/classrooms";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/school/[slug]/students/[studentId]/classroom";

type RouteContext = {
  params: Promise<{ slug: string; studentId: string }>;
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

type PatchStudentClassroomBody = {
  classroomId?: string | null;
  classroomIds?: string[];
};

export async function PATCH(request: Request, context: RouteContext) {
  const { slug, studentId } = await context.params;
  const supabase = await createClientFromRequest(request);

  try {
    let body: PatchStudentClassroomBody;
    try {
      body = (await request.json()) as PatchStudentClassroomBody;
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

    const result =
      body.classroomIds !== undefined
        ? await setStudentClassrooms(admin, {
            organizationId,
            studentId,
            classroomIds: body.classroomIds,
          })
        : await setStudentClassroom(admin, {
            organizationId,
            studentId,
            classroomId: body.classroomId ?? null,
          });

    return NextResponse.json({ ok: true, ...result });
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
      error: "Failed to update student classroom.",
      code: "internal_error",
      cause: error,
    });
  }
}
