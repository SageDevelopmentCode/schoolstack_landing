import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { loadAdminStaffHoursPageData } from "@/lib/school-admin/staff-hours/load-admin-staff-hours-page-data";
import type { AdminStaffHoursView } from "@/lib/school-admin/staff-hours/staff-hours-types";
import {
  MyHoursMutationError,
  parseMyHoursDateKey,
} from "@/lib/school-teacher/my-hours/my-hours-mutations";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/school-admin/staff-hours";

function parseView(value: string | null): AdminStaffHoursView {
  const trimmed = value?.trim();
  if (trimmed === "live" || trimmed === "summary" || trimmed === "all") {
    return trimmed;
  }
  return "all";
}

export async function GET(request: Request) {
  const supabase = await createClientFromRequest(request);
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";
  const fromParam = searchParams.get("from")?.trim();
  const toParam = searchParams.get("to")?.trim();
  const staffMemberId = searchParams.get("staffMemberId")?.trim() || null;
  const view = parseView(searchParams.get("view"));

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

    if (fromParam) parseMyHoursDateKey(fromParam);
    if (toParam) parseMyHoursDateKey(toParam);

    const admin = createAdminClient();
    const pageData = await loadAdminStaffHoursPageData(admin, organizationId, {
      from: fromParam,
      to: toParam,
      staffMemberId,
      view,
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
      error: "Failed to load staff hours.",
      code: "internal_error",
      cause: err,
    });
  }
}
