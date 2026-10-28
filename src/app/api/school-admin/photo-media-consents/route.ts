import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { requireSchoolAdminUser, SchoolAdminAuthError } from "@/lib/school-admin/access";
import { loadOrgPhotoMediaConsentRoster } from "@/lib/students/load-org-photo-media-consent-roster";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/school-admin/photo-media-consents";

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
    const students = await loadOrgPhotoMediaConsentRoster(admin, organizationId);
    return NextResponse.json({ students });
  } catch (error) {
    if (error instanceof SchoolAdminAuthError) {
      return apiError(ROUTE, {
        request,
        status: error.status,
        error: error.message,
        code: error.code,
      });
    }
    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to load photo permissions.",
      cause: error,
      code: "load_failed",
    });
  }
}
