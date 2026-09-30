import type { SupabaseClient } from "@supabase/supabase-js";
import { loadFamilyNotificationEmails } from "@/lib/notifications/family-notification-emails";
import {
  bulletinNotifiesParents,
  bulletinNotifiesStaff,
  bulletinParentProgramFilter,
} from "./bulletin-audience";
import type { BulletinAudience } from "./types";

export type BulletinEmailRecipient = {
  email: string;
  portal: "parent" | "teacher";
};

export {
  bulletinNotifiesParents,
  bulletinNotifiesStaff,
  bulletinParentProgramFilter,
} from "./bulletin-audience";

async function familyIdsForPrograms(
  admin: SupabaseClient,
  organizationId: string,
  programIds: string[],
): Promise<string[]> {
  if (programIds.length === 0) return [];

  const { data, error } = await admin
    .from("enrollments")
    .select("students!inner(family_id)")
    .eq("organization_id", organizationId)
    .eq("status", "enrolled")
    .in("program_id", programIds);

  if (error) throw error;

  const familyIds = new Set<string>();
  for (const row of data ?? []) {
    const students = row.students as
      | { family_id?: string | null }
      | { family_id?: string | null }[]
      | null;
    const student = Array.isArray(students) ? students[0] : students;
    if (student?.family_id) {
      familyIds.add(String(student.family_id));
    }
  }

  return [...familyIds];
}

async function familyIdsForAllEnrolled(
  admin: SupabaseClient,
  organizationId: string,
): Promise<string[]> {
  const { data, error } = await admin
    .from("enrollments")
    .select("students!inner(family_id)")
    .eq("organization_id", organizationId)
    .eq("status", "enrolled");

  if (error) throw error;

  const familyIds = new Set<string>();
  for (const row of data ?? []) {
    const students = row.students as
      | { family_id?: string | null }
      | { family_id?: string | null }[]
      | null;
    const student = Array.isArray(students) ? students[0] : students;
    if (student?.family_id) {
      familyIds.add(String(student.family_id));
    }
  }

  return [...familyIds];
}

export async function resolveBulletinParentFamilyIds(
  admin: SupabaseClient,
  organizationId: string,
  audiences: BulletinAudience[],
  programIds: string[],
): Promise<string[]> {
  if (!bulletinNotifiesParents(audiences)) return [];

  const programFilter = bulletinParentProgramFilter(audiences, programIds);
  if (programFilter.length > 0) {
    return familyIdsForPrograms(admin, organizationId, programFilter);
  }

  return familyIdsForAllEnrolled(admin, organizationId);
}

async function resolveStaffMemberEmail(
  admin: SupabaseClient,
  staffMember: { email: string | null; user_id: string | null },
): Promise<string | null> {
  const staffEmail =
    typeof staffMember.email === "string" ? staffMember.email.trim().toLowerCase() : "";
  if (staffEmail) return staffEmail;

  const userId = staffMember.user_id ? String(staffMember.user_id) : null;
  if (!userId) return null;

  const { data, error } = await admin.auth.admin.getUserById(userId);
  if (error || !data.user?.email) return null;

  return data.user.email.trim().toLowerCase();
}

export async function resolveBulletinStaffEmails(
  admin: SupabaseClient,
  organizationId: string,
  audiences: BulletinAudience[],
): Promise<string[]> {
  if (!bulletinNotifiesStaff(audiences)) return [];

  const { data: memberships, error: membershipError } = await admin
    .from("organization_memberships")
    .select("user_id")
    .eq("organization_id", organizationId)
    .eq("status", "active")
    .in("role", ["teacher", "staff"]);

  if (membershipError) throw membershipError;

  const userIds = [
    ...new Set(
      (memberships ?? [])
        .map((row) => (row.user_id ? String(row.user_id) : null))
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  if (userIds.length === 0) return [];

  const { data: staffRows, error: staffError } = await admin
    .from("staff_members")
    .select("email, user_id")
    .eq("organization_id", organizationId)
    .in("user_id", userIds);

  if (staffError) throw staffError;

  const staffByUserId = new Map<string, { email: string | null; user_id: string | null }>();
  for (const row of staffRows ?? []) {
    if (row.user_id) {
      staffByUserId.set(String(row.user_id), {
        email: typeof row.email === "string" ? row.email : null,
        user_id: String(row.user_id),
      });
    }
  }

  const emails = new Set<string>();
  for (const userId of userIds) {
    const staff = staffByUserId.get(userId) ?? { email: null, user_id: userId };
    const email = await resolveStaffMemberEmail(admin, staff);
    if (email) emails.add(email);
  }

  return [...emails];
}

export async function resolveBulletinEmailRecipients(
  admin: SupabaseClient,
  organizationId: string,
  audiences: BulletinAudience[],
  programIds: string[],
): Promise<BulletinEmailRecipient[]> {
  const byEmail = new Map<string, BulletinEmailRecipient>();

  const familyIds = await resolveBulletinParentFamilyIds(
    admin,
    organizationId,
    audiences,
    programIds,
  );

  for (const familyId of familyIds) {
    const emails = await loadFamilyNotificationEmails(admin, familyId);
    for (const email of emails) {
      const normalized = email.trim().toLowerCase();
      if (!normalized) continue;
      if (!byEmail.has(normalized)) {
        byEmail.set(normalized, { email: normalized, portal: "parent" });
      }
    }
  }

  const staffEmails = await resolveBulletinStaffEmails(admin, organizationId, audiences);
  for (const email of staffEmails) {
    const normalized = email.trim().toLowerCase();
    if (!normalized) continue;
    if (!byEmail.has(normalized)) {
      byEmail.set(normalized, { email: normalized, portal: "teacher" });
    } else if (byEmail.get(normalized)?.portal === "parent") {
      byEmail.set(normalized, { email: normalized, portal: "teacher" });
    }
  }

  return [...byEmail.values()];
}
