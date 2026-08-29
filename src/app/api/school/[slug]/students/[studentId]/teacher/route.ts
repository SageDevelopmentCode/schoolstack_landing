import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  setStudentTeachers,
  StudentTeacherAssignmentError,
} from "@/lib/school-admin/enrolled-students";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/school/[slug]/students/[studentId]/teacher";

type RouteContext = {
  params: Promise<{ slug: string; studentId: string }>;
};

type PatchTeacherBody = {
  staffMemberId?: string | null;
  staffMemberIds?: string[];
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

function resolveStaffMemberIds(body: PatchTeacherBody): string[] {
  if (Array.isArray(body.staffMemberIds)) {
    return body.staffMemberIds.filter(
      (id): id is string => typeof id === "string" && id.trim() !== "",
    );
  }

  if (body.staffMemberId === undefined || body.staffMemberId === "") {
    return [];
  }

  if (typeof body.staffMemberId === "string") {
    return [body.staffMemberId];
  }

  return [];
}

export async function PATCH(request: Request, context: RouteContext) {
  const { slug, studentId } = await context.params;
  const supabase = await createClientFromRequest(request);

  try {
    let body: PatchTeacherBody;
    try {
      body = (await request.json()) as PatchTeacherBody;
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

    await requireSchoolAdminUser(supabase, organizationId, request);

    const staffMemberIds = resolveStaffMemberIds(body);

    const result = await setStudentTeachers(admin, {
      organizationId,
      studentId,
      staffMemberIds,
    });

    return NextResponse.json(result);
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

    if (error instanceof StudentTeacherAssignmentError) {
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
        error instanceof Error
          ? error.message
          : "Failed to assign teacher.",
      code: "internal_error",
      cause: error,
    });
  }
}
