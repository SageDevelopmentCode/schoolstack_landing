import { NextResponse } from "next/server";
import { getPublicTourBookableAvailability } from "@/lib/admissions/public-tour-booking";
import { loadPublicTourOrgBySlug } from "@/lib/admissions/public-tour-org";
import { apiError } from "@/lib/api/route-errors";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/public/tours/availability";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug")?.trim();
  const startDate = searchParams.get("start")?.trim();
  const endDate = searchParams.get("end")?.trim();

  if (!slug || !startDate || !endDate) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "slug, start, and end are required.",
      code: "invalid_request",
    });
  }

  try {
    const admin = createAdminClient();
    const org = await loadPublicTourOrgBySlug(admin, slug);
    if (!org || !org.enabled) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Tour booking is not available.",
        code: "not_found",
      });
    }

    const availability = await getPublicTourBookableAvailability(
      admin,
      org.organizationId,
      startDate,
      endDate,
    );

    return NextResponse.json({
      organizationId: org.organizationId,
      timezone: availability.timezone,
      mode: availability.mode,
      availability: availability.availability,
      slotMeta: availability.slotMeta,
    });
  } catch (error) {
    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to load availability.",
      cause: error,
    });
  }
}
