import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { loadAdminStaffHoursPageData } from "@/lib/school-admin/staff-hours/load-admin-staff-hours-page-data";
import { reviewStaffHoursAdjustment } from "@/lib/school-teacher/my-hours/my-hours-adjustments";
import { MyHoursMutationError } from "@/lib/school-teacher/my-hours/my-hours-mutations";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/school-admin/staff-hours/adjustments/review";

type ReviewBody = {
  organizationId?: string;
  requestId?: string;
  decision?: string;
};

export async function POST(request: Request) {
  const supabase = await createClientFromRequest(request);

  let body: ReviewBody;
  try {
    body = (await request.json()) as ReviewBody;
  } catch {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Invalid JSON body.",
      code: "invalid_body",
    });
  }

  const organizationId = body.organizationId?.trim() ?? "";
  const requestId = body.requestId?.trim() ?? "";
  const decision = body.decision === "approved" || body.decision === "denied"
    ? body.decision
    : null;

  if (!organizationId || !requestId || !decision) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId, requestId, and decision are required.",
      code: "missing_fields",
    });
  }

  try {
    const user = await requireSchoolAdminUser(supabase, organizationId, request);
    const admin = createAdminClient();
    await reviewStaffHoursAdjustment(admin, {
      organizationId,
      requestId,
      decision,
      reviewerUserId: user.id,
    });
    const pageData = await loadAdminStaffHoursPageData(admin, organizationId, {
      view: "all",
    });
    return NextResponse.json(pageData);
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
      error: "Failed to review the adjustment.",
      code: "internal_error",
      cause: err,
    });
  }
}
