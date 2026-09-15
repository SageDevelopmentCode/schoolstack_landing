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

function authPageLabel(metadata?: AuthActivityMetadata): string {
  const page = metadata?.page;
  if (page === "/login") return "login page";
  if (page === "/forms/apply") return "application form";
  if (page === "/apply") return "apply dashboard";
  if (page === "/parent") return "parent portal";
  if (metadata?.client === "mobile") return "mobile app";
  return "parent portal";
}

function authActorLabel(surface: ActivitySurface): string {
  if (surface === "school_admin") return "School admin";
  if (surface === "login") return "User";
  return "Parent";
}

export function authActivitySummary(
  action: string,
  metadata?: AuthActivityMetadata,
  surface: ActivitySurface = "parent_portal",
): string {
  const pageLabel = authPageLabel(metadata);
  const actorLabel = authActorLabel(surface);
  const mobileSuffix = metadata?.client === "mobile" ? " (mobile)" : "";

  switch (action) {
    case ACTIVITY_ACTIONS.AUTH_OTP_REQUESTED:
      return metadata?.resent
        ? `Verification code resent on ${pageLabel}${mobileSuffix}`
        : `Verification code sent on ${pageLabel}${mobileSuffix}`;
    case ACTIVITY_ACTIONS.AUTH_OTP_VERIFIED:
      return `Verification code accepted on ${pageLabel}${mobileSuffix}`;
    case ACTIVITY_ACTIONS.AUTH_OTP_FAILED:
      return `Verification code failed on ${pageLabel}${mobileSuffix}`;
    case ACTIVITY_ACTIONS.AUTH_ACCOUNT_CREATED:
      return `${actorLabel} account created on ${pageLabel}${mobileSuffix}`;
    case ACTIVITY_ACTIONS.AUTH_SIGNED_IN:
      return `${actorLabel} signed in on ${pageLabel}${mobileSuffix}`;
    case ACTIVITY_ACTIONS.AUTH_SIGNED_OUT:
      return `${actorLabel} signed out from ${pageLabel}${mobileSuffix}`;
    case ACTIVITY_ACTIONS.AUTH_SESSION_RESTORED:
      return `Existing session restored on ${pageLabel}${mobileSuffix}`;
    default:
      return `${actorLabel} auth activity${mobileSuffix}`;
  }
}

export async function recordAuthActivity(
  admin: SupabaseClient,
  input: {
    organizationId?: string | null;
    actorUserId?: string | null;
    actorEmail?: string | null;
    actorType?: "parent" | "school_admin" | "platform_admin";
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
    actorType: input.actorType ?? (input.surface === "school_admin" ? "school_admin" : "parent"),
    surface: input.surface,
    action: input.action,
    summary: authActivitySummary(input.action, input.metadata, input.surface),
    metadata: input.metadata,
    severity:
      input.severity ??
      (input.action === ACTIVITY_ACTIONS.AUTH_OTP_FAILED ? "warning" : "info"),
  });
}
