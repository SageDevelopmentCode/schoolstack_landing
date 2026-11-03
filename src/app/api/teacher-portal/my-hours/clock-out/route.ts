import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  clockOutStaffWorkTime,
  MyHoursMutationError,
} from "@/lib/school-teacher/my-hours/my-hours-mutations";
import { loadTeacherMyHoursPageData } from "@/lib/school-teacher/my-hours/load-teacher-my-hours-data";
import {
  requireTeacherMyHoursAccess,
  TeacherPortalAuthError,
} from "@/lib/school-teacher/my-hours/require-teacher-my-hours-access";
import { getStaffMemberIdForUser } from "@/lib/staff/teacher-portal-access";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/teacher-portal/my-hours/clock-out";

type ClockOutBody = {
  organizationId?: string;
};

export async function POST(request: Request) {
  const supabase = await createClientFromRequest(request);

  let body: ClockOutBody;
  try {
    body = (await request.json()) as ClockOutBody;
  } catch {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Invalid JSON body.",
      code: "invalid_body",
    });
  }

  const organizationId = body.organizationId?.trim() ?? "";
  if (!organizationId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId is required.",
      code: "missing_fields",
    });
  }

  try {
    const user = await requireTeacherMyHoursAccess(supabase, organizationId);
    const staffMemberId = await getStaffMemberIdForUser(
      supabase,
      user.id,
      organizationId,
    );

    if (!staffMemberId) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "Staff profile not found for this account.",
        code: "forbidden",
      });
    }

    const admin = createAdminClient();
    const { session } = await clockOutStaffWorkTime(admin, {
      organizationId,
      staffMemberId,
    });

    const pageData = await loadTeacherMyHoursPageData(
      admin,
      organizationId,
      staffMemberId,
    );

    return NextResponse.json({ pageData, session });
  } catch (err) {
    if (err instanceof TeacherPortalAuthError) {
      return apiError(ROUTE, {
        request,
        status: err.status,
        error: err.message,
        code: err.code,
        cause: err,
      });
    }

    if (err instanceof MyHoursMutationError) {
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
      error: "Failed to clock out.",
      code: "internal_error",
      cause: err,
    });
  }
}
