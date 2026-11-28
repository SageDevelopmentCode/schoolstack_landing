import { NextResponse } from "next/server";
import { coopPortalApiError } from "@/lib/parent-portal/coop-portal-api-route";
import { loadParentCoopTeachingSchedulePageDataForUser } from "@/lib/parent-portal/load-parent-coop-portal-page-data";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";

const ROUTE = "/api/parent-portal/coop/teaching-schedule";

export const GET = withParentPortalRoute(
  {
    route: ROUTE,
    programScope: "required",
    forbiddenMessage: "You do not have access to this program.",
    fallbackErrorMessage: "Failed to load teaching schedule.",
  },
  async ({ request, supabase, organizationId, programId, access }) => {
    try {
      const payload = await loadParentCoopTeachingSchedulePageDataForUser({
        supabase,
        organizationId,
        programId: programId!,
        access,
      });
      return NextResponse.json(payload);
    } catch (err) {
      return coopPortalApiError(ROUTE, request, err, "Failed to load teaching schedule.");
    }
  },
);
