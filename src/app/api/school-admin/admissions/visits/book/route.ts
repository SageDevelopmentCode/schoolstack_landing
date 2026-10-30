import { NextResponse } from "next/server";
import {
  AdmissionsBookingError,
  bookAdmissionsVisit,
  loadPostSubmitActionForApplication,
  normalizeScheduledDates,
  normalizeScheduledSlotIds,
} from "@/lib/admissions/admissions-booking";
import { formatScheduledVisitWhenLabel } from "@/lib/admissions/admissions-availability";
import {
  sendPostSubmitVisitScheduledNotifications,
  sendPreApplicationCampusTourAdminNotifications,
  sendPublicTourBookingAdminNotifications,
} from "@/lib/admissions/application-notifications";
import {
  attachFamilyTourToApplication,
  bookFamilyCampusTour,
  findApplicationFormVersionId,
  findTourAttachableApplication,
} from "@/lib/admissions/family-tour-booking";
import { listFamilyApplicationsForFamilyId } from "@/lib/admissions/family-preview-access";
import { extractGuestContactEmail } from "@/lib/admissions/admin-manual-guest-contact";
import { getAdmissionsOrgSettings } from "@/lib/admissions/admissions-org-settings";
import { bookPublicStyleCampusTour } from "@/lib/admissions/public-tour-booking";
import {
  parsePublicTourPageSettings,
  resolvePublicTourFields,
} from "@/lib/admissions/public-tour-settings";
import {
  ACTIVITY_ACTIONS,
  getActorIdentityFromUser,
  logActivityEvent,
} from "@/lib/activity-log";
import { apiError } from "@/lib/api/route-errors";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClientFromRequest } from "@/lib/supabase/request-client";

const ROUTE = "/api/school-admin/admissions/visits/book";

type BookBody = {
  organizationId?: string;
  applicationId?: string;
  actionId?: string;
  familyId?: string;
  guestAnswers?: Record<string, unknown>;
  scheduledDate?: string;
  scheduledDates?: string[];
  slotIds?: string[];
  startTimeSlot?: string;
  sendConfirmationEmail?: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export async function POST(request: Request) {
  const supabase = await createClientFromRequest(request);
  let body: BookBody;
  try {
    body = (await request.json()) as BookBody;
  } catch {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Invalid request body.",
      code: "invalid_request",
    });
  }

  const organizationId = body.organizationId?.trim();
  const applicationId = body.applicationId?.trim();
  const actionId = body.actionId?.trim();
  const familyId = body.familyId?.trim();
  const guestAnswers = isRecord(body.guestAnswers) ? body.guestAnswers : undefined;
  const scheduledDate = body.scheduledDate?.trim();
  const startTimeSlot = body.startTimeSlot?.trim();
  const sendConfirmationEmail = body.sendConfirmationEmail === true;
  const scheduledDates = Array.isArray(body.scheduledDates)
    ? normalizeScheduledDates(body.scheduledDates)
    : undefined;
  const slotIds = Array.isArray(body.slotIds)
    ? normalizeScheduledSlotIds(body.slotIds)
    : undefined;

  if (!organizationId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId is required.",
      code: "invalid_request",
    });
  }

  const isGuestTour = Boolean(guestAnswers && !applicationId && !familyId);
  const isFamilyTour = Boolean(familyId && !applicationId && !guestAnswers);
  const isApplicationBooking = Boolean(applicationId && actionId);

  if (!isGuestTour && !isFamilyTour && !isApplicationBooking) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error:
        "Provide applicationId and actionId, familyId for a campus tour, or guestAnswers for a guest tour.",
      code: "invalid_request",
    });
  }

  if (isGuestTour || isFamilyTour) {
    if (!scheduledDate || !startTimeSlot) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "scheduledDate and startTimeSlot are required.",
        code: "invalid_request",
      });
    }
  } else if (!scheduledDates?.length && !slotIds?.length && !scheduledDate) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "scheduledDate, scheduledDates, or slotIds is required.",
      code: "invalid_request",
    });
  }

  try {
    const user = await requireSchoolAdminUser(supabase, organizationId, request);
    const admin = createAdminClient();
    const actorIdentity = getActorIdentityFromUser(user);

    if (isGuestTour && guestAnswers) {
      const admissionsSettings = await getAdmissionsOrgSettings(admin, organizationId);
      const publicTourSettings = parsePublicTourPageSettings(
        admissionsSettings.publicTour,
      );
      const fields = resolvePublicTourFields(publicTourSettings);
      const guestEmail = extractGuestContactEmail(fields, guestAnswers);

      if (sendConfirmationEmail && !guestEmail) {
        return apiError(ROUTE, {
          request,
          status: 400,
          error: "Add a valid email before sending a confirmation.",
          code: "invalid_request",
        });
      }

      const booking = await bookPublicStyleCampusTour(admin, {
        organizationId,
        scheduledDate: scheduledDate!,
        startTimeSlot: startTimeSlot!,
        answers: guestAnswers,
        requirePublicPageEnabled: false,
      });

      const { data: org, error: orgError } = await admin
        .from("organizations")
        .select("name")
        .eq("id", organizationId)
        .maybeSingle();
      if (orgError) throw orgError;

      const whenLabel = formatScheduledVisitWhenLabel({
        schedulingMode: "time_slot",
        scheduledDate: booking.scheduledDate,
        startTimeSlot: booking.startTimeSlot,
        durationMinutes: booking.durationMinutes,
      });

      void logActivityEvent(admin, {
        organizationId,
        actorType: "school_admin",
        actorUserId: user.id,
        actorEmail: user.email,
        actorName: actorIdentity.name,
        surface: "school_admin",
        action: ACTIVITY_ACTIONS.ADMISSIONS_TOUR_SCHEDULED_PRE_APPLICATION,
        entityType: "admissions_scheduled_visit",
        entityId: booking.visitId,
        summary: `Guest campus tour scheduled for ${whenLabel} (booked by school)`,
        metadata: {
          visitId: booking.visitId,
          scheduledDate,
          startTimeSlot,
          bookedByAdmin: true,
          bookingSource: "public",
        },
      });

      void sendPublicTourBookingAdminNotifications(admin, {
        organizationId,
        schoolName: org?.name ? String(org.name) : "School",
        booking: {
          visitId: booking.visitId,
          scheduledDate: booking.scheduledDate,
          startTimeSlot: booking.startTimeSlot,
          durationMinutes: booking.durationMinutes,
          registrant: booking.registrant,
        },
        sendGuestConfirmation: sendConfirmationEmail,
      });

      return NextResponse.json({ success: true, visitId: booking.visitId, booking });
    }

    if (isFamilyTour && familyId) {
      if (sendConfirmationEmail) {
        const { data: family } = await admin
          .from("families")
          .select("primary_email")
          .eq("id", familyId)
          .maybeSingle();
        if (!family?.primary_email?.trim()) {
          return apiError(ROUTE, {
            request,
            status: 400,
            error: "This family has no email on file for a confirmation.",
            code: "invalid_request",
          });
        }
      }

      const visit = await bookFamilyCampusTour(admin, {
        organizationId,
        familyId,
        scheduledDate: scheduledDate!,
        startTimeSlot: startTimeSlot!,
      });

      const familyApplications = await listFamilyApplicationsForFamilyId(
        admin,
        organizationId,
        familyId,
      );
      const attachableApplication = findTourAttachableApplication(
        familyApplications.map((application) => ({
          id: application.id,
          status: application.status,
          submittedAt: application.submittedAt,
          createdAt: application.createdAt,
          postSubmitTasks: application.postSubmitTasks.map((task) => ({
            type: task.type,
            status: task.status,
            title: task.title,
            booking: task.booking,
          })),
        })),
      );

      if (attachableApplication) {
        const formVersionId = await findApplicationFormVersionId(
          admin,
          attachableApplication.id,
        );
        if (formVersionId) {
          await attachFamilyTourToApplication(admin, {
            organizationId,
            familyId,
            applicationId: attachableApplication.id,
            formVersionId,
          });
        }
      }

      const whenLabel = formatScheduledVisitWhenLabel({
        schedulingMode: visit.schedulingMode,
        scheduledDate: visit.scheduledDate,
        startTimeSlot: visit.startTimeSlot,
        durationMinutes: visit.durationMinutes,
      });

      void logActivityEvent(admin, {
        organizationId,
        actorType: "school_admin",
        actorUserId: user.id,
        actorEmail: user.email,
        actorName: actorIdentity.name,
        surface: "school_admin",
        action: ACTIVITY_ACTIONS.ADMISSIONS_TOUR_SCHEDULED_PRE_APPLICATION,
        entityType: "family",
        entityId: familyId,
        summary: `Campus tour scheduled for ${whenLabel} (booked by school)`,
        metadata: {
          visitId: visit.id,
          scheduledDate,
          startTimeSlot,
          bookedByAdmin: true,
        },
      });

      void sendPreApplicationCampusTourAdminNotifications(admin, {
        organizationId,
        familyId,
        booking: visit,
        sendConfirmationEmail,
      });

      return NextResponse.json({ success: true, visitId: visit.id, booking: visit });
    }

    const schedulingContext = await loadPostSubmitActionForApplication(
      admin,
      applicationId!,
      actionId!,
    );
    if (
      !schedulingContext ||
      schedulingContext.organizationId !== organizationId
    ) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Application not found.",
        code: "not_found",
      });
    }

    if (sendConfirmationEmail) {
      const { data: application } = await admin
        .from("applications")
        .select("primary_guardian_id, guardians:primary_guardian_id (email)")
        .eq("id", applicationId!)
        .eq("organization_id", organizationId)
        .maybeSingle();
      const guardian = application?.guardians as
        | { email?: string | null }
        | { email?: string | null }[]
        | null;
      const guardianRow = Array.isArray(guardian) ? guardian[0] : guardian;
      const email = guardianRow?.email?.trim();
      if (!email) {
        return apiError(ROUTE, {
          request,
          status: 400,
          error: "This application has no guardian email for a confirmation.",
          code: "invalid_request",
        });
      }
    }

    const booking = await bookAdmissionsVisit(
      admin,
      applicationId!,
      actionId!,
      scheduledDate ?? scheduledDates?.[0] ?? slotIds?.[0] ?? "",
      startTimeSlot,
      scheduledDates,
      slotIds,
    );

    await sendPostSubmitVisitScheduledNotifications(admin, applicationId!, booking, {
      sendConfirmationEmail,
    });

    const whenLabel = formatScheduledVisitWhenLabel(booking);

    void logActivityEvent(admin, {
      organizationId: booking.organizationId,
      actorType: "school_admin",
      actorUserId: user.id,
      actorEmail: user.email,
      actorName: actorIdentity.name,
      surface: "school_admin",
      action: ACTIVITY_ACTIONS.POST_SUBMIT_VISIT_SCHEDULED,
      entityType: "admissions_scheduled_visit",
      entityId: booking.id,
      summary: `Visit scheduled for ${whenLabel} (booked by school)`,
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
        bookedByAdmin: true,
        sendConfirmationEmail,
      },
    });

    return NextResponse.json({ success: true, visitId: booking.id, booking });
  } catch (error) {
    if (error instanceof SchoolAdminAuthError) {
      return apiError(ROUTE, {
        request,
        status: error.status,
        error: error.message,
        code: error.code,
        cause: error,
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
