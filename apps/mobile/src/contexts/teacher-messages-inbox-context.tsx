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

import { loadTeacherMessagesInbox } from '@/lib/messages/teacher-api';
import type { MessageContact, MessageThreadSummary } from '@/lib/messages/types';
import { createTeacherPortalErrorReporter } from '@/lib/mobile-error-reporter';
import {
  createTeacherPortalCache,
  resolveTeacherPortalProviderInit,
} from '@/lib/teacher/teacher-portal-cache';

export type TeacherMessagesInboxData = {
  threads: MessageThreadSummary[];
  contacts: MessageContact[];
  staffMemberId: string | null;
};

type TeacherMessagesInboxContextValue = {
  threads: MessageThreadSummary[];
  contacts: MessageContact[];
  staffMemberId: string | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  hasLoaded: boolean;
  refresh: (options?: { silent?: boolean }) => Promise<void>;
};

const TeacherMessagesInboxContext = createContext<TeacherMessagesInboxContextValue | null>(null);

const messagesInboxCache = createTeacherPortalCache<TeacherMessagesInboxData>('teacher_messages:');

function cacheKey(organizationId: string, schoolName: string): string {
  return `${organizationId}:${schoolName}`;
}

function toInboxData(inbox: {
  threads: MessageThreadSummary[];
  contacts: MessageContact[];
  viewerContext?: { staffMemberId?: string | null };
}): TeacherMessagesInboxData {
  return {
    threads: inbox.threads,
    contacts: inbox.contacts,
    staffMemberId: inbox.viewerContext?.staffMemberId ?? null,
  };
}

function fetchAndCacheTeacherMessagesInbox(
  organizationId: string,
  schoolName: string,
  options?: { refresh?: boolean },
): Promise<TeacherMessagesInboxData> {
  const key = cacheKey(organizationId, schoolName);
  return messagesInboxCache.fetchAndCache(
    key,
    async () => {
      const inbox = await loadTeacherMessagesInbox(organizationId, schoolName);
      return toInboxData(inbox);
    },
    options,
  );
}

export function prefetchTeacherMessagesInbox(
  organizationId: string,
  schoolName: string,
): Promise<void> {
  const key = cacheKey(organizationId, schoolName);
  return messagesInboxCache.prefetch(key, async () => {
    const inbox = await loadTeacherMessagesInbox(organizationId, schoolName);
    return toInboxData(inbox);
  });
}

export async function hydrateTeacherMessagesInboxFromDisk(
  organizationId: string,
  schoolName: string,
): Promise<TeacherMessagesInboxData | null> {
  return messagesInboxCache.hydrateFromDisk(cacheKey(organizationId, schoolName));
}

type TeacherMessagesInboxProviderProps = {
  children: ReactNode;
  organizationId: string;
  schoolName: string;
};

export function TeacherMessagesInboxProvider({
  children,
  organizationId,
  schoolName,
}: TeacherMessagesInboxProviderProps) {
  const key = cacheKey(organizationId, schoolName);
  const cached = messagesInboxCache.get(key);

  const [threads, setThreads] = useState<MessageThreadSummary[]>(cached?.threads ?? []);
  const [contacts, setContacts] = useState<MessageContact[]>(cached?.contacts ?? []);
  const [staffMemberId, setStaffMemberId] = useState<string | null>(cached?.staffMemberId ?? null);
  const [isLoading, setIsLoading] = useState(!cached);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(Boolean(cached));
  const fetchPromiseRef = useRef<Promise<void> | null>(null);
  const reportError = useMemo(
    () => createTeacherPortalErrorReporter(organizationId),
    [organizationId],
  );

  const applyInboxData = useCallback((inbox: TeacherMessagesInboxData | null) => {
    setThreads(inbox?.threads ?? []);
    setContacts(inbox?.contacts ?? []);
    setStaffMemberId(inbox?.staffMemberId ?? null);
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
          const nextData = await fetchAndCacheTeacherMessagesInbox(organizationId, schoolName, {
            refresh: isRefresh,
          });
          applyInboxData(nextData);
          setHasLoaded(true);
        } catch (loadError) {
          reportError('teacher_messages_inbox_load', loadError);
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
    [applyInboxData, key, organizationId, reportError, schoolName],
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
      const resolved = await resolveTeacherPortalProviderInit(key, messagesInboxCache, () =>
        hydrateTeacherMessagesInboxFromDisk(organizationId, schoolName),
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
        await fetchAndCacheTeacherMessagesInbox(organizationId, schoolName);
        if (cancelled) return;

        applyInboxData(messagesInboxCache.get(key));
        setHasLoaded(Boolean(messagesInboxCache.get(key)));
        setError(null);
      } catch (loadError) {
        reportError('teacher_messages_inbox_load', loadError);
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
  }, [applyInboxData, key, organizationId, reportError, schoolName]);

  const value = useMemo(
    () => ({
      threads,
      contacts,
      staffMemberId,
      isLoading,
      isRefreshing,
      error,
      hasLoaded,
      refresh,
    }),
    [contacts, error, hasLoaded, isLoading, isRefreshing, refresh, staffMemberId, threads],
  );

  return (
    <TeacherMessagesInboxContext.Provider value={value}>
      {children}
    </TeacherMessagesInboxContext.Provider>
  );
}

export function useTeacherMessagesInbox(): TeacherMessagesInboxContextValue {
  const context = useContext(TeacherMessagesInboxContext);
  if (!context) {
    throw new Error('useTeacherMessagesInbox must be used within TeacherMessagesInboxProvider');
  }
  return context;
}
