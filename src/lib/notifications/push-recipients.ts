import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ExpoPushPortal } from "@/lib/notifications/expo-push";
import {
  resolveBulletinParentFamilyIds,
  resolveBulletinStaffEmails,
} from "@/lib/school-bulletin/bulletin-notification-audience";
import type { BulletinAudience } from "@/lib/school-bulletin/types";

export type ExpoPushRecipient = {
  userId: string;
  portal: ExpoPushPortal;
  email: string | null;
};

export async function resolveGuardianPushRecipientsForFamilies(
  admin: SupabaseClient,
  familyIds: string[],
): Promise<ExpoPushRecipient[]> {
  if (familyIds.length === 0) return [];

  const { data, error } = await admin
    .from("guardians")
    .select("user_id, email, family_id")
    .in("family_id", familyIds);

  if (error) throw error;

  const byUserId = new Map<string, ExpoPushRecipient>();

  for (const row of data ?? []) {
    const userId = row.user_id ? String(row.user_id) : null;
    if (!userId) continue;

    byUserId.set(userId, {
      userId,
      portal: "parent",
      email: typeof row.email === "string" ? row.email : null,
    });
  }

  return [...byUserId.values()];
}

async function resolveTeacherPushRecipientsByEmails(
  admin: SupabaseClient,
  organizationId: string,
  emails: string[],
): Promise<ExpoPushRecipient[]> {
  const normalizedEmails = [
    ...new Set(
      emails.map((email) => email.trim().toLowerCase()).filter(Boolean),
    ),
  ];
  if (normalizedEmails.length === 0) return [];

  const { data: memberships, error: membershipError } = await admin
    .from("organization_memberships")
    .select("user_id, email")
    .eq("organization_id", organizationId)
    .eq("status", "active")
    .in("role", ["teacher", "staff"]);

  if (membershipError) throw membershipError;

  const emailSet = new Set(normalizedEmails);
  const byUserId = new Map<string, ExpoPushRecipient>();

  for (const row of memberships ?? []) {
    const email = row.email?.trim().toLowerCase() ?? "";
    const userId = row.user_id ? String(row.user_id) : null;
    if (!userId || !email || !emailSet.has(email)) continue;

    byUserId.set(userId, {
      userId,
      portal: "teacher",
      email: row.email,
    });
  }

  const { data: staffRows, error: staffError } = await admin
    .from("staff_members")
    .select("user_id, email")
    .eq("organization_id", organizationId)
    .not("user_id", "is", null);

  if (staffError) throw staffError;

  for (const row of staffRows ?? []) {
    const email = row.email?.trim().toLowerCase() ?? "";
    const userId = row.user_id ? String(row.user_id) : null;
    if (!userId || !email || !emailSet.has(email)) continue;

    byUserId.set(userId, {
      userId,
      portal: "teacher",
      email: typeof row.email === "string" ? row.email : null,
    });
  }

  return [...byUserId.values()];
}

export async function resolveBulletinPushRecipients(
  admin: SupabaseClient,
  organizationId: string,
  audiences: BulletinAudience[],
  programIds: string[],
): Promise<ExpoPushRecipient[]> {
  const byUserId = new Map<string, ExpoPushRecipient>();

  const familyIds = await resolveBulletinParentFamilyIds(
    admin,
    organizationId,
    audiences,
    programIds,
  );
  const parentRecipients = await resolveGuardianPushRecipientsForFamilies(
    admin,
    familyIds,
  );
  for (const recipient of parentRecipients) {
    byUserId.set(recipient.userId, recipient);
  }

  const staffEmails = await resolveBulletinStaffEmails(
    admin,
    organizationId,
    audiences,
  );
  const teacherRecipients = await resolveTeacherPushRecipientsByEmails(
    admin,
    organizationId,
    staffEmails,
  );
  for (const recipient of teacherRecipients) {
    byUserId.set(recipient.userId, recipient);
  }

  return [...byUserId.values()];
}

export async function resolveEnrolledFamilyGuardianPushRecipients(
  admin: SupabaseClient,
  organizationId: string,
  listFamilyIds: (
    client: SupabaseClient,
    orgId: string,
  ) => Promise<string[]>,
): Promise<ExpoPushRecipient[]> {
  const familyIds = await listFamilyIds(admin, organizationId);
  return resolveGuardianPushRecipientsForFamilies(admin, familyIds);
}

export async function resolveFamilyGuardianPushRecipients(
  admin: SupabaseClient,
  familyId: string,
): Promise<ExpoPushRecipient[]> {
  return resolveGuardianPushRecipientsForFamilies(admin, [familyId]);
}
