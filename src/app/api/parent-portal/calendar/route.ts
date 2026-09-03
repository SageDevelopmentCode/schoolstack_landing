import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { userHasEnrolledAccess } from "@/lib/admissions/parent-portal-access";
import { getOrganizationTimezone } from "@/lib/admissions/admissions-availability";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { listEventsForOrg } from "@/lib/school-events/events";
import { createClientFromRequest } from "@/lib/supabase/request-client";

const ROUTE = "/api/parent-portal/calendar";

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
  const slug = url.searchParams.get("slug")?.trim() ?? "";
  const startDate = url.searchParams.get("start")?.trim() ?? "";
  const endDate = url.searchParams.get("end")?.trim() ?? "";

  if (!organizationId || !slug) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId and slug are required.",
      code: "missing_fields",
    });
  }

  try {
    const org = await fetchOrganizationWithSettings(supabase, slug);
    if (!org || org.id !== organizationId) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "School not found.",
        code: "not_found",
      });
    }

    const hasAccess = await userHasEnrolledAccess(supabase, user.id, organizationId);
    if (!hasAccess) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "You do not have access to the parent portal.",
        code: "forbidden",
      });
    }

    const eventWindow =
      startDate && endDate
        ? { startDate, endDate }
        : undefined;

    const [events, timezone] = await Promise.all([
      listEventsForOrg(supabase, organizationId, eventWindow),
      getOrganizationTimezone(supabase, organizationId),
    ]);

    return NextResponse.json({ events, timezone });
  } catch (err) {
    return apiError(ROUTE, {
      request,
      status: 500,
      error: err instanceof Error ? err.message : "Failed to load calendar data.",
      code: "internal_error",
      cause: err,
    });
  }
}
