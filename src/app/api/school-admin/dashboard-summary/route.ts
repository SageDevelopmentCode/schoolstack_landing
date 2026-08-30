import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { fetchAdminDashboardSummary } from "@/lib/school-admin/dashboard-summary";
import { requireSchoolAdminUser, SchoolAdminAuthError } from "@/lib/school-admin/access";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/school-admin/dashboard-summary";

export async function GET(request: Request) {
  const supabase = await createClientFromRequest(request);
  const url = new URL(request.url);
  const organizationId = url.searchParams.get("organizationId")?.trim() ?? "";
  const slug = url.searchParams.get("slug")?.trim() ?? "";

  if (!organizationId || !slug) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId and slug are required.",
      code: "missing_fields",
    });
  }

  try {
    const user = await requireSchoolAdminUser(supabase, organizationId, request);
    const org = await fetchOrganizationWithSettings(supabase, slug);
    if (!org || org.id !== organizationId) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Organization not found.",
        code: "not_found",
      });
    }

    const admin = createAdminClient();
    const summary = await fetchAdminDashboardSummary(
      supabase,
      admin,
      organizationId,
      slug,
      org.features.admin,
      { userId: user.id, schoolName: org.name },
    );

    return NextResponse.json(summary);
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
      error: err instanceof Error ? err.message : "Failed to load dashboard summary.",
      code: "internal_error",
      cause: err,
    });
  }
}
