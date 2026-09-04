import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { loadProgramParentPortalCommitteesPreviewData } from "@/lib/admissions/load-program-parent-portal-committees-preview";
import { requireSchoolAdminUser, SchoolAdminAuthError } from "@/lib/school-admin/access";
import { createClientFromRequest } from "@/lib/supabase/request-client";

const ROUTE = "/api/school-admin/program-parent-portal-preview/committees";

export async function GET(request: Request) {
  const supabase = await createClientFromRequest(request);
  const url = new URL(request.url);
  const organizationId = url.searchParams.get("organizationId")?.trim() ?? "";

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

    const data = await loadProgramParentPortalCommitteesPreviewData({
      organizationId,
    });

    return NextResponse.json(data);
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
      error: err instanceof Error ? err.message : "Failed to load committees preview.",
      code: "internal_error",
      cause: err,
    });
  }
}
