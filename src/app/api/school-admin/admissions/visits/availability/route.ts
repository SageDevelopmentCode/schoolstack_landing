import { NextResponse } from "next/server";
import { AdmissionsBookingError } from "@/lib/admissions/admissions-booking";
import { loadAdminManualVisitAvailability } from "@/lib/admissions/admin-manual-visit-booking";
import { apiError } from "@/lib/api/route-errors";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClientFromRequest } from "@/lib/supabase/request-client";

const ROUTE = "/api/school-admin/admissions/visits/availability";

export async function GET(request: Request) {
  const supabase = await createClientFromRequest(request);
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";
  const startDate = searchParams.get("start")?.trim();
  const endDate = searchParams.get("end")?.trim();
  const applicationId = searchParams.get("applicationId")?.trim();
  const actionId = searchParams.get("actionId")?.trim();
  const familyCampusTour = searchParams.get("familyCampusTour") === "1";

  if (!organizationId || !startDate || !endDate) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId, start, and end are required.",
      code: "invalid_request",
    });
  }

  if (!familyCampusTour && (!applicationId || !actionId)) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "applicationId and actionId are required unless familyCampusTour=1.",
      code: "invalid_request",
    });
  }

  try {
    await requireSchoolAdminUser(supabase, organizationId, request);
    const admin = createAdminClient();
    const availability = await loadAdminManualVisitAvailability(admin, {
      organizationId,
      startDate,
      endDate,
      applicationId,
      actionId,
      familyCampusTour,
    });

    return NextResponse.json(availability);
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

    if (error instanceof AdmissionsBookingError) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: error.message,
        code: error.code,
      });
    }

    const message = error instanceof Error ? error.message : "Failed to load availability.";
    const status = message.includes("not found") ? 404 : 400;

    return apiError(ROUTE, {
      request,
      status,
      error: message,
      code: status === 404 ? "not_found" : "invalid_request",
    });
  }
}
