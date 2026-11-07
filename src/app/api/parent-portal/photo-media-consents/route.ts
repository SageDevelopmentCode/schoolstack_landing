import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { listFamilyChildrenForHome } from "@/lib/admissions/parent-portal-access";
import { filterFamilyChildrenForProgramPortal } from "@/components/school-parent/children/parent-children-utils";
import { filterPhotoPermissionChildren } from "@/lib/parent-portal/photos/filter-photo-permission-children";
import { photoMediaConsentLabel } from "@/lib/students/photo-media-consent";
import { loadStudentPhotoMediaConsents } from "@/lib/students/load-student-photo-media-consents";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { createAdminClient } from "@/utils/supabase/admin";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";

const ROUTE = "/api/parent-portal/photo-media-consents";

export const GET = withParentPortalRoute(
  {
    route: ROUTE,
    programScope: "optional",
    missingOrganizationMessage: "organizationId and slug are required.",
    fallbackErrorMessage: "Failed to load photo permissions.",
  },
  async ({ request, supabase, user, organizationId, programId }) => {
    const slug = new URL(request.url).searchParams.get("slug")?.trim() ?? "";
    if (!slug) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "organizationId and slug are required.",
        code: "missing_fields",
      });
    }

    try {
      const admin = createAdminClient();
      const org = await fetchOrganizationWithSettings(slug);
      if (!org || org.id !== organizationId) {
        return apiError(ROUTE, {
          request,
          status: 404,
          error: "School not found.",
          code: "not_found",
        });
      }

      const allFamilyChildren = await listFamilyChildrenForHome(
        supabase,
        organizationId,
        user.id,
      );
      const scopedChildren = programId
        ? filterFamilyChildrenForProgramPortal(allFamilyChildren, programId)
        : allFamilyChildren;
      const eligibleChildren = filterPhotoPermissionChildren(scopedChildren);
      const studentIds = eligibleChildren
        .map((child) => child.studentId)
        .filter((studentId): studentId is string => Boolean(studentId));

      const consentRows = await loadStudentPhotoMediaConsents(
        admin,
        organizationId,
        studentIds,
      );
      const consentByStudentId = new Map(
        consentRows.map((row) => [row.studentId, row]),
      );

      const learners = eligibleChildren
        .filter((child): child is typeof child & { studentId: string } =>
          Boolean(child.studentId),
        )
        .map((child) => {
          const row = consentByStudentId.get(child.studentId);
          const consent = row?.consent ?? null;
          return {
            studentId: child.studentId,
            studentName: child.studentName,
            consent,
            consentLabel: photoMediaConsentLabel(consent),
            updatedAt: row?.updatedAt ?? null,
          };
        });

      return NextResponse.json({ learners });
    } catch (error) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: "Failed to load photo permissions.",
        cause: error,
        code: "load_failed",
      });
    }
  },
);
