import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { formatScheduledVisitWhenLabel } from "@/lib/admissions/admissions-availability";
import { AdmissionsBookingError } from "@/lib/admissions/admissions-booking";
import {
  attachFamilyTourToApplication,
  bookFamilyCampusTour,
  findApplicationFormVersionId,
  findTourAttachableApplication,
} from "@/lib/admissions/family-tour-booking";
import {
  AuthError,
  getFamilyIdsForUser,
  requireAuthenticatedUser,
} from "@/lib/admissions/application-auth";
import { sendPreApplicationCampusTourAdminNotifications } from "@/lib/admissions/application-notifications";
import { listFamilyApplications } from "@/lib/admissions/parent-portal-access";
import {
  ACTIVITY_ACTIONS,
  getActorIdentityFromUser,
  logActivityEvent,
} from "@/lib/activity-log";
import { apiError } from "@/lib/api/route-errors";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admissions/family-tours/schedule";

type ScheduleBody = {
  organizationId?: string;
  scheduledDate?: string;
  startTimeSlot?: string;
};

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

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

  const organizationId = body.organizationId?.trim();
  const scheduledDate = body.scheduledDate?.trim();
  const startTimeSlot = body.startTimeSlot?.trim();

  if (!organizationId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId is required.",
      code: "invalid_request",
    });
  }

  if (!scheduledDate || !startTimeSlot) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "scheduledDate and startTimeSlot are required.",
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

    const familyId = familyIds[0];
    const admin = createAdminClient();
    const visit = await bookFamilyCampusTour(admin, {
      organizationId,
      familyId,
      scheduledDate,
      startTimeSlot,
    });

    const applications = await listFamilyApplications(admin, organizationId, user.id);
    const attachableApplication = findTourAttachableApplication(applications);
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

    const actorIdentity = getActorIdentityFromUser(user);

    void logActivityEvent(admin, {
      organizationId,
      actorType: "parent",
      actorUserId: user.id,
      actorEmail: user.email,
      actorName: actorIdentity.name,
      surface: "public_apply",
      action: ACTIVITY_ACTIONS.ADMISSIONS_TOUR_SCHEDULED_PRE_APPLICATION,
      entityType: "family",
      entityId: familyId,
      summary: `Campus tour scheduled for ${whenLabel}`,
      metadata: {
        visitId: visit.id,
        scheduledDate,
        startTimeSlot,
      },
    });

    void sendPreApplicationCampusTourAdminNotifications(admin, {
      organizationId,
      familyId,
      booking: visit,
    });

    return NextResponse.json({ success: true, visitId: visit.id });
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
      error: "Failed to schedule tour.",
      cause: error,
    });
  }
}
