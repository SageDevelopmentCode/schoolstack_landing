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

import { loadMessagesContacts, loadMessagesInbox } from '@/lib/messages/api';
import type {
  MessageContact,
  MessagesViewerContext,
  MessageThreadSummary,
} from '@/lib/messages/types';
import {
  createPortalCache,
  resolvePortalProviderInit,
} from '@/lib/portal-cache';
import { createSchoolAdminErrorReporter } from '@/lib/mobile-error-reporter';

export type SchoolAdminMessagesInboxData = {
  threads: MessageThreadSummary[];
  contacts: MessageContact[];
  viewerContext?: MessagesViewerContext;
};

type SchoolAdminMessagesInboxContextValue = {
  threads: MessageThreadSummary[];
  contacts: MessageContact[];
  staffDisplayName: string | null;
  isLoading: boolean;
  isRefreshing: boolean;
  loadingContacts: boolean;
  error: string | null;
  hasLoaded: boolean;
  refresh: (options?: { silent?: boolean }) => Promise<void>;
  ensureContactsLoaded: () => Promise<void>;
};

const SchoolAdminMessagesInboxContext =
  createContext<SchoolAdminMessagesInboxContextValue | null>(null);

const messagesInboxCache = createPortalCache<SchoolAdminMessagesInboxData>(
  'school_admin_messages:',
);

function cacheKey(organizationId: string, schoolName: string): string {
  return `${organizationId}:${schoolName}`;
}

async function fetchMessagesInboxData(
  organizationId: string,
  schoolName: string,
): Promise<SchoolAdminMessagesInboxData> {
  const inbox = await loadMessagesInbox(organizationId, schoolName);
  return {
    threads: inbox.threads,
    contacts: inbox.contacts,
    viewerContext: inbox.viewerContext,
  };
}

function fetchAndCacheMessagesInbox(
  organizationId: string,
  schoolName: string,
  options?: { refresh?: boolean },
): Promise<SchoolAdminMessagesInboxData> {
  const key = cacheKey(organizationId, schoolName);
  return messagesInboxCache.fetchAndCache(
    key,
    () => fetchMessagesInboxData(organizationId, schoolName),
    options,
  );
}

export function prefetchSchoolAdminMessagesInbox(
  organizationId: string,
  schoolName: string,
): Promise<void> {
  const key = cacheKey(organizationId, schoolName);
  return messagesInboxCache.prefetch(key, () =>
    fetchMessagesInboxData(organizationId, schoolName),
  );
}

export async function hydrateSchoolAdminMessagesInboxFromDisk(
  organizationId: string,
  schoolName: string,
): Promise<SchoolAdminMessagesInboxData | null> {
  return messagesInboxCache.hydrateFromDisk(cacheKey(organizationId, schoolName));
}

type SchoolAdminMessagesInboxProviderProps = {
  children: ReactNode;
  organizationId: string;
  schoolName: string;
};

export function SchoolAdminMessagesInboxProvider({
  children,
  organizationId,
  schoolName,
}: SchoolAdminMessagesInboxProviderProps) {
  const key = cacheKey(organizationId, schoolName);
  const cached = messagesInboxCache.get(key);
  const reportError = useMemo(
    () => createSchoolAdminErrorReporter(organizationId),
    [organizationId],
  );

  const [threads, setThreads] = useState<MessageThreadSummary[]>(cached?.threads ?? []);
  const [contacts, setContacts] = useState<MessageContact[]>(cached?.contacts ?? []);
  const [viewerContext, setViewerContext] = useState<MessagesViewerContext | null>(
    cached?.viewerContext ?? null,
  );
  const [isLoading, setIsLoading] = useState(!cached);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(Boolean(cached));
  const fetchPromiseRef = useRef<Promise<void> | null>(null);
  const contactsPromiseRef = useRef<Promise<void> | null>(null);

  const applyInboxData = useCallback((inbox: SchoolAdminMessagesInboxData | null) => {
    setThreads(inbox?.threads ?? []);
    // Threads API excludes contacts; only overwrite when contacts were loaded.
    if (inbox && inbox.contacts.length > 0) {
      setContacts(inbox.contacts);
    }
    if (inbox?.viewerContext) {
      setViewerContext(inbox.viewerContext);
    }
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
          const nextData = await fetchAndCacheMessagesInbox(organizationId, schoolName, {
            refresh: isRefresh,
          });
          applyInboxData(nextData);
          setHasLoaded(true);
        } catch (loadError) {
          reportError('school_admin_messages_inbox_load', loadError);
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

  const ensureContactsLoaded = useCallback(async () => {
    if (contacts.length > 0) return;
    if (contactsPromiseRef.current) {
      await contactsPromiseRef.current;
      return;
    }

    const run = async () => {
      setLoadingContacts(true);
      try {
        const nextContacts = await loadMessagesContacts(organizationId, schoolName);
        setContacts(nextContacts);
        setError(null);
      } catch (loadError) {
        reportError('school_admin_messages_contacts_load', loadError);
        setError(loadError instanceof Error ? loadError.message : 'Failed to load contacts.');
      } finally {
        setLoadingContacts(false);
        contactsPromiseRef.current = null;
      }
    };

    const promise = run();
    contactsPromiseRef.current = promise;
    await promise;
  }, [contacts.length, organizationId, reportError, schoolName]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const resolved = await resolvePortalProviderInit(key, messagesInboxCache, () =>
        hydrateSchoolAdminMessagesInboxFromDisk(organizationId, schoolName),
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
        await fetchAndCacheMessagesInbox(organizationId, schoolName);
        if (cancelled) return;

        applyInboxData(messagesInboxCache.get(key));
        setHasLoaded(Boolean(messagesInboxCache.get(key)));
        setError(null);
      } catch (loadError) {
        if (!cancelled && !messagesInboxCache.get(key)) {
          reportError('school_admin_messages_inbox_load', loadError);
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
      staffDisplayName: viewerContext?.staffDisplayName ?? null,
      isLoading,
      isRefreshing,
      loadingContacts,
      error,
      hasLoaded,
      refresh,
      ensureContactsLoaded,
    }),
    [
      contacts,
      ensureContactsLoaded,
      error,
      hasLoaded,
      isLoading,
      isRefreshing,
      loadingContacts,
      refresh,
      threads,
      viewerContext?.staffDisplayName,
    ],
  );

  return (
    <SchoolAdminMessagesInboxContext.Provider value={value}>
      {children}
    </SchoolAdminMessagesInboxContext.Provider>
  );
}

export function useSchoolAdminMessagesInbox(): SchoolAdminMessagesInboxContextValue {
  const context = useContext(SchoolAdminMessagesInboxContext);
  if (!context) {
    throw new Error(
      'useSchoolAdminMessagesInbox must be used within SchoolAdminMessagesInboxProvider',
    );
  }
  return context;
}
