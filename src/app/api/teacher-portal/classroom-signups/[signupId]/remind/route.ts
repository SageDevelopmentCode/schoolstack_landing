import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  getTeacherClassroomSignupById,
  listClassroomSignupResponses,
} from "@/lib/classroom-signups/load-teacher-signups";
import { sendClassroomSignupReminder } from "@/lib/classroom-signups/signup-reminders";
import { formatReminderRetryAfter } from "@/lib/classroom-signups/signup-reminder-rules";
import {
  getStaffUserProfile,
  getTeacherPortalStaffMemberIdForUser,
} from "@/lib/staff/teacher-portal-access";
import { createAdminClient } from "@/utils/supabase/admin";
import {
  createClientFromRequest,
  getUserFromRequest,
  signedInErrorForRequest,
} from "@/lib/supabase/request-client";

const ROUTE = "/api/teacher-portal/classroom-signups/[signupId]/remind";

type RouteContext = {
  params: Promise<{ signupId: string }>;
};

type RemindBody = {
  organizationId?: string;
  message?: string;
};

/**
 * POST: email + push a reminder for an open signup to the families in its
 * audience who haven't signed up yet. One reminder per signup per hour.
 */
export async function POST(request: Request, context: RouteContext) {
  const { signupId } = await context.params;
  const supabase = await createClientFromRequest(request);
  const {
    data: { user },
    error: authError,
  } = await getUserFromRequest(supabase, request);

  if (!user) {
    return apiError(ROUTE, {
      request,
      status: 401,
      error: await signedInErrorForRequest(request, authError),
      code: "unauthorized",
    });
  }

  let body: RemindBody;
  try {
    body = await request.json();
  } catch {
    return apiError(ROUTE, { request, status: 400, error: "Invalid request body.", code: "invalid_body" });
  }

  const organizationId = body.organizationId?.trim() ?? "";
  if (!organizationId) {
    return apiError(ROUTE, { request, status: 400, error: "organizationId is required.", code: "missing_fields" });
  }

  try {
    const staffMemberId = await getTeacherPortalStaffMemberIdForUser(supabase, user.id, organizationId);
    if (!staffMemberId) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "You do not have permission to send reminders for this signup.",
        code: "forbidden",
      });
    }

    const admin = createAdminClient();
    const signup = await getTeacherClassroomSignupById(admin, organizationId, staffMemberId, signupId);
    if (!signup) {
      return apiError(ROUTE, { request, status: 404, error: "Signup not found.", code: "not_found" });
    }
    if (signup.status !== "open") {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Only open signups can send reminders.",
        code: "invalid_status",
      });
    }

    const [responses, profile] = await Promise.all([
      listClassroomSignupResponses(admin, organizationId, signupId),
      getStaffUserProfile(supabase, user.id, organizationId, user),
    ]);

    const result = await sendClassroomSignupReminder(admin, {
      organizationId,
      signup,
      responses,
      message: body.message ?? "",
      teacherName: profile.displayName,
      staffMemberId,
      actor: { userId: user.id, email: profile.email, name: profile.displayName },
    });

    switch (result.status) {
      case "invalid_message":
        return apiError(ROUTE, { request, status: 400, error: result.error, code: "invalid_message" });
      case "cooldown":
        return apiError(ROUTE, {
          request,
          status: 429,
          error: `A reminder for this signup just went out. You can send another ${formatReminderRetryAfter(result.retryAfterMs)}.`,
          code: "rate_limited",
        });
      case "nobody_to_remind":
        return NextResponse.json({ familiesNotified: 0, emailsSent: 0, emailsAttempted: 0, pushRecipients: 0 });
      case "sent":
        return NextResponse.json({
          familiesNotified: result.familiesNotified,
          emailsSent: result.emailsSent,
          emailsAttempted: result.emailsAttempted,
          pushRecipients: result.pushRecipients,
        });
    }
  } catch (error) {
    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to send the reminder.",
      cause: error,
      code: "remind_failed",
    });
  }
}
