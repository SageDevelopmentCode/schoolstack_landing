import { NextResponse } from "next/server";
import { recordAuthActivity } from "@/lib/activity-auth-server";
import { apiError } from "@/lib/api/route-errors";
import { ACTIVITY_ACTIONS } from "@/lib/activity-log";
import {
  notifyRootedMeadowsVerificationCodeSent,
  type ApplyAuthMode,
} from "@/lib/discord";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/admissions/notify-verification-code-sent";

type NotifyRequestBody = {
  organizationId?: string;
  organizationSlug?: string;
  schoolName?: string;
  email?: string;
  mode?: ApplyAuthMode;
  firstName?: string;
  lastName?: string;
  resent?: boolean;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isApplyAuthMode(value: string): value is ApplyAuthMode {
  return value === "create" || value === "login";
}

export async function POST(request: Request) {
  let body: NotifyRequestBody;
  try {
    body = (await request.json()) as NotifyRequestBody;
  } catch {
    return apiError(ROUTE, { request, status: 400, error: "Invalid request body." });
  }

  const schoolName = body.schoolName?.trim();
  const email = body.email?.trim().toLowerCase();
  const mode = body.mode;

  if (!schoolName) {
    return apiError(ROUTE, { request, status: 400, error: "schoolName is required." });
  }

  if (!email || !EMAIL_PATTERN.test(email)) {
    return apiError(ROUTE, { request, status: 400, error: "A valid email is required." });
  }

  if (!mode || !isApplyAuthMode(mode)) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "mode must be create or login.",
    });
  }

  try {
    const admin = createAdminClient();

    void recordAuthActivity(admin, {
      organizationId: body.organizationId?.trim() ?? null,
      actorEmail: email,
      surface: "public_apply",
      action: ACTIVITY_ACTIONS.AUTH_OTP_REQUESTED,
      metadata: {
        method: "otp",
        mode,
        page: "/forms/apply",
        resent: body.resent === true,
        organizationSlug: body.organizationSlug?.trim(),
      },
    });

    await notifyRootedMeadowsVerificationCodeSent({
      schoolName,
      email,
      mode,
      firstName: body.firstName,
      lastName: body.lastName,
      resent: body.resent === true,
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to send notification.",
      cause: error,
    });
  }
}
