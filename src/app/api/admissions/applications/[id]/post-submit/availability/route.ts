import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  AdmissionsBookingError,
  getBookableAvailabilityForAction,
  loadPostSubmitActionForApplication,
} from "@/lib/admissions/admissions-booking";
import {
  AuthError,
  requireAuthenticatedUser,
  userOwnsApplication,
} from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admissions/applications/[id]/post-submit/availability";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { id: applicationId } = await context.params;
  const { searchParams } = new URL(request.url);
  const actionId = searchParams.get("actionId");
  const startDate = searchParams.get("start");
  const endDate = searchParams.get("end");

  if (!actionId || !startDate || !endDate) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "actionId, start, and end are required.",
      code: "invalid_request",
    });
  }

  try {
    const user = await requireAuthenticatedUser(supabase);
    const ownsApplication = await userOwnsApplication(
      supabase,
      user.id,
      applicationId,
    );

    if (!ownsApplication) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Application not found.",
        code: "not_found",
      });
    }

    const admin = createAdminClient();
    const contextRow = await loadPostSubmitActionForApplication(
      admin,
      applicationId,
      actionId,
    );

    if (!contextRow) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Scheduling step not found.",
        code: "not_found",
      });
    }

    if (contextRow.applicationStatus === "draft") {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Submit your application before scheduling visits.",
        code: "application_not_submitted",
      });
    }

    const availability = await getBookableAvailabilityForAction(
      admin,
      contextRow.organizationId,
      contextRow.action,
      startDate,
      endDate,
    );

    return NextResponse.json({ availability });
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
