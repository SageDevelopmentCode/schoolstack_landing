import { NextResponse } from "next/server";
import { formatScheduledVisitWhenLabel } from "@/lib/admissions/admissions-availability";
import { AdmissionsBookingError } from "@/lib/admissions/admissions-booking";
import { bookPublicCampusTour } from "@/lib/admissions/public-tour-booking";
import { loadPublicTourOrgBySlug } from "@/lib/admissions/public-tour-org";
import {
  ACTIVITY_ACTIONS,
  logActivityEvent,
} from "@/lib/activity-log";
import { sendPublicTourBookingAdminNotifications } from "@/lib/admissions/application-notifications";
import { apiError } from "@/lib/api/route-errors";
import { enforcePublicFormSubmission } from "@/lib/public-forms/enforce-public-form-submission";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/public/tours/schedule";

type ScheduleBody = {
  slug?: string;
  scheduledDate?: string;
  startTimeSlot?: string;
  answers?: Record<string, unknown>;
  turnstileToken?: string;
};

export async function POST(request: Request) {
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

  const slug = body.slug?.trim();
  const scheduledDate = body.scheduledDate?.trim();
  const startTimeSlot = body.startTimeSlot?.trim();
  const answers =
    body.answers && typeof body.answers === "object" && !Array.isArray(body.answers)
      ? body.answers
      : null;

  const emailAnswer =
    answers && typeof answers.email === "string" ? answers.email : null;

  const protection = await enforcePublicFormSubmission({
    request,
    form: "public_tour_booking",
    email: emailAnswer,
    turnstileToken: body.turnstileToken,
  });
  if (!protection.ok) {
    return apiError(ROUTE, {
      request,
      status: protection.status,
      error: protection.error,
      code: protection.code,
    });
  }

  if (!slug || !scheduledDate || !startTimeSlot || !answers) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "slug, scheduledDate, startTimeSlot, and answers are required.",
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

    const booking = await bookPublicCampusTour(admin, {
      organizationId: org.organizationId,
      scheduledDate,
      startTimeSlot,
      answers,
    });

    const whenLabel = formatScheduledVisitWhenLabel({
      schedulingMode: "time_slot",
      scheduledDate: booking.scheduledDate,
      startTimeSlot: booking.startTimeSlot,
      durationMinutes: booking.durationMinutes,
    });

    void logActivityEvent(admin, {
      organizationId: org.organizationId,
      actorType: "parent",
      actorEmail: booking.registrant.contactEmail,
      surface: "public_apply",
      action: ACTIVITY_ACTIONS.ADMISSIONS_TOUR_SCHEDULED_PRE_APPLICATION,
      entityType: "scheduled_visit",
      entityId: booking.visitId,
      summary: `Public campus tour scheduled for ${whenLabel}`,
      metadata: {
        visitId: booking.visitId,
        scheduledDate,
        startTimeSlot,
        bookingSource: "public",
      },
    });

    void sendPublicTourBookingAdminNotifications(admin, {
      organizationId: org.organizationId,
      booking,
      schoolName: org.name,
    });

    return NextResponse.json({
      success: true,
      visitId: booking.visitId,
      whenLabel,
    });
  } catch (error) {
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
      error: "Failed to schedule tour.",
      cause: error,
    });
  }
}
