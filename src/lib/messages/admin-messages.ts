import type { SupabaseClient } from "@supabase/supabase-js";
import { listAdminMessageContacts } from "./contacts";
import { listThreadsForOrganization } from "./threads";
import type { MessagesInboxData } from "./types";

export async function loadAdminMessagesInbox(
  admin: SupabaseClient,
  organizationId: string,
  userId: string,
  schoolName: string,
): Promise<MessagesInboxData> {
  const schoolOfficeLabel = `${schoolName} Office`;
  const contacts = await listAdminMessageContacts(
    admin,
    organizationId,
    schoolOfficeLabel,
  );

  const threads = await listThreadsForOrganization(
    admin,
    organizationId,
    userId,
    schoolOfficeLabel,
    "admin",
    { type: "admin" },
  );

  return { threads, contacts };
}
