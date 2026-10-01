import { isPublicFormHoneypotTripped } from "@/lib/public-forms/honeypot";
import { getRequestIp } from "@/lib/public-forms/request-ip";
import { checkPublicFormRateLimits } from "@/lib/public-forms/rate-limit";

export type PublicFormId =
  | "public_support"
  | "demo_request"
  | "homepage_question"
  | "demo_feedback"
  | "public_tour_booking";

export type EnforcePublicFormSubmissionResult =
  | { ok: true }
  | { ok: false; status: 400 | 429 | 500; error: string; code?: string };

export type PublicFormProtectionFailure = Extract<
  EnforcePublicFormSubmissionResult,
  { ok: false }
>;

/** Expected user-facing protection failures should not Discord-notify. */
export function shouldNotifyPublicFormProtectionFailure(
  protection: PublicFormProtectionFailure,
): boolean {
  return protection.status >= 500;
}

export function shouldBypassPublicFormProtection(): boolean {
  return process.env.NODE_ENV !== "production";
}

export async function enforcePublicFormSubmission(opts: {
  request: Request;
  form: PublicFormId;
  email?: string | null;
  companyWebsite?: string | null;
}): Promise<EnforcePublicFormSubmissionResult> {
  if (isPublicFormHoneypotTripped(opts.companyWebsite)) {
    return {
      ok: false,
      status: 400,
      error: "Invalid submission.",
      code: "honeypot",
    };
  }

  if (shouldBypassPublicFormProtection()) {
    return { ok: true };
  }

  const rateLimitResult = await checkPublicFormRateLimits({
    form: opts.form,
    ip: getRequestIp(opts.request),
    email: opts.email,
  });
  if (!rateLimitResult.ok) {
    const isInfrastructure =
      rateLimitResult.error ===
      "Unable to process your submission right now. Please try again later.";
    return {
      ok: false,
      status: isInfrastructure ? 500 : 429,
      error: rateLimitResult.error,
      code: isInfrastructure ? "rate_limit_unavailable" : "rate_limited",
    };
  }

  return { ok: true };
}
