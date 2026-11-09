import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { loadTeacherMyHoursPageData } from "@/lib/school-teacher/my-hours/load-teacher-my-hours-data";
import {
  MyHoursMutationError,
} from "@/lib/school-teacher/my-hours/my-hours-mutations";
import { submitStaffHoursAdjustment } from "@/lib/school-teacher/my-hours/my-hours-adjustments";
import {
  requireTeacherMyHoursAccess,
  TeacherPortalAuthError,
} from "@/lib/school-teacher/my-hours/require-teacher-my-hours-access";
import { getStaffMemberIdForUser } from "@/lib/staff/teacher-portal-access";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/teacher-portal/my-hours/adjustments";

type AdjustmentBody = {
  organizationId?: string;
  dateKey?: string;
  note?: string;
  sessions?: unknown;
};

export async function POST(request: Request) {
  const supabase = await createClientFromRequest(request);

  let body: AdjustmentBody;
  try {
    body = (await request.json()) as AdjustmentBody;
  } catch {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Invalid JSON body.",
      code: "invalid_body",
    });
  }

  const organizationId = body.organizationId?.trim() ?? "";
  const dateKey = body.dateKey?.trim() ?? "";
  if (!organizationId || !dateKey) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId and dateKey are required.",
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
    const result = await submitStaffHoursAdjustment(admin, {
      organizationId,
      staffMemberId,
      userId: user.id,
      dateKey,
      note: typeof body.note === "string" ? body.note : "",
      sessions: body.sessions,
    });
    const pageData = await loadTeacherMyHoursPageData(
      admin,
      organizationId,
      staffMemberId,
    );

    return NextResponse.json({
      pageData,
      requireApproval: result.requireApproval,
    });
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
      error: "Failed to save hours.",
      code: "internal_error",
      cause: err,
    });
  }
}
