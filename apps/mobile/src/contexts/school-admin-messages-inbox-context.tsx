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
  DEFAULT_PORTAL_CACHE_TTL_MS,
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

const messagesContactsCache = createPortalCache<MessageContact[]>(
  'school_admin_messages_contacts:',
);

function cacheKey(organizationId: string, schoolName: string): string {
  return `${organizationId}:${schoolName}`;
}

async function fetchMessagesContacts(
  organizationId: string,
  schoolName: string,
): Promise<MessageContact[]> {
  return loadMessagesContacts(organizationId, schoolName);
}

function fetchAndCacheMessagesContacts(
  organizationId: string,
  schoolName: string,
  options?: { refresh?: boolean },
): Promise<MessageContact[]> {
  const key = cacheKey(organizationId, schoolName);
  return messagesContactsCache.fetchAndCache(
    key,
    () => fetchMessagesContacts(organizationId, schoolName),
    options,
  );
}

export function prefetchSchoolAdminMessagesContacts(
  organizationId: string,
  schoolName: string,
): Promise<void> {
  const key = cacheKey(organizationId, schoolName);
  return messagesContactsCache.prefetch(key, () =>
    fetchMessagesContacts(organizationId, schoolName),
  );
}

export async function hydrateSchoolAdminMessagesContactsFromDisk(
  organizationId: string,
  schoolName: string,
): Promise<MessageContact[] | null> {
  return messagesContactsCache.hydrateFromDisk(cacheKey(organizationId, schoolName));
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
  const cachedContacts = messagesContactsCache.get(key);
  const reportError = useMemo(
    () => createSchoolAdminErrorReporter(organizationId),
    [organizationId],
  );

  const [threads, setThreads] = useState<MessageThreadSummary[]>(cached?.threads ?? []);
  const [contacts, setContacts] = useState<MessageContact[]>(cachedContacts ?? []);
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
    if (inbox?.viewerContext) {
      setViewerContext(inbox.viewerContext);
    }
  }, []);

  const applyContactsData = useCallback((nextContacts: MessageContact[] | null) => {
    if (nextContacts && nextContacts.length > 0) {
      setContacts(nextContacts);
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
    const memoryContacts = messagesContactsCache.get(key);
    if (memoryContacts && memoryContacts.length > 0) {
      applyContactsData(memoryContacts);
      if (!messagesContactsCache.isStale(key, DEFAULT_PORTAL_CACHE_TTL_MS)) {
        return;
      }

      void fetchAndCacheMessagesContacts(organizationId, schoolName, { refresh: true })
        .then((nextContacts) => {
          applyContactsData(nextContacts);
          setError(null);
        })
        .catch((loadError) => {
          reportError('school_admin_messages_contacts_load', loadError);
        });
      return;
    }

    if (contacts.length > 0) return;
    if (contactsPromiseRef.current) {
      await contactsPromiseRef.current;
      return;
    }

    const run = async () => {
      setLoadingContacts(true);
      try {
        const nextContacts = await fetchAndCacheMessagesContacts(organizationId, schoolName);
        applyContactsData(nextContacts);
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
  }, [applyContactsData, contacts.length, key, organizationId, reportError, schoolName]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const [resolved, contactsFromDisk] = await Promise.all([
        resolvePortalProviderInit(key, messagesInboxCache, () =>
          hydrateSchoolAdminMessagesInboxFromDisk(organizationId, schoolName),
        ),
        hydrateSchoolAdminMessagesContactsFromDisk(organizationId, schoolName),
      ]);
      if (cancelled) return;

      applyInboxData(resolved.data);
      applyContactsData(contactsFromDisk);
      setHasLoaded(resolved.hasLoaded);
      setIsLoading(resolved.isLoading);
      setError(null);

      const shouldPrefetchContacts =
        !messagesContactsCache.get(key)?.length ||
        messagesContactsCache.isStale(key, DEFAULT_PORTAL_CACHE_TTL_MS);

      if (shouldPrefetchContacts) {
        void prefetchSchoolAdminMessagesContacts(organizationId, schoolName).then(() => {
          if (!cancelled) {
            applyContactsData(messagesContactsCache.get(key));
          }
        });
      }

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
  }, [applyContactsData, applyInboxData, key, organizationId, reportError, schoolName]);

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
