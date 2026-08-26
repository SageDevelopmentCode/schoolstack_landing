import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  AdmissionsBookingError,
  bookAdmissionsVisit,
  normalizeScheduledDates,
  normalizeScheduledSlotIds,
} from "@/lib/admissions/admissions-booking";
import { formatScheduledVisitWhenLabel } from "@/lib/admissions/admissions-availability";
import {
  AuthError,
  requireAuthenticatedUser,
  userOwnsApplication,
} from "@/lib/admissions/application-auth";
import { sendPostSubmitVisitScheduledNotifications } from "@/lib/admissions/application-notifications";
import {
  ACTIVITY_ACTIONS,
  logActivityEvent,
} from "@/lib/activity-log";
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
  scheduledDates?: string[];
  slotIds?: string[];
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
  const scheduledDates = Array.isArray(body.scheduledDates)
    ? normalizeScheduledDates(body.scheduledDates)
    : undefined;
  const slotIds = Array.isArray(body.slotIds)
    ? normalizeScheduledSlotIds(body.slotIds)
    : undefined;

  if (!actionId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "actionId is required.",
      code: "invalid_request",
    });
  }

  if (!scheduledDates?.length && !slotIds?.length && !scheduledDate) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "scheduledDate, scheduledDates, or slotIds is required.",
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
      scheduledDate ?? scheduledDates?.[0] ?? slotIds?.[0] ?? "",
      startTimeSlot,
      scheduledDates,
      slotIds,
    );

    await sendPostSubmitVisitScheduledNotifications(admin, applicationId, booking);

    const whenLabel = formatScheduledVisitWhenLabel(booking);

    void logActivityEvent(admin, {
      organizationId: booking.organizationId,
      actorType: "parent",
      actorUserId: user.id,
      actorEmail: user.email,
      surface: "parent_portal",
      action: ACTIVITY_ACTIONS.POST_SUBMIT_VISIT_SCHEDULED,
      entityType: "admissions_scheduled_visit",
      entityId: booking.id,
      summary: `Visit scheduled for ${whenLabel}`,
      metadata: {
        applicationId,
        actionId,
        actionType: booking.actionType,
        schedulingMode: booking.schedulingMode,
        scheduledDate: booking.scheduledDate,
        endDate: booking.endDate,
        visitDates: booking.visitDates,
        observationSlots: booking.observationSlots,
        startTimeSlot: booking.startTimeSlot,
        durationMinutes: booking.durationMinutes,
        visitDayCount: booking.visitDayCount,
      },
    });

    return NextResponse.json({
      booking: {
        schedulingMode: booking.schedulingMode,
        scheduledDate: booking.scheduledDate,
        endDate: booking.endDate,
        visitDates: booking.visitDates,
        observationSlots: booking.observationSlots,
        startTimeSlot: booking.startTimeSlot,
        durationMinutes: booking.durationMinutes,
        visitDayCount: booking.visitDayCount,
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
