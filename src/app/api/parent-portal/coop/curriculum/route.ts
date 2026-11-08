import { NextResponse } from "next/server";
import { coopPortalApiError } from "@/lib/parent-portal/coop-portal-api-route";
import { loadParentCoopCurriculumPageDataForUser } from "@/lib/parent-portal/load-parent-coop-portal-page-data";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";

const ROUTE = "/api/parent-portal/coop/curriculum";

export const GET = withParentPortalRoute(
  {
    route: ROUTE,
    programScope: "required",
    forbiddenMessage: "You do not have access to this program.",
    fallbackErrorMessage: "Failed to load curriculum.",
  },
  async ({ request, supabase, user, organizationId, programId }) => {
    try {
      const payload = await loadParentCoopCurriculumPageDataForUser({
        supabase,
        userId: user.id,
        organizationId,
        programId: programId!,
      });
      return NextResponse.json(payload);
    } catch (err) {
      return coopPortalApiError(ROUTE, request, err, "Failed to load curriculum.");
    }
  },
);
