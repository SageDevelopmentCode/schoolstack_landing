import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";
import { listEventsForOrg } from "@/lib/school-events/events";
import {
  mainPortalAudienceScope,
  programPortalAudienceScope,
} from "@/lib/school-events/event-audience";

const ROUTE = "/api/parent-portal/calendar/events";

export const GET = withParentPortalRoute(
  {
    route: ROUTE,
    programScope: "optional",
    feature: "calendar",
    missingOrganizationMessage: "organizationId, start, and end are required.",
    fallbackErrorMessage: "Failed to load calendar events.",
  },
  async ({ request, supabase, organizationId, programId }) => {
    const url = new URL(request.url);
    const startDate = url.searchParams.get("start")?.trim() ?? "";
    const endDate = url.searchParams.get("end")?.trim() ?? "";

    if (!startDate || !endDate) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "organizationId, start, and end are required.",
        code: "missing_fields",
      });
    }

    try {
      const events = await listEventsForOrg(supabase, organizationId, {
        startDate,
        endDate,
        audienceScope: programId
          ? programPortalAudienceScope(programId)
          : mainPortalAudienceScope(),
      });

      return NextResponse.json({ events });
    } catch (err) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: "Failed to load calendar events.",
        cause: err,
        code: "internal_error",
      });
    }
  },
);
