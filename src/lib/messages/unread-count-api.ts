import type { SupabaseClient } from "@supabase/supabase-js";
import { getFamilyIdsForUser } from "@/lib/admissions/application-auth";
import { userHasEnrolledAccess } from "@/lib/admissions/parent-portal-access";
import { getStaffMemberIdForUser } from "@/lib/staff/teacher-portal-access";
import { getTotalUnreadCount } from "./threads";

export async function getParentMessagesUnreadCount(
  admin: SupabaseClient,
  supabase: SupabaseClient,
  organizationId: string,
  userId: string,
  schoolName: string,
): Promise<number> {
  const hasAccess = await userHasEnrolledAccess(supabase, userId, organizationId);
  if (!hasAccess) return 0;

  const familyIds = await getFamilyIdsForUser(supabase, userId, organizationId);
  if (familyIds.length === 0) return 0;

  return getTotalUnreadCount(
    admin,
    organizationId,
    userId,
    `${schoolName} Office`,
    "parent",
    { type: "family", familyIds },
  );
}

export async function getTeacherMessagesUnreadCount(
  admin: SupabaseClient,
  supabase: SupabaseClient,
  organizationId: string,
  userId: string,
  schoolName: string,
): Promise<number> {
  const staffMemberId = await getStaffMemberIdForUser(
    supabase,
    userId,
    organizationId,
  );
  if (!staffMemberId) return 0;

  return getTotalUnreadCount(
    admin,
    organizationId,
    userId,
    `${schoolName} Office`,
    "teacher",
    { type: "staff", staffMemberId },
  );
}

export async function getAdminMessagesUnreadCount(
  admin: SupabaseClient,
  organizationId: string,
  userId: string,
  schoolName: string,
): Promise<number> {
  return getTotalUnreadCount(
    admin,
    organizationId,
    userId,
    `${schoolName} Office`,
    "admin",
    { type: "admin" },
  );
}
