import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  AdmissionsBookingError,
  bookAdmissionsVisit,
} from "@/lib/admissions/admissions-booking";
import {
  AuthError,
  requireAuthenticatedUser,
  userOwnsApplication,
} from "@/lib/admissions/application-auth";
import { sendPostSubmitVisitScheduledNotifications } from "@/lib/admissions/application-notifications";
import { apiError } from "@/lib/api/route-errors";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admissions/applications/[id]/post-submit/schedule";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type ScheduleBody = {
  actionId?: string;
  scheduledDate?: string;
  startTimeSlot?: string;
};

export async function POST(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { id: applicationId } = await context.params;

  let body: ScheduleBody;
  try {
    body = (await request.json()) as ScheduleBody;
  } catch {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Invalid request body.",
      code: "invalid_request",
    });
  }

  const actionId = body.actionId?.trim();
  const scheduledDate = body.scheduledDate?.trim();
  const startTimeSlot = body.startTimeSlot?.trim();

  if (!actionId || !scheduledDate || !startTimeSlot) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "actionId, scheduledDate, and startTimeSlot are required.",
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
    const booking = await bookAdmissionsVisit(
      admin,
      applicationId,
      actionId,
      scheduledDate,
      startTimeSlot,
    );

    void sendPostSubmitVisitScheduledNotifications(admin, applicationId, booking);

    return NextResponse.json({
      booking: {
        scheduledDate: booking.scheduledDate,
        startTimeSlot: booking.startTimeSlot,
        durationMinutes: booking.durationMinutes,
      },
    });
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
      const status = error.code === "already_scheduled" ? 409 : 400;
      return apiError(ROUTE, {
        request,
        status,
        error: error.message,
        code: error.code,
      });
    }

    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to schedule visit.",
      cause: error,
    });
  }
}
