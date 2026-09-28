import { NextResponse } from "next/server";
import {
  applyWholeDayGroupTour,
  clearWholeDayGroupTour,
} from "@/lib/admissions/admissions-availability-settings";
import { apiError } from "@/lib/api/route-errors";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClientFromRequest } from "@/lib/supabase/request-client";

const ROUTE = "/api/school-admin/admissions/availability/group-day";

type GroupDayBody = {
  organizationId?: string;
  date?: string;
  groupCapacity?: number;
  action?: "apply" | "clear";
};

export async function POST(request: Request) {
  let body: GroupDayBody;
  try {
    body = (await request.json()) as GroupDayBody;
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
  const action = body.action ?? "apply";

  if (!organizationId || !date) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId and date are required.",
      code: "missing_fields",
    });
  }

  try {
    const supabase = await createClientFromRequest(request);
    await requireSchoolAdminUser(supabase, organizationId, request);
    const admin = createAdminClient();

    if (action === "clear") {
      await clearWholeDayGroupTour(admin, { organizationId, date });
      return NextResponse.json({ success: true });
    }

    const capacity = body.groupCapacity ?? 0;
    const updatedCount = await applyWholeDayGroupTour(admin, {
      organizationId,
      date,
      groupCapacity: capacity,
    });

    return NextResponse.json({ success: true, updatedCount });
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
      error: error instanceof Error ? error.message : "Failed to update group day.",
      cause: error,
    });
  }
}
