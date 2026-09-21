import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { loadAttendanceRoster } from "@/lib/school-admin/attendance/attendance-roster";
import {
  AttendanceMutationError,
  parseAttendanceDate,
} from "@/lib/school-admin/attendance/attendance-mutations";
import {
  requireTeacherAttendanceAccess,
  TeacherPortalAuthError,
} from "@/lib/school-teacher/attendance/require-teacher-attendance-access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/teacher-portal/attendance";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";
  const date =
    searchParams.get("date")?.trim() ?? new Date().toISOString().slice(0, 10);

  if (!organizationId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId is required.",
      code: "missing_fields",
    });
  }

  try {
    parseAttendanceDate(date);
    await requireTeacherAttendanceAccess(supabase, organizationId);

    const admin = createAdminClient();
    const roster = await loadAttendanceRoster(admin, organizationId, date);

    return NextResponse.json(roster);
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

    if (err instanceof AttendanceMutationError) {
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
      error: "Failed to load attendance roster.",
      code: "internal_error",
      cause: err,
    });
  }
}
