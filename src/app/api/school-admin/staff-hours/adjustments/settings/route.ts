import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { saveStaffHoursAdjustmentsRequireApproval } from "@/lib/school-teacher/my-hours/my-hours-adjustments";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/school-admin/staff-hours/adjustments/settings";

type SettingsBody = {
  organizationId?: string;
  adjustmentsRequireApproval?: boolean;
};

export async function PATCH(request: Request) {
  const supabase = await createClientFromRequest(request);

  let body: SettingsBody;
  try {
    body = (await request.json()) as SettingsBody;
  } catch {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Invalid JSON body.",
      code: "invalid_body",
    });
  }

  const organizationId = body.organizationId?.trim() ?? "";
  if (!organizationId || typeof body.adjustmentsRequireApproval !== "boolean") {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId and adjustmentsRequireApproval are required.",
      code: "missing_fields",
    });
  }

  try {
    await requireSchoolAdminUser(supabase, organizationId, request);
    const admin = createAdminClient();
    await saveStaffHoursAdjustmentsRequireApproval(
      admin,
      organizationId,
      body.adjustmentsRequireApproval,
    );
    return NextResponse.json({
      adjustmentsRequireApproval: body.adjustmentsRequireApproval,
    });
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
      error: "Failed to save staff hours settings.",
      code: "internal_error",
      cause: err,
    });
  }
}
