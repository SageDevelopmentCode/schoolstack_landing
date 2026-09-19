import type { PortalMessage } from "./types";

const DEFAULT_PENDING_MATCH_WINDOW_MS = 30_000;
const DEFAULT_RECENTLY_CONFIRMED_TTL_MS = 10_000;

export type ReconcileThreadMessagesOptions = {
  optimisticToServerId?: ReadonlyMap<string, string>;
  recentlyConfirmedIds?: ReadonlySet<string>;
  pendingMatchWindowMs?: number;
};

export function matchesPendingServerMessage(
  server: PortalMessage,
  pending: PortalMessage,
  windowMs: number,
): boolean {
  if (!pending.pending) return false;
  if (!server.isOwn || !pending.isOwn) return false;
  if (server.body.trim() !== pending.body.trim()) return false;

  const timeDiff = Math.abs(
    new Date(server.createdAt).getTime() - new Date(pending.createdAt).getTime(),
  );
  return timeDiff <= windowMs;
}

export function reconcileThreadMessages(
  serverMessages: PortalMessage[],
  localMessages: PortalMessage[],
  options?: ReconcileThreadMessagesOptions,
): PortalMessage[] {
  const windowMs = options?.pendingMatchWindowMs ?? DEFAULT_PENDING_MATCH_WINDOW_MS;
  const optimisticToServerId = options?.optimisticToServerId;
  const recentlyConfirmedIds = options?.recentlyConfirmedIds;

  const byId = new Map<string, PortalMessage>();
  for (const message of serverMessages) {
    byId.set(message.id, message);
  }

  for (const local of localMessages) {
    if (local.pending) {
      const mappedServerId = optimisticToServerId?.get(local.id);
      if (mappedServerId && byId.has(mappedServerId)) {
        continue;
      }

      const hasServerMatch = serverMessages.some((server) =>
        matchesPendingServerMessage(server, local, windowMs),
      );
      if (!hasServerMatch) {
        byId.set(local.id, local);
      }
      continue;
    }

    if (recentlyConfirmedIds?.has(local.id) && !byId.has(local.id)) {
      byId.set(local.id, local);
    }
  }

  return [...byId.values()].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

export function createLoadGenerationGuard() {
  let current = 0;

  return {
    bump(): number {
      current += 1;
      return current;
    },
    isLatest(generation: number): boolean {
      return generation === current;
    },
  };
}

export type OptimisticSendTracker = ReturnType<typeof createOptimisticSendTracker>;

export function createOptimisticSendTracker(
  recentlyConfirmedTtlMs = DEFAULT_RECENTLY_CONFIRMED_TTL_MS,
) {
  const pendingIds = new Set<string>();
  const optimisticToServerId = new Map<string, string>();
  const recentlyConfirmedIds = new Set<string>();
  const confirmTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

  const scheduleRecentlyConfirmedExpiry = (serverId: string, optimisticId: string) => {
    const existing = confirmTimeouts.get(serverId);
    if (existing) clearTimeout(existing);

    confirmTimeouts.set(
      serverId,
      setTimeout(() => {
        recentlyConfirmedIds.delete(serverId);
        confirmTimeouts.delete(serverId);
        optimisticToServerId.delete(optimisticId);
      }, recentlyConfirmedTtlMs),
    );
  };

  return {
    addPending(optimisticId: string) {
      pendingIds.add(optimisticId);
    },
    removePending(optimisticId: string) {
      pendingIds.delete(optimisticId);
    },
    confirm(optimisticId: string, serverId: string) {
      pendingIds.delete(optimisticId);
      optimisticToServerId.set(optimisticId, serverId);
      recentlyConfirmedIds.add(serverId);
      scheduleRecentlyConfirmedExpiry(serverId, optimisticId);
    },
    fail(optimisticId: string) {
      pendingIds.delete(optimisticId);
      optimisticToServerId.delete(optimisticId);
    },
    getReconcileOptions(): ReconcileThreadMessagesOptions {
      return {
        optimisticToServerId,
        recentlyConfirmedIds,
      };
    },
    hasPending(): boolean {
      return pendingIds.size > 0;
    },
  };
}
