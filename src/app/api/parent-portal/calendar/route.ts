import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { getOrganizationTimezone } from "@/lib/admissions/admissions-availability";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";
import { listEventsForOrg } from "@/lib/school-events/events";
import {
  mainPortalAudienceScope,
  programPortalAudienceScope,
} from "@/lib/school-events/event-audience";

const ROUTE = "/api/parent-portal/calendar";

export const GET = withParentPortalRoute(
  {
    route: ROUTE,
    programScope: "optional",
    feature: "calendar",
    missingOrganizationMessage: "organizationId and slug are required.",
    fallbackErrorMessage: "Failed to load calendar data.",
  },
  async ({ request, supabase, organizationId, programId }) => {
    const url = new URL(request.url);
    const slug = url.searchParams.get("slug")?.trim() ?? "";
    const startDate = url.searchParams.get("start")?.trim() ?? "";
    const endDate = url.searchParams.get("end")?.trim() ?? "";

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

      const eventWindow = startDate && endDate ? { startDate, endDate } : undefined;

      const [events, timezone] = await Promise.all([
        listEventsForOrg(supabase, organizationId, {
          ...eventWindow,
          audienceScope: programId
            ? programPortalAudienceScope(programId)
            : mainPortalAudienceScope(),
        }),
        getOrganizationTimezone(supabase, organizationId),
      ]);

      return NextResponse.json({ events, timezone });
    } catch (err) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: "Failed to load calendar data.",
        cause: err,
        code: "internal_error",
      });
    }
  },
);
