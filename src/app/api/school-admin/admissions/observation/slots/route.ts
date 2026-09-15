import { NextResponse } from "next/server";
import { createObservationSlot } from "@/lib/admissions/admissions-observation-slots";
import { AdmissionsAvailabilityConflictError } from "@/lib/admissions/admissions-availability-errors";
import { activityClientMetadataFromRequest } from "@/lib/activity-client";
import { apiError } from "@/lib/api/route-errors";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClientFromRequest } from "@/lib/supabase/request-client";

const ROUTE = "/api/school-admin/admissions/observation/slots";

type CreateSlotBody = {
  organizationId?: string;
  date?: string;
  startTime?: string;
  endTime?: string | null;
  label?: string | null;
  gradeValues?: string[];
};

export async function POST(request: Request) {
  let body: CreateSlotBody;
  try {
    body = (await request.json()) as CreateSlotBody;
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
  const startTime = body.startTime?.trim();

  if (!organizationId || !date || !startTime) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId, date, and startTime are required.",
      code: "missing_fields",
    });
  }

  try {
    const supabase = await createClientFromRequest(request);
    await requireSchoolAdminUser(supabase, organizationId, request);
    const admin = createAdminClient();

    const slot = await createObservationSlot(
      admin,
      organizationId,
      {
        date,
        startTime,
        endTime: body.endTime ?? null,
        label: body.label ?? null,
        gradeValues: body.gradeValues ?? [],
      },
      activityClientMetadataFromRequest(request),
    );

    return NextResponse.json({ slot: { id: slot.id } });
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
      error: "Failed to create shadow slot.",
      code: "internal_error",
      cause: error,
    });
  }
}
