import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

export type BroadcastDeliveryRecord = {
  guardianId: string;
  threadId: string;
  messageId: string;
};

export async function loadBroadcastDeliveries(
  admin: SupabaseClient,
  broadcastBatchId: string,
): Promise<Map<string, BroadcastDeliveryRecord>> {
  const deliveries = new Map<string, BroadcastDeliveryRecord>();

  const { data, error } = await admin
    .from("message_broadcast_deliveries")
    .select("guardian_id, thread_id, message_id")
    .eq("broadcast_batch_id", broadcastBatchId);

  if (error) throw new Error(error.message);

  for (const row of data ?? []) {
    deliveries.set(String(row.guardian_id), {
      guardianId: String(row.guardian_id),
      threadId: String(row.thread_id),
      messageId: String(row.message_id),
    });
  }

  return deliveries;
}

export async function recordBroadcastDelivery(
  admin: SupabaseClient,
  input: {
    broadcastBatchId: string;
    organizationId: string;
    guardianId: string;
    threadId: string;
    messageId: string;
  },
): Promise<void> {
  const { error } = await admin.from("message_broadcast_deliveries").upsert(
    {
      broadcast_batch_id: input.broadcastBatchId,
      organization_id: input.organizationId,
      guardian_id: input.guardianId,
      thread_id: input.threadId,
      message_id: input.messageId,
    },
    { onConflict: "broadcast_batch_id,guardian_id", ignoreDuplicates: true },
  );

  if (error) throw new Error(error.message);
}
