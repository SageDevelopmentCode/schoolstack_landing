import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requirePlatformAdminUser } from "@/lib/admin/require-platform-admin-api";
import { AuthError } from "@/lib/admissions/application-auth";
import { listFamilyChildrenForHomeByFamilyId } from "@/lib/admissions/family-preview-access";
import { apiError } from "@/lib/api/route-errors";
import { loadParentFridayBranchClassDetail } from "@/lib/parent-portal/friday-branch/load-parent-friday-branch";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admin/organizations/[id]/friday-branch/classes/[classId]";

type RouteContext = {
  params: Promise<{ id: string; classId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { id: organizationId, classId } = await context.params;

  const familyId = new URL(request.url).searchParams.get("familyId")?.trim() ?? "";

  if (!familyId || !classId?.trim()) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "familyId and classId are required.",
      code: "missing_fields",
    });
  }

  try {
    await requirePlatformAdminUser(supabase, request);

    const admin = createAdminClient();
    const familyChildren = await listFamilyChildrenForHomeByFamilyId(
      admin,
      organizationId,
      familyId,
    );
    const studentOptions = familyChildren
      .filter((child) => child.studentId)
      .map((child) => ({
        id: child.studentId!,
        name: child.studentName,
      }));

    const detail = await loadParentFridayBranchClassDetail(
      admin,
      organizationId,
      familyId,
      classId.trim(),
      studentOptions,
    );

    if (!detail) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Friday Branch class not found.",
        code: "not_found",
      });
    }

    return NextResponse.json({ detail, studentOptions });
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

    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to load Friday Branch class preview.",
      code: "internal_error",
      cause: error,
    });
  }
}
