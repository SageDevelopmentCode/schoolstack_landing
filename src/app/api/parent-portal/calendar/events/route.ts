import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { userHasEnrolledAccess } from "@/lib/admissions/parent-portal-access";
import { listEventsForOrg } from "@/lib/school-events/events";
import {
  mainPortalAudienceScope,
  programPortalAudienceScope,
} from "@/lib/school-events/event-audience";
import { createClientFromRequest } from "@/lib/supabase/request-client";

const ROUTE = "/api/parent-portal/calendar/events";

export async function GET(request: Request) {
  const supabase = await createClientFromRequest(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError(ROUTE, {
      request,
      status: 401,
      error: "You must be signed in.",
      code: "unauthorized",
    });
  }

  const url = new URL(request.url);
  const organizationId = url.searchParams.get("organizationId")?.trim() ?? "";
  const programId = url.searchParams.get("programId")?.trim() ?? "";
  const startDate = url.searchParams.get("start")?.trim() ?? "";
  const endDate = url.searchParams.get("end")?.trim() ?? "";

  if (!organizationId || !startDate || !endDate) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId, start, and end are required.",
      code: "missing_fields",
    });
  }

  try {
    const hasAccess = await userHasEnrolledAccess(supabase, user.id, organizationId);
    if (!hasAccess) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "You do not have access to the parent portal.",
        code: "forbidden",
      });
    }

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
      error: err instanceof Error ? err.message : "Failed to load calendar events.",
      code: "internal_error",
      cause: err,
    });
  }
}
