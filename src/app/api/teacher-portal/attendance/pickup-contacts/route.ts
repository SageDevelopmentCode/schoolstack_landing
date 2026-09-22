import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { loadAttendancePickupContacts } from "@/lib/school-admin/attendance/attendance-pickup-contacts";
import {
  requireTeacherAttendanceAccess,
  TeacherPortalAuthError,
} from "@/lib/school-teacher/attendance/require-teacher-attendance-access";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/teacher-portal/attendance/pickup-contacts";

export async function GET(request: Request) {
  const supabase = await createClientFromRequest(request);
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";
  const familyId = searchParams.get("familyId")?.trim() ?? "";
  const studentId = searchParams.get("studentId")?.trim() ?? "";

  if (!organizationId || !familyId || !studentId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId, familyId, and studentId are required.",
      code: "missing_fields",
    });
  }

  try {
    await requireTeacherAttendanceAccess(supabase, organizationId);

    const admin = createAdminClient();
    const contacts = await loadAttendancePickupContacts(
      admin,
      organizationId,
      studentId,
      familyId,
    );

    return NextResponse.json({ contacts });
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
      error: "Failed to load pickup contacts.",
      code: "internal_error",
      cause: err,
    });
  }
}
