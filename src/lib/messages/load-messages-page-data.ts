import type { SupabaseClient } from "@supabase/supabase-js";
import { loadParentMessagesInbox } from "./parent-messages";
import { loadTeacherMessagesInbox } from "./teacher-messages";
import { loadAdminMessagesInbox } from "./admin-messages";
import type { MessagesInboxData } from "./types";

export async function loadParentMessagesPageData(
  admin: SupabaseClient,
  supabase: SupabaseClient,
  organizationId: string,
  userId: string,
  schoolName: string,
): Promise<MessagesInboxData> {
  return loadParentMessagesInbox(admin, supabase, organizationId, userId, schoolName);
}

export async function loadTeacherMessagesPageData(
  admin: SupabaseClient,
  organizationId: string,
  userId: string,
  staffMemberId: string,
  schoolName: string,
): Promise<MessagesInboxData> {
  return loadTeacherMessagesInbox(
    admin,
    organizationId,
    userId,
    staffMemberId,
    schoolName,
  );
}

export async function loadAdminMessagesPageData(
  admin: SupabaseClient,
  organizationId: string,
  userId: string,
  schoolName: string,
): Promise<MessagesInboxData> {
  return loadAdminMessagesInbox(admin, organizationId, userId, schoolName);
}
