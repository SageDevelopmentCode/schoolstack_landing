import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiError } from "@/lib/api/route-errors";
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
import { normalizeSchoolName } from "@/lib/try/free-school-signup";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/try/complete";
const FORM = "free_school_signup" as const;

export async function POST(request: Request) {
  let body: { schoolName?: string; timezone?: string };

  try {
    body = await request.json();
  } catch {
    return apiError(ROUTE, { request, status: 400, error: "Invalid request body." });
  }

  const schoolName = normalizeSchoolName(body.schoolName ?? "");
  const timezone = body.timezone?.trim() ?? "";

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

    await recordPublicFormSubmissionEvent({
      form: FORM,
      ip: getRequestIp(request),
      email,
      route: ROUTE,
      request,
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
