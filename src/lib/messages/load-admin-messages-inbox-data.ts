import { loadAdminMessagesThreads } from "@/lib/messages/admin-messages";
import { createAdminClient } from "@/utils/supabase/admin";
import { getRequestUser } from "@/lib/auth/session";

export type AdminMessagesInboxData = {
  threads: Awaited<ReturnType<typeof loadAdminMessagesThreads>>;
};

export async function loadAdminMessagesInboxData(
  organizationId: string,
  schoolName: string,
): Promise<AdminMessagesInboxData> {
  const user = await getRequestUser();
  if (!user) {
    return { threads: [] };
  }

  const admin = createAdminClient();
  const threads = await loadAdminMessagesThreads(
    admin,
    organizationId,
    user.id,
    schoolName,
  );

  return { threads };
}
