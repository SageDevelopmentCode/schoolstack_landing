import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { listFamilyChildrenForHome } from "@/lib/admissions/parent-portal-access";
import { fetchOrganizationWithSettingsUncached } from "@/lib/organization-settings/fetch";
import { isParentFeatureEnabled } from "@/lib/organization-settings/parent-routes";
import { resolveMainParentOrganizationFeatures } from "@/lib/organization-settings/resolve-program-parent-features";
import { loadParentAttendanceEligibleChildren } from "@/lib/parent-portal/attendance/load-parent-attendance-page-data";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/attendance/eligible-children";

export const GET = withParentPortalRoute(
  {
    route: ROUTE,
    fallbackErrorMessage: "Failed to load attendance children.",
  },
  async ({ request, supabase, user, organizationId }) => {
    try {
      const admin = createAdminClient();
      const { data: organization, error: orgError } = await admin
        .from("organizations")
        .select("slug")
        .eq("id", organizationId)
        .maybeSingle();

      if (orgError) throw orgError;
      if (!organization?.slug) {
        return apiError(ROUTE, {
          request,
          status: 404,
          error: "Organization not found.",
          code: "not_found",
        });
      }

      const org = await fetchOrganizationWithSettingsUncached(supabase, String(organization.slug));

      if (!org) {
        return apiError(ROUTE, {
          request,
          status: 404,
          error: "Organization not found.",
          code: "not_found",
        });
      }

      const features = resolveMainParentOrganizationFeatures(org.features);
      if (!isParentFeatureEnabled(features, "attendance")) {
        return apiError(ROUTE, {
          request,
          status: 403,
          error: "Attendance is not enabled for this school.",
          code: "feature_disabled",
        });
      }

      const familyChildren = await listFamilyChildrenForHome(supabase, organizationId, user.id);
      const eligibleChildren = await loadParentAttendanceEligibleChildren(
        admin,
        organizationId,
        features,
        familyChildren,
      );

      return NextResponse.json({
        eligibleChildren: eligibleChildren
          .filter((child) => child.studentId)
          .map((child) => ({
            applicationId: child.applicationId,
            studentId: child.studentId!,
            studentName: child.studentName,
            profilePhotoUrl: child.profilePhotoUrl,
            grade: child.grade,
          })),
      });
    } catch (err) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: "Failed to load attendance children.",
        cause: err,
        code: "load_failed",
      });
    }
  },
);
