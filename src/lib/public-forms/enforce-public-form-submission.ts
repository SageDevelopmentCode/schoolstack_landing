import { getRequestIp } from "@/lib/public-forms/request-ip";
import {
  checkPublicFormRateLimits,
  isUpstashRateLimitConfigured,
} from "@/lib/public-forms/rate-limit";
import {
  isTurnstileConfigured,
  verifyTurnstileFromRequest,
} from "@/lib/public-forms/turnstile";

export type PublicFormId =
  | "public_support"
  | "demo_request"
  | "homepage_question"
  | "demo_feedback";

export type EnforcePublicFormSubmissionResult =
  | { ok: true }
  | { ok: false; status: 400 | 429 | 503; error: string; code?: string };

export function isPublicFormProtectionConfigured(): boolean {
  return isTurnstileConfigured() && isUpstashRateLimitConfigured();
}

export function shouldBypassPublicFormProtection(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  return !isPublicFormProtectionConfigured();
}

export async function enforcePublicFormSubmission(opts: {
  request: Request;
  form: PublicFormId;
  email?: string | null;
  turnstileToken?: string | null;
}): Promise<EnforcePublicFormSubmissionResult> {
  void opts.form;

  if (shouldBypassPublicFormProtection()) {
    return { ok: true };
  }

  if (!isPublicFormProtectionConfigured()) {
    return {
      ok: false,
      status: 503,
      error: "Form submissions are temporarily unavailable.",
      code: "protection_misconfigured",
    };
  }

  const turnstileToken = opts.turnstileToken?.trim();
  if (!turnstileToken) {
    return {
      ok: false,
      status: 400,
      error: "Please complete the security check.",
    };
  }

  const turnstileOk = await verifyTurnstileFromRequest(
    opts.request,
    turnstileToken,
  );
  if (!turnstileOk) {
    return {
      ok: false,
      status: 400,
      error: "Security check failed. Please try again.",
    };
  }

  const rateLimitResult = await checkPublicFormRateLimits({
    ip: getRequestIp(opts.request),
    email: opts.email,
  });
  if (!rateLimitResult.ok) {
    return {
      ok: false,
      status: 429,
      error: rateLimitResult.error,
      code: "rate_limited",
    };
  }

  return { ok: true };
}
