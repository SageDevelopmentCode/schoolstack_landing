import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  loadApplicationDetail,
  loadAssignedTeachersForStudent,
} from "@/lib/admissions/parent-portal-access";
import { loadEnrollmentChecklistForApplication } from "@/lib/admissions/enrollment-checklist-materialization";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/children/[applicationId]/profile";

export const GET = withParentPortalRoute<undefined, { applicationId: string }>(
  {
    route: ROUTE,
    missingOrganizationMessage: "organizationId and applicationId are required.",
    fallbackErrorMessage: "Failed to load student profile.",
  },
  async ({ request, supabase, organizationId, params }) => {
    const { applicationId } = params;

    try {
      const [application, checklist] = await Promise.all([
        loadApplicationDetail(supabase, applicationId, organizationId),
        loadEnrollmentChecklistForApplication(supabase, applicationId, organizationId),
      ]);

      if (!application) {
        return apiError(ROUTE, {
          request,
          status: 404,
          error: "Student profile not found.",
          code: "not_found",
        });
      }

      const admin = createAdminClient();
      const assignedTeachers = application.studentId
        ? await loadAssignedTeachersForStudent(admin, organizationId, application.studentId)
        : [];

      return NextResponse.json({
        profile: {
          application,
          checklist,
          assignedTeachers,
        },
      });
    } catch (err) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: "Failed to load student profile.",
        cause: err,
        code: "internal_error",
      });
    }
  },
);
