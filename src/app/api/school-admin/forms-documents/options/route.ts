import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { loadAdminClassroomOptions } from "@/lib/school-admin/forms-documents/load-admin-classroom-options";
import { requireSchoolAdminUser, SchoolAdminAuthError } from "@/lib/school-admin/access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClientFromRequest } from "@/lib/supabase/request-client";

const ROUTE = "/api/school-admin/forms-documents/options";

export async function GET(request: Request) {
  const supabase = await createClientFromRequest(request);
  const organizationId = new URL(request.url).searchParams.get("organizationId")?.trim() ?? "";

  if (!organizationId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId is required.",
      code: "missing_fields",
    });
  }

  try {
    await requireSchoolAdminUser(supabase, organizationId, request);
    const admin = createAdminClient();
    const classroomOptions = await loadAdminClassroomOptions(admin, organizationId);

    return NextResponse.json({ classroomOptions });
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
    return apiError(ROUTE, {
      request,
      status: 500,
      error: error instanceof Error ? error.message : "Failed to load form options.",
      code: "load_failed",
      cause: error,
    });
  }
}
