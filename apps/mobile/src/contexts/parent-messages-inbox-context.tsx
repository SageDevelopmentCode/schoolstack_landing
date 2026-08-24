import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { loadParentMessagesInbox } from '@/lib/messages/parent-api';
import type { MessageContact, MessageThreadSummary } from '@/lib/messages/types';
import {
  createParentPortalCache,
  resolveParentPortalProviderInit,
} from '@/lib/parent/parent-portal-cache';

export type ParentMessagesInboxData = {
  threads: MessageThreadSummary[];
  contacts: MessageContact[];
  guardianId: string | null;
};

type ParentMessagesInboxContextValue = {
  threads: MessageThreadSummary[];
  contacts: MessageContact[];
  guardianId: string | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  hasLoaded: boolean;
  refresh: (options?: { silent?: boolean }) => Promise<void>;
};

const ParentMessagesInboxContext = createContext<ParentMessagesInboxContextValue | null>(null);

const messagesInboxCache = createParentPortalCache<ParentMessagesInboxData>('parent_messages:');

function cacheKey(organizationId: string, schoolName: string): string {
  return `${organizationId}:${schoolName}`;
}

function toInboxData(inbox: {
  threads: MessageThreadSummary[];
  contacts: MessageContact[];
  guardianId?: string | null;
}): ParentMessagesInboxData {
  return {
    threads: inbox.threads,
    contacts: inbox.contacts,
    guardianId: inbox.guardianId ?? null,
  };
}

function fetchAndCacheParentMessagesInbox(
  organizationId: string,
  schoolName: string,
  options?: { refresh?: boolean },
): Promise<ParentMessagesInboxData> {
  const key = cacheKey(organizationId, schoolName);
  return messagesInboxCache.fetchAndCache(
    key,
    async () => {
      const inbox = await loadParentMessagesInbox(organizationId, schoolName);
      return toInboxData(inbox);
    },
    options,
  );
}

export function prefetchParentMessagesInbox(
  organizationId: string,
  schoolName: string,
): Promise<void> {
  const key = cacheKey(organizationId, schoolName);
  return messagesInboxCache.prefetch(key, async () => {
    const inbox = await loadParentMessagesInbox(organizationId, schoolName);
    return toInboxData(inbox);
  });
}

export async function hydrateParentMessagesInboxFromDisk(
  organizationId: string,
  schoolName: string,
): Promise<ParentMessagesInboxData | null> {
  return messagesInboxCache.hydrateFromDisk(cacheKey(organizationId, schoolName));
}

type ParentMessagesInboxProviderProps = {
  children: ReactNode;
  organizationId: string;
  schoolName: string;
};

export function ParentMessagesInboxProvider({
  children,
  organizationId,
  schoolName,
}: ParentMessagesInboxProviderProps) {
  const key = cacheKey(organizationId, schoolName);
  const cached = messagesInboxCache.get(key);

  const [threads, setThreads] = useState<MessageThreadSummary[]>(cached?.threads ?? []);
  const [contacts, setContacts] = useState<MessageContact[]>(cached?.contacts ?? []);
  const [guardianId, setGuardianId] = useState<string | null>(cached?.guardianId ?? null);
  const [isLoading, setIsLoading] = useState(!cached);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(Boolean(cached));
  const fetchPromiseRef = useRef<Promise<void> | null>(null);

  const applyInboxData = useCallback((inbox: ParentMessagesInboxData | null) => {
    setThreads(inbox?.threads ?? []);
    setContacts(inbox?.contacts ?? []);
    setGuardianId(inbox?.guardianId ?? null);
  }, []);

  const load = useCallback(
    async (options?: { refresh?: boolean; silent?: boolean }) => {
      const isRefresh = options?.refresh ?? false;
      const silent = options?.silent ?? false;

      if (fetchPromiseRef.current && !isRefresh) {
        await fetchPromiseRef.current;
        return;
      }

      const run = async () => {
        const hasCachedData = Boolean(messagesInboxCache.get(key));
        if (isRefresh || silent) {
          if (!silent || hasCachedData) {
            setIsRefreshing(true);
          }
        } else if (!hasCachedData) {
          setIsLoading(true);
        }
        setError(null);

        try {
          const nextData = await fetchAndCacheParentMessagesInbox(organizationId, schoolName, {
            refresh: isRefresh,
          });
          applyInboxData(nextData);
          setHasLoaded(true);
        } catch (loadError) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load messages.');
        } finally {
          setIsLoading(false);
          setIsRefreshing(false);
          fetchPromiseRef.current = null;
        }
      };

      const promise = run();
      if (!isRefresh) {
        fetchPromiseRef.current = promise;
      }
      await promise;
    },
    [applyInboxData, key, organizationId, schoolName],
  );

  const refresh = useCallback(
    async (options?: { silent?: boolean }) => {
      await load({ refresh: true, silent: options?.silent });
    },
    [load],
  );

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const resolved = await resolveParentPortalProviderInit(key, messagesInboxCache, () =>
        hydrateParentMessagesInboxFromDisk(organizationId, schoolName),
      );
      if (cancelled) return;

      applyInboxData(resolved.data);
      setHasLoaded(resolved.hasLoaded);
      setIsLoading(resolved.isLoading);
      setError(null);

      if (!resolved.shouldBackgroundRefresh) {
        return;
      }

      if (resolved.data) {
        setIsRefreshing(true);
      }

      try {
        await fetchAndCacheParentMessagesInbox(organizationId, schoolName);
        if (cancelled) return;

        applyInboxData(messagesInboxCache.get(key));
        setHasLoaded(Boolean(messagesInboxCache.get(key)));
        setError(null);
      } catch (loadError) {
        if (!cancelled && !messagesInboxCache.get(key)) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load messages.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    }

    void init();

    return () => {
      cancelled = true;
    };
  }, [applyInboxData, key, organizationId, schoolName]);

  const value = useMemo(
    () => ({
      threads,
      contacts,
      guardianId,
      isLoading,
      isRefreshing,
      error,
      hasLoaded,
      refresh,
    }),
    [contacts, error, guardianId, hasLoaded, isLoading, isRefreshing, refresh, threads],
  );

  return (
    <ParentMessagesInboxContext.Provider value={value}>{children}</ParentMessagesInboxContext.Provider>
  );
}

export function useParentMessagesInbox(): ParentMessagesInboxContextValue {
  const context = useContext(ParentMessagesInboxContext);
  if (!context) {
    throw new Error('useParentMessagesInbox must be used within ParentMessagesInboxProvider');
  }
  return context;
}
