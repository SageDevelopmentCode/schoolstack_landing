import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  AdmissionsBookingError,
  getBookableAvailabilityForAction,
} from "@/lib/admissions/admissions-booking";
import { defaultFamilyCampusTourAction } from "@/lib/admissions/family-tour-booking";
import {
  AuthError,
  getFamilyIdsForUser,
  requireAuthenticatedUser,
} from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admissions/family-tours/availability";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId");
  const startDate = searchParams.get("start");
  const endDate = searchParams.get("end");

  if (!organizationId || !startDate || !endDate) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId, start, and end are required.",
      code: "invalid_request",
    });
  }

  try {
    const user = await requireAuthenticatedUser(supabase);
    const familyIds = await getFamilyIdsForUser(
      supabase,
      user.id,
      organizationId,
    );

    if (familyIds.length === 0) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Family not found.",
        code: "not_found",
      });
    }

    const admin = createAdminClient();
    const availability = await getBookableAvailabilityForAction(
      admin,
      organizationId,
      defaultFamilyCampusTourAction(),
      startDate,
      endDate,
    );

    return NextResponse.json(availability);
  } catch (error) {
    if (error instanceof AuthError) {
      return apiError(ROUTE, {
        request,
        status: error.status,
        error: error.message,
        code: error.code,
      });
    }

    if (error instanceof AdmissionsBookingError) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: error.message,
        code: error.code,
      });
    }

    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to load availability.",
      cause: error,
    });
  }
}
