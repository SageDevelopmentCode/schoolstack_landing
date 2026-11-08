import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  loadAssignedTeachersForStudent,
  userIsGuardianForStudent,
} from "@/lib/admissions/parent-portal-access";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/students/[studentId]/teachers";

export const GET = withParentPortalRoute<undefined, { studentId: string }>(
  {
    route: ROUTE,
    // Authorization is per student (guardian of this child), not enrolled access.
    enforceAccess: false,
    fallbackErrorMessage: "Failed to load assigned teachers.",
  },
  async ({ request, supabase, user, organizationId, access, params }) => {
    const { studentId } = params;

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
        error: "You do not have permission to view this student's teachers.",
        code: "forbidden",
      });
    }

    try {
      const admin = createAdminClient();
      const teachers = await loadAssignedTeachersForStudent(admin, organizationId, studentId);

      return NextResponse.json({ teachers });
    } catch (error) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: "Failed to load assigned teachers.",
        cause: error,
        code: "internal_error",
      });
    }
  },
);
