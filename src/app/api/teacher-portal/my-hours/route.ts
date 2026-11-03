import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  emptyTeacherMyHoursPageData,
  loadTeacherMyHoursPageData,
} from "@/lib/school-teacher/my-hours/load-teacher-my-hours-data";
import {
  MyHoursMutationError,
  parseMyHoursDateKey,
} from "@/lib/school-teacher/my-hours/my-hours-mutations";
import {
  requireTeacherMyHoursAccess,
  TeacherPortalAuthError,
} from "@/lib/school-teacher/my-hours/require-teacher-my-hours-access";
import { getStaffMemberIdForUser } from "@/lib/staff/teacher-portal-access";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/teacher-portal/my-hours";

export async function GET(request: Request) {
  const supabase = await createClientFromRequest(request);
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";
  const fromParam = searchParams.get("from")?.trim();
  const toParam = searchParams.get("to")?.trim();

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
    const admin = createAdminClient();

    const staffMemberId = await getStaffMemberIdForUser(
      supabase,
      user.id,
      organizationId,
    );

    if (!staffMemberId) {
      const { data: org } = await admin
        .from("organizations")
        .select("timezone")
        .eq("id", organizationId)
        .maybeSingle();
      const timezone =
        typeof org?.timezone === "string" && org.timezone.trim()
          ? org.timezone.trim()
          : "America/Denver";
      return NextResponse.json(emptyTeacherMyHoursPageData(timezone));
    }

    const from = fromParam ? parseMyHoursDateKey(fromParam) : undefined;
    const to = toParam ? parseMyHoursDateKey(toParam) : undefined;

    const pageData = await loadTeacherMyHoursPageData(
      admin,
      organizationId,
      staffMemberId,
      { from, to },
    );

    return NextResponse.json(pageData);
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
      error: "Failed to load My Hours.",
      code: "internal_error",
      cause: err,
    });
  }
}
