import type { SupabaseClient } from "@supabase/supabase-js";
import { PortalRouteError } from "@/lib/api/portal-route-errors";
import {
  mapParticipantRow,
  type MessageThreadParticipantRow,
} from "@/lib/messages/mappers";
import { shouldOmitPlatformSupportThreadForViewer } from "@/lib/messages/platform-support";

export async function assertSchoolAdminCanAccessThread(
  admin: SupabaseClient,
  organizationId: string,
  threadId: string,
): Promise<void> {
  const { data: participantRows, error } = await admin
    .from("message_thread_participants")
    .select("*")
    .eq("thread_id", threadId)
    .eq("organization_id", organizationId);

  if (error) throw new Error(error.message);

  const participants = ((participantRows ?? []) as MessageThreadParticipantRow[]).map(
    mapParticipantRow,
  );

  if (shouldOmitPlatformSupportThreadForViewer(participants, "admin")) {
    throw new PortalRouteError("You do not have access to this thread.", 403, "forbidden");
  }
}
