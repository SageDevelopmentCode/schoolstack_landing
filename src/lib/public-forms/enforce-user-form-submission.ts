import {
  shouldBypassPublicFormProtection,
  type PublicFormId,
} from "@/lib/public-forms/enforce-public-form-submission";
import {
  checkPublicFormRateLimits,
  recordPublicFormSubmissionEvent,
} from "@/lib/public-forms/rate-limit";

export type UserFormRateLimitResult =
  | { ok: true }
  | { ok: false; status: 429; error: string; code: "rate_limited" };

/**
 * Rate limit for signed-in portal forms (parent support requests and feedback).
 *
 * Keyed by the user's email only, not by IP: many parents share a school network, so the
 * per-IP budget used for anonymous marketing forms would block legitimate users. The shared
 * limits apply (3 per hour and one per minute per email).
 *
 * Fails open when the rate-limit RPC itself is unavailable: the failure is already reported
 * through `reportOperationalError`, and blocking a signed-in parent's support request is worse
 * than skipping the limit briefly.
 */
export async function enforceUserFormRateLimit(opts: {
  form: Extract<PublicFormId, "parent_portal_support" | "parent_portal_feedback">;
  email: string | null | undefined;
}): Promise<UserFormRateLimitResult> {
  const email = opts.email?.trim();
  if (!email || shouldBypassPublicFormProtection()) {
    return { ok: true };
  }

  const result = await checkPublicFormRateLimits({
    form: opts.form,
    ip: null,
    email,
  });

  if (result.ok) return { ok: true };

  const isInfrastructure =
    result.error ===
    "Unable to process your submission right now. Please try again later.";
  if (isInfrastructure) return { ok: true };

  return {
    ok: false,
    status: 429,
    error: result.error,
    code: "rate_limited",
  };
}

/** Call after the submission was saved so failed attempts do not use up the budget. */
export async function recordUserFormSubmission(opts: {
  form: Extract<PublicFormId, "parent_portal_support" | "parent_portal_feedback">;
  email: string | null | undefined;
  route: string;
  request: Request;
}): Promise<void> {
  const email = opts.email?.trim();
  if (!email) return;

  await recordPublicFormSubmissionEvent({
    form: opts.form,
    ip: null,
    email,
    route: opts.route,
    request: opts.request,
  });
}
