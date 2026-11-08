import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { fetchOrganizationWithSettingsUncached } from "@/lib/organization-settings/fetch";
import { loadParentPortalHomeApiPayload } from "@/lib/parent-portal/load-parent-portal-home-api-payload";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";

const ROUTE = "/api/parent-portal/home";

export const GET = withParentPortalRoute(
  {
    route: ROUTE,
    // loadParentPortalHomeApiPayload enforces main / program access and throws forbidden.
    enforceAccess: false,
    missingOrganizationMessage: "organizationId and slug are required.",
    fallbackErrorMessage: "Failed to load home data.",
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

    const programSlug =
      url.searchParams.get("programSlug")?.trim() || undefined;

    try {
      const org = await fetchOrganizationWithSettingsUncached(supabase, slug);
      if (!org || org.id !== organizationId) {
        return apiError(ROUTE, {
          request,
          status: 404,
          error: "School not found.",
          code: "not_found",
        });
      }

      const payload = await loadParentPortalHomeApiPayload({
        supabase,
        user,
        org,
        slug,
        programSlug,
      });

      return NextResponse.json(payload);
    } catch (err) {
      if (err instanceof Error) {
        if (
          err.message === "forbidden" ||
          err.message === "forbidden_program"
        ) {
          return apiError(ROUTE, {
            request,
            status: 403,
            error: "You do not have access to the parent portal.",
            code: "forbidden",
          });
        }
        if (err.message === "program_not_found") {
          return apiError(ROUTE, {
            request,
            status: 404,
            error: "Program not found.",
            code: "program_not_found",
          });
        }
      }

      return apiError(ROUTE, {
        request,
        status: 500,
        error: "Failed to load home data.",
        cause: err,
        code: "internal_error",
      });
    }
  },
);
