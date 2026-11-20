import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { logNotificationFailure } from "@/lib/admissions/notification-logging";
import { apiError } from "@/lib/api/route-errors";
import { notifyFreeSchoolSignup } from "@/lib/discord";
import { runAfterResponse } from "@/lib/next/run-after-response";
import { reportOperationalError } from "@/lib/operational-errors";
import { isValidIanaTimezone } from "@/lib/marketing/demo-timezone-options";
import {
  enforcePublicFormSubmission,
  shouldBypassPublicFormProtection,
} from "@/lib/public-forms/enforce-public-form-submission";
import {
  exceedsMaxLength,
  fieldTooLongLabel,
  MAX_PUBLIC_FORM_SCHOOL_NAME_FIELD_LENGTH,
} from "@/lib/public-forms/field-limits";
import { recordPublicFormSubmissionEvent } from "@/lib/public-forms/rate-limit";
import { getRequestIp } from "@/lib/public-forms/request-ip";
import {
  createFreeSchool,
  domainRateLimitMessage,
  emailDomainHourlyCount,
  FreeSchoolSignupError,
  reportFreeSchoolSignupFailure,
} from "@/lib/try/create-free-school";
import {
  normalizeSchoolName,
  normalizeSignupDetails,
  type SignupDetails,
} from "@/lib/try/free-school-signup";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/try/complete";
const FORM = "free_school_signup" as const;

/** Best effort: the school already exists, so failures are reported but never block the response. */
async function saveSignupDetails(
  admin: SupabaseClient,
  opts: { request: Request; user: User; email: string; organizationId: string; details: SignupDetails },
): Promise<void> {
  const { request, user, email, organizationId, details } = opts;

  const report = (operation: string, error: unknown) =>
    reportOperationalError({
      supabase: admin,
      surface: "api",
      organizationId,
      operation,
      error: error instanceof Error ? error.message : String(error),
      code: "signup_details_failed",
      notify: false,
      severity: "warning",
      actor: { type: "system", email },
      cause: error,
      api: { route: ROUTE, method: request.method, status: 200 },
    });

  const [detailsResult, metadataResult] = await Promise.allSettled([
    admin.from("free_school_signup_details").upsert(
      {
        organization_id: organizationId,
        user_id: user.id,
        first_name: details.firstName,
        role: details.role,
        student_count: details.studentCount,
      },
      { onConflict: "organization_id" },
    ),
    admin.auth.admin.updateUserById(user.id, {
      user_metadata: { ...(user.user_metadata ?? {}), first_name: details.firstName },
    }),
  ]);

  const detailsError =
    detailsResult.status === "rejected" ? detailsResult.reason : detailsResult.value.error;
  if (detailsError) {
    console.error(`[${ROUTE}] could not save signup details`, detailsError);
    await report("free_school_signup_details_insert", detailsError);
  }

  const metadataError =
    metadataResult.status === "rejected" ? metadataResult.reason : metadataResult.value.error;
  if (metadataError) {
    console.error(`[${ROUTE}] could not set first name on user`, metadataError);
    await report("free_school_signup_first_name", metadataError);
  }
}

export async function POST(request: Request) {
  let body: {
    schoolName?: string;
    timezone?: string;
    firstName?: unknown;
    role?: unknown;
    studentCount?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return apiError(ROUTE, { request, status: 400, error: "Invalid request body." });
  }

  const schoolName = normalizeSchoolName(body.schoolName ?? "");
  const timezone = body.timezone?.trim() ?? "";

  const signupDetails = normalizeSignupDetails(body);
  if (!signupDetails.ok) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Enter your first name.",
      code: "missing_first_name",
    });
  }

  if (!schoolName || schoolName.length < 2) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Enter your school name.",
      code: "missing_school_name",
    });
  }

  if (exceedsMaxLength(schoolName, MAX_PUBLIC_FORM_SCHOOL_NAME_FIELD_LENGTH)) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: fieldTooLongLabel("School name"),
      code: "school_name_too_long",
    });
  }

  if (!isValidIanaTimezone(timezone)) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "We couldn't read your timezone. Refresh and try again.",
      code: "invalid_timezone",
    });
  }

  const supabase = createClient(await cookies());
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  const email = user?.email?.trim().toLowerCase() ?? "";
  if (userError || !user || !email || !user.email_confirmed_at) {
    return apiError(ROUTE, {
      request,
      status: 401,
      error: "Confirm your email with the code we sent, then try again.",
      code: "email_unverified",
      notify: false,
    });
  }

  const protection = await enforcePublicFormSubmission({
    request,
    form: FORM,
    email,
  });
  if (!protection.ok) {
    return apiError(ROUTE, {
      request,
      status: protection.status,
      error: protection.error,
      code: protection.code,
      notify: protection.status >= 500,
    });
  }

  const admin = createAdminClient();

  try {
    if (!shouldBypassPublicFormProtection()) {
      const domainCount = await emailDomainHourlyCount(admin, FORM, email);
      const domainMessage = domainRateLimitMessage(domainCount);
      if (domainMessage) {
        return apiError(ROUTE, {
          request,
          status: 429,
          error: domainMessage,
          code: "domain_rate_limited",
          notify: false,
        });
      }
    }

    const created = await createFreeSchool(admin, {
      schoolName,
      timezone,
      userId: user.id,
      email,
    });

    await saveSignupDetails(admin, {
      request,
      user,
      email,
      organizationId: created.organizationId,
      details: signupDetails.details,
    }).catch((detailsError) => {
      console.error(`[${ROUTE}] signup details failed`, detailsError);
    });

    await recordPublicFormSubmissionEvent({
      form: FORM,
      ip: getRequestIp(request),
      email,
      route: ROUTE,
      request,
    });

    runAfterResponse(async () => {
      try {
        await notifyFreeSchoolSignup({
          firstName: signupDetails.details.firstName,
          email,
          schoolName,
          slug: created.slug,
          organizationId: created.organizationId,
          role: signupDetails.details.role,
          studentCount: signupDetails.details.studentCount,
          timezone,
        });
      } catch (notifyError) {
        void logNotificationFailure(admin, {
          organizationId: created.organizationId,
          operation: "free_school_signup_discord",
          error: notifyError,
          metadata: { email, schoolName },
        });
      }
    });

    return NextResponse.json({ slug: created.slug });
  } catch (error) {
    if (error instanceof FreeSchoolSignupError && error.status < 500) {
      return apiError(ROUTE, {
        request,
        status: error.status,
        error: error.message,
        code: error.code,
        notify: false,
        cause: error,
      });
    }

    await reportFreeSchoolSignupFailure({
      admin,
      route: ROUTE,
      request,
      error,
      email,
      schoolName,
    });

    const message =
      error instanceof FreeSchoolSignupError
        ? error.message
        : "Could not create your school. Please try again.";
    const code = error instanceof FreeSchoolSignupError ? error.code : "signup_failed";

    return apiError(ROUTE, {
      request,
      status: 500,
      error: message,
      code,
      cause: error,
      notify: false,
    });
  }
}
