export type ThreadUnreadCountRow = {
  thread_id: string;
  unread_count: number | string;
};

export function mapThreadUnreadCountRows(
  threadIds: string[],
  rows: ThreadUnreadCountRow[] | null | undefined,
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const threadId of threadIds) {
    counts.set(threadId, 0);
  }
  for (const row of rows ?? []) {
    counts.set(String(row.thread_id), Number(row.unread_count));
  }
  return counts;
}

export function shouldDeferInboxFetch(options: {
  initialInbox?: { threads: unknown[]; threadsDeferred?: boolean } | null;
  threadsHydrated: boolean;
}): boolean {
  if (!options.initialInbox) return false;
  if (options.threadsHydrated) return true;
  return Boolean(options.initialInbox.threadsDeferred);
}

export function initialInboxLoadingState(
  initialInbox?: {
    threads: unknown[];
    threadsDeferred?: boolean;
  } | null,
): boolean {
  if (!initialInbox) return true;
  if (initialInbox.threadsDeferred) return true;
  return false;
}
