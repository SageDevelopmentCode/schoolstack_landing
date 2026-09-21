import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { loadStudentAttendanceHistory } from "@/lib/school-admin/attendance/attendance-history";
import {
  requireTeacherAttendanceAccess,
  TeacherPortalAuthError,
} from "@/lib/school-teacher/attendance/require-teacher-attendance-access";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/teacher-portal/attendance/history";

export async function GET(request: Request) {
  const supabase = await createClientFromRequest(request);
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";
  const studentId = searchParams.get("studentId")?.trim() ?? "";
  const limitParam = searchParams.get("limit")?.trim();
  const offsetParam = searchParams.get("offset")?.trim();
  const limit = limitParam ? Number.parseInt(limitParam, 10) : 14;
  const offset = offsetParam ? Number.parseInt(offsetParam, 10) : 0;

  if (!organizationId || !studentId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId and studentId are required.",
      code: "missing_fields",
    });
  }

  try {
    await requireTeacherAttendanceAccess(supabase, organizationId);

    const admin = createAdminClient();
    const history = await loadStudentAttendanceHistory(admin, organizationId, studentId, {
      limit: Number.isFinite(limit) ? limit : 14,
      offset: Number.isFinite(offset) ? offset : 0,
    });

    return NextResponse.json(history);
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

    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to load attendance history.",
      code: "internal_error",
      cause: err,
    });
  }
}
