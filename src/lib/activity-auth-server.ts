import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ACTIVITY_ACTIONS,
  logAuthActivity,
  type ActivitySurface,
  type AuthActivityMetadata,
} from "@/lib/activity-log";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const AUTHENTICATED_AUTH_ACTIONS = new Set<string>([
  ACTIVITY_ACTIONS.AUTH_OTP_VERIFIED,
  ACTIVITY_ACTIONS.AUTH_OTP_FAILED,
  ACTIVITY_ACTIONS.AUTH_SIGNED_IN,
  ACTIVITY_ACTIONS.AUTH_SIGNED_OUT,
  ACTIVITY_ACTIONS.AUTH_SESSION_RESTORED,
]);

export function isValidAuthEmail(email: string | undefined): email is string {
  return Boolean(email && EMAIL_PATTERN.test(email));
}

export async function userHasActiveOrgMembership(
  admin: SupabaseClient,
  userId: string,
  organizationId: string,
): Promise<boolean> {
  const { data, error } = await admin
    .from("organization_memberships")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    console.error("[activity-auth] membership lookup failed:", error.message);
    return false;
  }

  return Boolean(data);
}

export async function organizationExists(
  admin: SupabaseClient,
  organizationId: string,
): Promise<boolean> {
  const { data, error } = await admin
    .from("organizations")
    .select("id")
    .eq("id", organizationId)
    .maybeSingle();

  if (error) {
    console.error("[activity-auth] organization lookup failed:", error.message);
    return false;
  }

  return Boolean(data);
}

export function authActivitySummary(
  action: string,
  metadata?: AuthActivityMetadata,
): string {
  const page = metadata?.page;
  const pageLabel =
    page === "/login"
      ? "login page"
      : page === "/forms/apply"
        ? "application form"
        : page === "/apply"
          ? "apply dashboard"
          : page === "/parent"
            ? "parent portal"
            : "parent portal";

  switch (action) {
    case ACTIVITY_ACTIONS.AUTH_OTP_REQUESTED:
      return metadata?.resent
        ? `Verification code resent on ${pageLabel}`
        : `Verification code sent on ${pageLabel}`;
    case ACTIVITY_ACTIONS.AUTH_OTP_VERIFIED:
      return `Verification code accepted on ${pageLabel}`;
    case ACTIVITY_ACTIONS.AUTH_OTP_FAILED:
      return `Verification code failed on ${pageLabel}`;
    case ACTIVITY_ACTIONS.AUTH_ACCOUNT_CREATED:
      return `Parent account created on ${pageLabel}`;
    case ACTIVITY_ACTIONS.AUTH_SIGNED_IN:
      return `Parent signed in on ${pageLabel}`;
    case ACTIVITY_ACTIONS.AUTH_SIGNED_OUT:
      return `Parent signed out from ${pageLabel}`;
    case ACTIVITY_ACTIONS.AUTH_SESSION_RESTORED:
      return `Existing session restored on ${pageLabel}`;
    default:
      return "Parent auth activity";
  }
}

export async function recordAuthActivity(
  admin: SupabaseClient,
  input: {
    organizationId?: string | null;
    actorUserId?: string | null;
    actorEmail?: string | null;
    surface: ActivitySurface;
    action: string;
    metadata?: AuthActivityMetadata;
    severity?: "info" | "warning" | "error";
  },
): Promise<void> {
  await logAuthActivity(admin, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    actorEmail: input.actorEmail,
    surface: input.surface,
    action: input.action,
    summary: authActivitySummary(input.action, input.metadata),
    metadata: input.metadata,
    severity:
      input.severity ??
      (input.action === ACTIVITY_ACTIONS.AUTH_OTP_FAILED ? "warning" : "info"),
  });
}
