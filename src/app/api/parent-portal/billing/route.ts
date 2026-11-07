import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";
import { loadParentBillingInitialDataWithClient } from "@/lib/tuition/load-parent-billing-data";

const ROUTE = "/api/parent-portal/billing";

export const GET = withParentPortalRoute(
  {
    route: ROUTE,
    feature: "billing",
    missingOrganizationMessage: "organizationId and slug are required.",
    fallbackErrorMessage: "Failed to load billing data.",
  },
  async ({ request, supabase, user, organizationId, familyId }) => {
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
      const org = await fetchOrganizationWithSettings(slug);
      if (!org || org.id !== organizationId) {
        return apiError(ROUTE, {
          request,
          status: 404,
          error: "School not found.",
          code: "not_found",
        });
      }

      if (!familyId) {
        return apiError(ROUTE, {
          request,
          status: 404,
          error: "Family not found.",
          code: "not_found",
        });
      }

      const billingData = await loadParentBillingInitialDataWithClient(supabase, {
        organizationId,
        familyId,
        slug,
        userId: user.id,
      });

      return NextResponse.json({
        branding: org.branding,
        schoolSlug: slug,
        schoolName: org.name,
        organizationId: org.id,
        familyId,
        ...billingData,
      });
    } catch (err) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: "Failed to load billing data.",
        cause: err,
        code: "internal_error",
      });
    }
  },
);
