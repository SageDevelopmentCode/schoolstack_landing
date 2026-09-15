import { NextResponse } from "next/server";
import { toggleObservationDay } from "@/lib/admissions/admissions-observation-availability";
import { AdmissionsAvailabilityConflictError } from "@/lib/admissions/admissions-availability-errors";
import { apiError } from "@/lib/api/route-errors";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClientFromRequest } from "@/lib/supabase/request-client";

const ROUTE = "/api/school-admin/admissions/observation/day-toggle";

type ToggleBody = {
  organizationId?: string;
  date?: string;
  open?: boolean;
};

export async function POST(request: Request) {
  let body: ToggleBody;
  try {
    body = (await request.json()) as ToggleBody;
  } catch {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Invalid JSON body.",
      code: "invalid_body",
    });
  }

  const organizationId = body.organizationId?.trim();
  const date = body.date?.trim();
  const open = body.open;

  if (!organizationId || !date || typeof open !== "boolean") {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId, date, and open are required.",
      code: "missing_fields",
    });
  }

  try {
    const supabase = await createClientFromRequest(request);
    await requireSchoolAdminUser(supabase, organizationId, request);
    const admin = createAdminClient();

    await toggleObservationDay(admin, organizationId, date, open);

    return new NextResponse(null, { status: 204 });
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

    if (error instanceof AdmissionsAvailabilityConflictError) {
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
      error: "Failed to toggle shadow day.",
      code: "internal_error",
      cause: error,
    });
  }
}
