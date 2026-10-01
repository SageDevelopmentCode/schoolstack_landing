import { reportOperationalError } from "@/lib/operational-errors";
import type { PublicFormId } from "@/lib/public-forms/enforce-public-form-submission";
import { shouldBypassPublicFormProtection } from "@/lib/public-forms/enforce-public-form-submission";
import { createAdminClient } from "@/utils/supabase/admin";

export type PublicFormRateLimitResult =
  | { ok: true }
  | { ok: false; error: string };

type RateLimitRpcRow = {
  allowed: boolean;
  error_message: string | null;
};

export async function checkPublicFormRateLimits(opts: {
  form: PublicFormId;
  ip: string | null;
  email?: string | null;
}): Promise<PublicFormRateLimitResult> {
  const admin = createAdminClient();

  const { data, error } = await admin.rpc("check_public_form_submission_allowed", {
    p_form: opts.form,
    p_ip: opts.ip ?? "",
    p_email: opts.email?.trim() ?? "",
  });

  if (error) {
    void reportOperationalError({
      supabase: admin,
      surface: "system",
      operation: "public_form_rate_limit_check",
      error: "Public form rate-limit check RPC failed.",
      code: "rate_limit_unavailable",
      cause: error,
      actor: { type: "system" },
      metadata: { form: opts.form },
    });
    return {
      ok: false,
      error: "Unable to process your submission right now. Please try again later.",
    };
  }

  const row = (Array.isArray(data) ? data[0] : data) as RateLimitRpcRow | undefined;
  if (!row?.allowed) {
    return {
      ok: false,
      error:
        row?.error_message?.trim() ||
        "Too many submissions. Please try again later.",
    };
  }

  return { ok: true };
}

export async function recordPublicFormSubmissionEvent(opts: {
  form: PublicFormId;
  ip: string | null;
  email?: string | null;
  route?: string;
  request?: Request;
}): Promise<void> {
  if (shouldBypassPublicFormProtection()) {
    return;
  }

  const admin = createAdminClient();
  const { error } = await admin.rpc("record_public_form_submission_event", {
    p_form: opts.form,
    p_ip: opts.ip ?? "",
    p_email: opts.email?.trim() ?? "",
  });

  if (!error) {
    return;
  }

  void reportOperationalError({
    supabase: admin,
    surface: opts.route ? "api" : "system",
    operation: "public_form_submission_event_record",
    error: "Failed to record public form submission rate-limit event.",
    code: "rate_limit_event_record_failed",
    cause: error,
    actor: { type: "system" },
    metadata: { form: opts.form },
    ...(opts.route && opts.request
      ? {
          api: {
            route: opts.route,
            method: opts.request.method,
            status: 200,
          },
        }
      : {}),
  });
}
