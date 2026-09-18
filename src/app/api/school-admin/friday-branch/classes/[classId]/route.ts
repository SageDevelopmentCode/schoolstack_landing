import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { loadFridayBranchClassDetail } from "@/lib/school-admin/friday-branch/friday-branch-storage";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/school-admin/friday-branch/classes/[classId]";

type RouteContext = {
  params: Promise<{ classId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { classId } = await context.params;

  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";

  if (!organizationId || !classId?.trim()) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId and classId are required.",
      code: "missing_fields",
    });
  }

  try {
    await requireSchoolAdminUser(supabase, organizationId, request);

    const admin = createAdminClient();
    const detail = await loadFridayBranchClassDetail(admin, organizationId, classId.trim());

    if (!detail) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Friday Branch class not found.",
        code: "not_found",
      });
    }

    return NextResponse.json(detail);
  } catch (err) {
    if (err instanceof SchoolAdminAuthError) {
      return apiError(ROUTE, {
        request,
        status: err.status,
        error: err.message,
        code: err.code,
        cause: err,
      });
    }

    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to load Friday Branch class detail.",
      code: "internal_error",
      cause: err,
    });
  }
}
