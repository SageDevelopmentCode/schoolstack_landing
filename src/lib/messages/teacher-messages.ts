import type { SupabaseClient } from "@supabase/supabase-js";
import { listTeacherMessageContacts } from "./contacts";
import { listThreadsForOrganization } from "./threads";
import type { MessagesInboxData } from "./types";

export async function loadTeacherMessagesInbox(
  admin: SupabaseClient,
  organizationId: string,
  userId: string,
  staffMemberId: string,
  schoolName: string,
): Promise<MessagesInboxData> {
  const schoolOfficeLabel = `${schoolName} Office`;
  const contacts = await listTeacherMessageContacts(
    admin,
    organizationId,
    staffMemberId,
  );

  const threads = await listThreadsForOrganization(
    admin,
    organizationId,
    userId,
    schoolOfficeLabel,
    "teacher",
    { type: "staff", staffMemberId },
  );

  return { threads, contacts };
}
