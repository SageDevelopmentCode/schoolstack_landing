import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { loadMobileParentPortalContextsForUser } from "@/lib/parent-portal/resolve-coop-program-context";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";

const ROUTE = "/api/parent-portal/portal-contexts";

export const GET = withParentPortalRoute(
  {
    route: ROUTE,
    missingOrganizationMessage: "organizationId and slug are required.",
    fallbackErrorMessage: "Failed to load parent portal contexts.",
  },
  async ({ request, supabase, user, organizationId }) => {
    const url = new URL(request.url);
    const slug = url.searchParams.get("slug")?.trim() ?? "";
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

      const payload = await loadMobileParentPortalContextsForUser({
        supabase,
        userId: user.id,
        organizationId,
        slug,
        schoolName: org.name,
        orgFeatures: org.features,
      });

      return NextResponse.json(payload);
    } catch (err) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: "Failed to load parent portal contexts.",
        cause: err,
        code: "internal_error",
      });
    }
  },
);
