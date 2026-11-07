import type { SupabaseClient } from "@supabase/supabase-js";
import { userHasEnrolledAccess } from "@/lib/admissions/parent-portal-access";
import { getGuardianIdsForUser } from "@/lib/messages/messages";
import { reportOperationalError } from "@/lib/operational-errors";
import { getStaffMemberIdForUser } from "@/lib/staff/teacher-portal-access";
import {
  countAdminUnreadMessages,
  getTotalUnreadCount,
  shouldNotifyUnreadRpcFailure,
} from "./threads";

/**
 * Parent unread badge. One `parent_unread_message_count` call (security definer, keyed on
 * `auth.uid()`, so it must run on the request-scoped client). Falls back to the thread-list path
 * only when the RPC is unavailable, and reports that so a missing migration is not silent.
 */
export async function getParentMessagesUnreadCount(
  admin: SupabaseClient,
  supabase: SupabaseClient,
  organizationId: string,
  userId: string,
  schoolName: string,
): Promise<number> {
  const { data, error } = await supabase.rpc("parent_unread_message_count", {
    p_organization_id: organizationId,
    p_program_id: null,
  });

  if (!error && data != null) {
    return Number(data);
  }

  if (error) {
    void reportOperationalError({
      supabase: admin,
      surface: "parent_portal",
      operation: "messages.parent_unread_count_rpc_failed",
      error: "parent_unread_message_count RPC failed; using the slower fallback.",
      code: error.code ?? null,
      details: error.message,
      organizationId,
      notify: shouldNotifyUnreadRpcFailure(),
      actor: { type: "parent", userId },
      cause: error,
    });
  }

  return getParentMessagesUnreadCountLegacy(
    admin,
    supabase,
    organizationId,
    userId,
    schoolName,
  );
}

async function getParentMessagesUnreadCountLegacy(
  admin: SupabaseClient,
  supabase: SupabaseClient,
  organizationId: string,
  userId: string,
  schoolName: string,
): Promise<number> {
  const hasAccess = await userHasEnrolledAccess(supabase, userId, organizationId);
  if (!hasAccess) return 0;

  return getParentMessagesUnreadCountForUser(
    admin,
    organizationId,
    userId,
    schoolName,
  );
}

/**
 * Thread-list based count for a known guardian user. No access check: callers are the admin
 * family preview (which reads on behalf of a guardian) or have already authorized the user.
 */
export async function getParentMessagesUnreadCountForUser(
  admin: SupabaseClient,
  organizationId: string,
  userId: string,
  schoolName: string,
): Promise<number> {
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
