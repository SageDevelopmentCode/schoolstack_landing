import { loadParentMessagesThreads } from "@/lib/messages/parent-messages";
import { createAdminClient } from "@/utils/supabase/admin";
import { getRequestUser } from "@/lib/auth/session";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export type ParentMessagesInboxData = {
  threads: Awaited<ReturnType<typeof loadParentMessagesThreads>>["threads"];
  guardianId: string | null;
};

export async function loadParentMessagesInboxData(
  organizationId: string,
  schoolName: string,
): Promise<ParentMessagesInboxData> {
  const user = await getRequestUser();
  if (!user) {
    return { threads: [], guardianId: null };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const admin = createAdminClient();
  const { threads, guardianId } = await loadParentMessagesThreads(
    admin,
    organizationId,
    user.id,
    schoolName,
    supabase,
  );

  return { threads, guardianId };
}
