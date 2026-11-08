import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { loadParentSignupAttentionItems } from "@/lib/classroom-signups/load-parent-signups";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";
import { createAdminClient } from "@/utils/supabase/admin";
import { resolveSignupAttentionFamilyId } from "./resolve-family-id";

const ROUTE = "/api/parent-portal/signups/attention";

export const GET = withParentPortalRoute(
  {
    route: ROUTE,
    fallbackErrorMessage: "Failed to load signup attention items.",
  },
  async ({ request, organizationId, access }) => {
    const requestedFamilyId =
      new URL(request.url).searchParams.get("familyId")?.trim() ?? "";
    const familyIds = access.familyIds;

    try {
      const resolvedFamily = resolveSignupAttentionFamilyId(
        familyIds,
        requestedFamilyId,
      );
      if ("error" in resolvedFamily) {
        return apiError(ROUTE, {
          request,
          status: 403,
          error: "You do not have access to this family.",
          code: "forbidden",
        });
      }

      const familyId = resolvedFamily.familyId;
      if (!familyId) {
        return NextResponse.json({ items: [] });
      }

      const admin = createAdminClient();
      const items = await loadParentSignupAttentionItems(
        admin,
        organizationId,
        familyId,
      );

      return NextResponse.json({ items });
    } catch (err) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: "Failed to load signup attention items.",
        cause: err,
        code: "internal_error",
      });
    }
  },
);
