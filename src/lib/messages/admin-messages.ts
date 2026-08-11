import type { SupabaseClient } from "@supabase/supabase-js";
import { getStaffMemberIdForUser } from "@/lib/staff/teacher-portal-access";
import { listAdminMessageContacts } from "./contacts";
import { listThreadsForOrganization } from "./threads";
import type { MessagesInboxData } from "./types";

export async function loadAdminMessagesInbox(
  admin: SupabaseClient,
  organizationId: string,
  userId: string,
  schoolName: string,
  supabase?: SupabaseClient,
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

  let staffMemberId: string | null = null;
  let staffDisplayName: string | null = null;

  if (supabase) {
    staffMemberId = await getStaffMemberIdForUser(
      supabase,
      userId,
      organizationId,
    );

    if (staffMemberId) {
      const { data: staffRow } = await admin
        .from("staff_members")
        .select("first_name, last_name")
        .eq("id", staffMemberId)
        .maybeSingle();

      if (staffRow) {
        staffDisplayName =
          [staffRow.first_name, staffRow.last_name].filter(Boolean).join(" ") ||
          null;
      }
    }
  }

  return {
    threads,
    contacts,
    viewerContext: { staffMemberId, staffDisplayName },
  };
}
