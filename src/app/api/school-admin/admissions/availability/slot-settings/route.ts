import { NextResponse } from "next/server";
import { updateAvailabilitySlotTourSettings } from "@/lib/admissions/admissions-availability-settings";
import { apiError } from "@/lib/api/route-errors";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClientFromRequest } from "@/lib/supabase/request-client";

const ROUTE = "/api/school-admin/admissions/availability/slot-settings";

type SlotSettingsBody = {
  organizationId?: string;
  date?: string;
  timeSlot?: string;
  tourBookingMode?: "exclusive" | "group";
  groupCapacity?: number | null;
  groupDayKey?: string | null;
};

export async function PATCH(request: Request) {
  let body: SlotSettingsBody;
  try {
    body = (await request.json()) as SlotSettingsBody;
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
  const timeSlot = body.timeSlot?.trim();
  const tourBookingMode = body.tourBookingMode;

  if (!organizationId || !date || !timeSlot || !tourBookingMode) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId, date, timeSlot, and tourBookingMode are required.",
      code: "missing_fields",
    });
  }

  try {
    const supabase = await createClientFromRequest(request);
    await requireSchoolAdminUser(supabase, organizationId, request);
    const admin = createAdminClient();

    await updateAvailabilitySlotTourSettings(admin, {
      organizationId,
      date,
      timeSlot,
      tourBookingMode,
      groupCapacity: body.groupCapacity,
      groupDayKey: body.groupDayKey ?? null,
    });

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

    return apiError(ROUTE, {
      request,
      status: 400,
      error: error instanceof Error ? error.message : "Failed to update slot.",
      cause: error,
    });
  }
}
