import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

/** Matches “no read row” for unread counts; must not be used on UPDATE of existing rows. */
export const MESSAGE_THREAD_NEVER_READ_LAST_READ_AT =
  "1970-01-01T00:00:00.000Z";

export type ThreadUserPair = {
  threadId: string;
  userId: string;
};

export type MessageThreadReadStampFields = {
  last_unread_digest_notified_at?: string;
  last_email_notified_at?: string;
};

export function threadUserPairKey(threadId: string, userId: string): string {
  return `${threadId}:${userId}`;
}

export function partitionPairsByExistingReads(
  pairs: ThreadUserPair[],
  existingKeys: Iterable<string>,
): { toUpdate: ThreadUserPair[]; toInsert: ThreadUserPair[] } {
  const existing = new Set(existingKeys);
  const toUpdate: ThreadUserPair[] = [];
  const toInsert: ThreadUserPair[] = [];
  const seen = new Set<string>();

  for (const pair of pairs) {
    const key = threadUserPairKey(pair.threadId, pair.userId);
    if (seen.has(key)) continue;
    seen.add(key);
    if (existing.has(key)) {
      toUpdate.push(pair);
    } else {
      toInsert.push(pair);
    }
  }

  return { toUpdate, toInsert };
}

export async function stampMessageThreadReadFields(
  admin: SupabaseClient,
  pairs: ThreadUserPair[],
  fields: MessageThreadReadStampFields,
): Promise<void> {
  if (pairs.length === 0) return;

  const threadIds = [...new Set(pairs.map((pair) => pair.threadId))];
  const userIds = [...new Set(pairs.map((pair) => pair.userId))];

  const { data, error } = await admin
    .from("message_thread_reads")
    .select("thread_id, user_id")
    .in("thread_id", threadIds)
    .in("user_id", userIds);

  if (error) throw new Error(error.message);

  const existingKeys = (data ?? []).map((row) =>
    threadUserPairKey(String(row.thread_id), String(row.user_id)),
  );

  const { toUpdate, toInsert } = partitionPairsByExistingReads(
    pairs,
    existingKeys,
  );

  if (toUpdate.length > 0) {
    const { error: updateError } = await admin
      .from("message_thread_reads")
      .upsert(
        toUpdate.map((pair) => ({
          thread_id: pair.threadId,
          user_id: pair.userId,
          ...fields,
        })),
        { onConflict: "thread_id,user_id" },
      );

    if (updateError) throw new Error(updateError.message);
  }

  if (toInsert.length > 0) {
    const { error: insertError } = await admin
      .from("message_thread_reads")
      .insert(
        toInsert.map((pair) => ({
          thread_id: pair.threadId,
          user_id: pair.userId,
          last_read_at: MESSAGE_THREAD_NEVER_READ_LAST_READ_AT,
          ...fields,
        })),
      );

    if (insertError) throw new Error(insertError.message);
  }
}
