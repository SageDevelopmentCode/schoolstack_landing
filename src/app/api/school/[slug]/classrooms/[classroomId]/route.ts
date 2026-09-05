import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  ClassroomError,
  deleteClassroom,
  getClassroomDetail,
  updateClassroom,
  type ClassroomStatus,
} from "@/lib/school-admin/classrooms";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/school/[slug]/classrooms/[classroomId]";

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

    const classroom = await getClassroomDetail(admin, organizationId, classroomId);
    return NextResponse.json({ classroom });
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
      error: "Failed to load classroom.",
      code: "internal_error",
      cause: error,
    });
  }
}

type PatchClassroomBody = {
  name?: string;
  programId?: string | null;
  status?: ClassroomStatus;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { slug, classroomId } = await context.params;
  const supabase = await createClientFromRequest(request);

  try {
    let body: PatchClassroomBody;
    try {
      body = (await request.json()) as PatchClassroomBody;
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

    const classroom = await updateClassroom(admin, {
      organizationId,
      classroomId,
      name: body.name,
      programId: body.programId,
      status: body.status,
    });

    return NextResponse.json({ classroom });
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
      error: "Failed to update classroom.",
      code: "internal_error",
      cause: error,
    });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
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

    await deleteClassroom(admin, organizationId, classroomId);
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
      error: "Failed to delete classroom.",
      code: "internal_error",
      cause: error,
    });
  }
}
