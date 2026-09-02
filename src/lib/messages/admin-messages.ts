import type { SupabaseClient } from "@supabase/supabase-js";
import { getStaffMemberIdForUser } from "@/lib/staff/teacher-portal-access";
import { listAdminMessageContacts } from "./contacts";
import { listThreadsForOrganization } from "./threads";
import type { MessageThreadSummary, MessagesInboxData, MessagesViewerContext } from "./types";

export async function loadAdminMessagesViewerContext(
  admin: SupabaseClient,
  supabase: SupabaseClient,
  organizationId: string,
  userId: string,
): Promise<MessagesViewerContext> {
  const staffMemberId = await getStaffMemberIdForUser(
    supabase,
    userId,
    organizationId,
  );

  if (!staffMemberId) {
    return { staffMemberId: null, staffDisplayName: null };
  }

  const { data: staffRow } = await admin
    .from("staff_members")
    .select("first_name, last_name")
    .eq("id", staffMemberId)
    .maybeSingle();

  const staffDisplayName = staffRow
    ? [staffRow.first_name, staffRow.last_name].filter(Boolean).join(" ") || null
    : null;

  return { staffMemberId, staffDisplayName };
}

export async function loadAdminMessagesThreads(
  admin: SupabaseClient,
  organizationId: string,
  userId: string,
  schoolName: string,
): Promise<MessageThreadSummary[]> {
  const schoolOfficeLabel = `${schoolName} Office`;

  return listThreadsForOrganization(
    admin,
    organizationId,
    userId,
    schoolOfficeLabel,
    "admin",
    { type: "admin" },
  );
}

export async function loadAdminMessagesContacts(
  admin: SupabaseClient,
  organizationId: string,
  schoolName: string,
) {
  const schoolOfficeLabel = `${schoolName} Office`;
  return listAdminMessageContacts(admin, organizationId, schoolOfficeLabel);
}

type LoadAdminMessagesInboxOptions = {
  includeContacts?: boolean;
};

export async function loadAdminMessagesInbox(
  admin: SupabaseClient,
  organizationId: string,
  userId: string,
  schoolName: string,
  supabase?: SupabaseClient,
  options: LoadAdminMessagesInboxOptions = {},
): Promise<MessagesInboxData> {
  const includeContacts = options.includeContacts ?? false;
  const schoolOfficeLabel = `${schoolName} Office`;

  const [threads, contacts, viewerContext] = await Promise.all([
    listThreadsForOrganization(
      admin,
      organizationId,
      userId,
      schoolOfficeLabel,
      "admin",
      { type: "admin" },
    ),
    includeContacts
      ? listAdminMessageContacts(admin, organizationId, schoolOfficeLabel)
      : Promise.resolve([]),
    supabase
      ? loadAdminMessagesViewerContext(admin, supabase, organizationId, userId)
      : Promise.resolve({ staffMemberId: null, staffDisplayName: null }),
  ]);

  return {
    threads,
    contacts,
    viewerContext,
  };
}
