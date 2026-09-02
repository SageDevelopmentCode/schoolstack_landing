import type { SupabaseClient } from "@supabase/supabase-js";
import { userHasEnrolledAccess } from "@/lib/admissions/parent-portal-access";
import { getGuardianIdsForUser } from "@/lib/messages/messages";
import { getStaffMemberIdForUser } from "@/lib/staff/teacher-portal-access";
import { countAdminUnreadMessages, getTotalUnreadCount } from "./threads";

export async function getParentMessagesUnreadCount(
  admin: SupabaseClient,
  supabase: SupabaseClient,
  organizationId: string,
  userId: string,
  schoolName: string,
): Promise<number> {
  const hasAccess = await userHasEnrolledAccess(supabase, userId, organizationId);
  if (!hasAccess) return 0;

  const guardianIds = await getGuardianIdsForUser(admin, userId, organizationId);
  if (guardianIds.length === 0) return 0;

  return getTotalUnreadCount(
    admin,
    organizationId,
    userId,
    `${schoolName} Office`,
    "parent",
    { type: "guardian", guardianIds },
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
  _schoolName: string,
): Promise<number> {
  return countAdminUnreadMessages(admin, organizationId, userId);
}
