import { NextResponse } from "next/server";
import { parsePagination } from "@/lib/api/pagination";
import { apiError } from "@/lib/api/route-errors";
import { userIsGuardianForStudent } from "@/lib/admissions/parent-portal-access";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";
import { loadStudentAttendanceHistory } from "@/lib/school-admin/attendance/attendance-history";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/students/[studentId]/attendance/history";

export const GET = withParentPortalRoute<undefined, { studentId: string }>(
  {
    route: ROUTE,
    enforceAccess: false,
    feature: "attendance",
    fallbackErrorMessage: "Failed to load attendance history.",
  },
  async ({ request, supabase, user, organizationId, access, params }) => {
    const { studentId } = params;
    const { limit, offset } = parsePagination(new URL(request.url).searchParams, {
      defaultLimit: 20,
      maxLimit: 60,
    });

    const isGuardian = await userIsGuardianForStudent(
      supabase,
      user.id,
      organizationId,
      studentId,
      access,
    );

    if (!isGuardian) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "You do not have permission to view this student's attendance history.",
        code: "forbidden",
      });
    }

    try {
      const admin = createAdminClient();
      const history = await loadStudentAttendanceHistory(admin, organizationId, studentId, {
        limit,
        offset,
      });

      return NextResponse.json(history);
    } catch (error) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: "Failed to load attendance history.",
        code: "internal_error",
        cause: error,
      });
    }
  },
);
