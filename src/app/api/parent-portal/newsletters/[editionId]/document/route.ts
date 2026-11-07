import { apiError } from "@/lib/api/route-errors";
import { loadParentNewsletterDetailBundleForOrganization } from "@/lib/parent-portal/newsletters/load-parent-newsletters";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/newsletters/[editionId]/document";

type EditionParams = { editionId: string };

export const GET = withParentPortalRoute<undefined, EditionParams>(
  {
    route: ROUTE,
    missingOrganizationMessage: "organizationId and editionId are required.",
    fallbackErrorMessage: "Failed to load newsletter.",
  },
  async ({ request, organizationId, params }) => {
    const { editionId } = params;
    if (!editionId) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "organizationId and editionId are required.",
        code: "missing_fields",
      });
    }

    try {
      const admin = createAdminClient();
      const result = await loadParentNewsletterDetailBundleForOrganization(
        admin,
        organizationId,
        editionId,
      );

      if (!result.ok) {
        if (
          result.reason === "org_not_found" ||
          result.reason === "not_found"
        ) {
          return apiError(ROUTE, {
            request,
            status: 404,
            error:
              result.reason === "org_not_found"
                ? "School not found."
                : "Newsletter not found.",
            code: "not_found",
          });
        }
        return apiError(ROUTE, {
          request,
          status: 403,
          error: "Newsletters are not available for this school.",
          code: "feature_disabled",
        });
      }

      return new Response(result.bundle.htmlDocument, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "private, no-store",
        },
      });
    } catch (err) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: "Failed to load newsletter.",
        cause: err,
        code: "load_failed",
      });
    }
  },
);
