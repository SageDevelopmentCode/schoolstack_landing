import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { isValidIanaTimezone } from "@/lib/marketing/demo-timezone-options";
import {
  enforcePublicFormSubmission,
  shouldBypassPublicFormProtection,
} from "@/lib/public-forms/enforce-public-form-submission";
import {
  exceedsMaxLength,
  fieldTooLongLabel,
  MAX_PUBLIC_FORM_EMAIL_LENGTH,
  MAX_PUBLIC_FORM_SCHOOL_NAME_FIELD_LENGTH,
} from "@/lib/public-forms/field-limits";
import { readPublicFormHoneypot } from "@/lib/public-forms/honeypot";
import { recordPublicFormSubmissionEvent } from "@/lib/public-forms/rate-limit";
import { getRequestIp } from "@/lib/public-forms/request-ip";
import {
  domainRateLimitMessage,
  emailDomainHourlyCount,
  FreeSchoolSignupError,
  listSchoolIdentities,
  reportFreeSchoolSignupFailure,
} from "@/lib/try/create-free-school";
import {
  isValidSignupEmail,
  normalizeSchoolName,
  signupImpersonationMessage,
} from "@/lib/try/free-school-signup";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/try/prepare";
const FORM = "free_school_otp" as const;

export async function POST(request: Request) {
  let body: {
    email?: string;
    schoolName?: string;
    timezone?: string;
    companyWebsite?: string;
  };

  try {
    body = await request.json();
  } catch {
    return apiError(ROUTE, { request, status: 400, error: "Invalid request body." });
  }

  const email = body.email?.trim().toLowerCase() ?? "";
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

  if (!isValidSignupEmail(email) || exceedsMaxLength(email, MAX_PUBLIC_FORM_EMAIL_LENGTH)) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Enter a valid email address.",
      code: "invalid_email",
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

  const protection = await enforcePublicFormSubmission({
    request,
    form: FORM,
    email,
    companyWebsite: readPublicFormHoneypot(body),
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

    const existing = await listSchoolIdentities(admin);
    const blocked = signupImpersonationMessage(schoolName, existing);
    if (blocked) {
      return apiError(ROUTE, {
        request,
        status: 409,
        error: blocked,
        code: "name_taken",
        notify: false,
      });
    }
  } catch (error) {
    if (error instanceof FreeSchoolSignupError && error.status < 500) {
      return apiError(ROUTE, {
        request,
        status: error.status,
        error: error.message,
        code: error.code,
        notify: false,
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
    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Unable to start signup right now. Please try again.",
      code: "signup_prepare_failed",
      cause: error,
      notify: false,
    });
  }

  await recordPublicFormSubmissionEvent({
    form: FORM,
    ip: getRequestIp(request),
    email,
    route: ROUTE,
    request,
  });

  return NextResponse.json({ ok: true });
}
