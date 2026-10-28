import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { listFamilyChildrenForHome } from "@/lib/admissions/parent-portal-access";
import { userHasAccessForOptionalProgramScope } from "@/lib/admissions/program-parent-portal-access";
import { filterFamilyChildrenForProgramPortal } from "@/components/school-parent/children/parent-children-utils";
import { filterPhotoPermissionChildren } from "@/lib/parent-portal/photos/filter-photo-permission-children";
import { photoMediaConsentLabel } from "@/lib/students/photo-media-consent";
import { loadStudentPhotoMediaConsents } from "@/lib/students/load-student-photo-media-consents";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { createAdminClient } from "@/utils/supabase/admin";
import {
  createClientFromRequest,
  getUserFromRequest,
  signedInErrorForRequest,
} from "@/lib/supabase/request-client";

const ROUTE = "/api/parent-portal/photo-media-consents";

export async function GET(request: Request) {
  const supabase = await createClientFromRequest(request);
  const {
    data: { user },
    error: authError,
  } = await getUserFromRequest(supabase, request);

  if (!user) {
    return apiError(ROUTE, {
      request,
      status: 401,
      error: await signedInErrorForRequest(request, authError),
      code: "unauthorized",
    });
  }

  const url = new URL(request.url);
  const organizationId = url.searchParams.get("organizationId")?.trim() ?? "";
  const slug = url.searchParams.get("slug")?.trim() ?? "";
  const programId = url.searchParams.get("programId")?.trim() ?? "";

  if (!organizationId || !slug) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId and slug are required.",
      code: "missing_fields",
    });
  }

  try {
    const admin = createAdminClient();
    const org = await fetchOrganizationWithSettings(admin, slug);
    if (!org || org.id !== organizationId) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "School not found.",
        code: "not_found",
      });
    }

    const hasAccess = await userHasAccessForOptionalProgramScope(
      supabase,
      user.id,
      organizationId,
      programId,
    );
    if (!hasAccess) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "You do not have access to the parent portal.",
        code: "forbidden",
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
}
