import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  dedupeEmails,
  normalizeNotificationEmails,
  resolveFamilyNotificationEmails,
  type FamilyNotificationEmailSettings,
  type GuardianNotificationContext,
} from "@/lib/notifications/family-notification-email-constants";

export type { FamilyNotificationSource, FamilyNotificationEmailSettings } from "@/lib/notifications/family-notification-email-constants";
export {
  MAX_FAMILY_NOTIFICATION_EMAILS,
  normalizeNotificationEmails,
  resolveFamilyNotificationEmails,
} from "@/lib/notifications/family-notification-email-constants";

async function loadLinkedAuthEmails(
  admin: SupabaseClient,
  guardians: GuardianNotificationContext[],
): Promise<string[]> {
  const userIds = [
    ...new Set(
      guardians
        .map((guardian) =>
          guardian.user_id != null ? String(guardian.user_id) : null,
        )
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  if (userIds.length === 0) return [];

  const authEmails: string[] = [];
  await Promise.all(
    userIds.map(async (userId) => {
      const { data, error } = await admin.auth.admin.getUserById(userId);
      if (error || !data.user?.email) return;
      authEmails.push(data.user.email.trim().toLowerCase());
    }),
  );

  return authEmails;
}

export async function loadFamilyNotificationEmails(
  admin: SupabaseClient,
  familyId: string,
): Promise<string[]> {
  const { data: family, error: familyError } = await admin
    .from("families")
    .select("notification_emails, primary_email")
    .eq("id", familyId)
    .maybeSingle();

  if (familyError) throw familyError;
  if (!family) return [];

  const { data: guardians, error: guardiansError } = await admin
    .from("guardians")
    .select("email, user_id")
    .eq("family_id", familyId);

  if (guardiansError) throw guardiansError;

  const guardianRows = (guardians ?? []) as GuardianNotificationContext[];
  const authEmails = await loadLinkedAuthEmails(admin, guardianRows);

  return resolveFamilyNotificationEmails(family, guardianRows, authEmails).emails;
}

export async function getFamilyNotificationEmailSettings(
  admin: SupabaseClient,
  input: {
    familyId: string;
    loginEmail: string | null;
  },
): Promise<FamilyNotificationEmailSettings> {
  const { data: family, error: familyError } = await admin
    .from("families")
    .select("notification_emails, primary_email")
    .eq("id", input.familyId)
    .maybeSingle();

  if (familyError) throw familyError;
  if (!family) {
    return {
      loginEmail: input.loginEmail,
      configuredEmails: [],
      effectiveEmails: [],
      sources: [],
    };
  }

  const { data: guardians, error: guardiansError } = await admin
    .from("guardians")
    .select("email, user_id")
    .eq("family_id", input.familyId);

  if (guardiansError) throw guardiansError;

  const guardianRows = (guardians ?? []) as GuardianNotificationContext[];
  const authEmails = await loadLinkedAuthEmails(admin, guardianRows);
  const configuredEmails = dedupeEmails(
    Array.isArray(family.notification_emails) ? family.notification_emails : [],
  );
  const resolved = resolveFamilyNotificationEmails(
    family,
    guardianRows,
    authEmails,
  );

  return {
    loginEmail: input.loginEmail,
    configuredEmails,
    effectiveEmails: resolved.emails,
    sources: resolved.sources,
  };
}

export async function updateFamilyNotificationEmails(
  admin: SupabaseClient,
  familyId: string,
  emails: string[],
): Promise<{ emails: string[] }> {
  const normalized = normalizeNotificationEmails(emails);
  if (normalized.error) {
    throw new Error(normalized.error);
  }

  const { data, error } = await admin
    .from("families")
    .update({ notification_emails: normalized.emails })
    .eq("id", familyId)
    .select("notification_emails")
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new Error("Family not found.");
  }

  return {
    emails: dedupeEmails(
      Array.isArray(data.notification_emails) ? data.notification_emails : [],
    ),
  };
}
