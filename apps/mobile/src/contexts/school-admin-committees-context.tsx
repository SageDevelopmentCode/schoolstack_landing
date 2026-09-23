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

import { fetchAdminCommitteeJoinRequests } from '@/lib/school-admin-api';
import { listCommittees, listCommitteeTemplates } from '@/lib/school-admin/committees/queries';
import { createSchoolAdminErrorReporter } from '@/lib/mobile-error-reporter';
import type { CommitteeListItem, CommitteeTemplate } from '@/lib/parent/parent-committees-types';
import { createPortalCache, resolvePortalProviderInit } from '@/lib/portal-cache';
import { getSupabaseClient } from '@/lib/supabase';

export type SchoolAdminCommitteesData = {
  committees: CommitteeListItem[];
  templates: CommitteeTemplate[];
  pendingRequestCount: number;
};

type SchoolAdminCommitteesContextValue = {
  committees: CommitteeListItem[];
  templates: CommitteeTemplate[];
  pendingRequestCount: number;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  hasLoaded: boolean;
  refresh: (options?: { silent?: boolean }) => Promise<void>;
};

const SchoolAdminCommitteesContext = createContext<SchoolAdminCommitteesContextValue | null>(null);

const committeesCache = createPortalCache<SchoolAdminCommitteesData>('school_admin_committees:');

function cacheKey(organizationId: string): string {
  return organizationId;
}

async function fetchCommitteesData(organizationId: string): Promise<SchoolAdminCommitteesData> {
  const supabase = getSupabaseClient();
  const [committees, templates] = await Promise.all([
    listCommittees(supabase, organizationId),
    listCommitteeTemplates(supabase, organizationId),
  ]);

  let pendingRequestCount = 0;
  try {
    const joinRequests = await fetchAdminCommitteeJoinRequests(organizationId, {
      status: 'pending',
    });
    pendingRequestCount = joinRequests.requests.length;
  } catch {
    // Join requests load independently in the list screen; don't fail the whole committees load.
  }

  return {
    committees,
    templates,
    pendingRequestCount,
  };
}

type SchoolAdminCommitteesProviderProps = {
  children: ReactNode;
  organizationId: string;
};

export function SchoolAdminCommitteesProvider({
  children,
  organizationId,
}: SchoolAdminCommitteesProviderProps) {
  const key = cacheKey(organizationId);
  const cached = committeesCache.get(key);

  const [committees, setCommittees] = useState(cached?.committees ?? []);
  const [templates, setTemplates] = useState(cached?.templates ?? []);
  const [pendingRequestCount, setPendingRequestCount] = useState(cached?.pendingRequestCount ?? 0);
  const [isLoading, setIsLoading] = useState(!cached);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(Boolean(cached));
  const fetchPromiseRef = useRef<Promise<void> | null>(null);
  const reportError = useMemo(
    () => createSchoolAdminErrorReporter(organizationId),
    [organizationId],
  );

  const applyData = useCallback((data: SchoolAdminCommitteesData | null | undefined) => {
    setCommittees(data?.committees ?? []);
    setTemplates(data?.templates ?? []);
    setPendingRequestCount(data?.pendingRequestCount ?? 0);
  }, []);

  const load = useCallback(
    async (options?: { silent?: boolean }) => {
      const isRefresh = options?.silent ?? false;
      if (fetchPromiseRef.current && !isRefresh) {
        await fetchPromiseRef.current;
        return;
      }

      const run = async () => {
        if (isRefresh) {
          setIsRefreshing(true);
        } else if (!committeesCache.get(key)) {
          setIsLoading(true);
        }
        setError(null);

        try {
          const nextData = await committeesCache.fetchAndCache(
            key,
            () => fetchCommitteesData(organizationId),
            { refresh: isRefresh },
          );
          applyData(nextData);
          setHasLoaded(true);
        } catch (loadError) {
          reportError('committees.load', loadError);
          setError(loadError instanceof Error ? loadError.message : 'Failed to load committees.');
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
    [applyData, key, organizationId, reportError],
  );

  const refresh = useCallback(async (options?: { silent?: boolean }) => {
    await load(options);
  }, [load]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const resolved = await resolvePortalProviderInit(key, committeesCache, async () =>
        committeesCache.get(key) ?? null,
      );
      if (cancelled) return;

      applyData(resolved.data);
      setHasLoaded(resolved.hasLoaded);
      setIsLoading(resolved.isLoading);
      setError(null);

      if (!resolved.shouldBackgroundRefresh) return;

      if (resolved.data) {
        setIsRefreshing(true);
      }

      try {
        const nextData = await committeesCache.fetchAndCache(key, () =>
          fetchCommitteesData(organizationId),
        );
        if (cancelled) return;
        applyData(nextData);
        setHasLoaded(true);
        setError(null);
      } catch (loadError) {
        reportError('committees.load', loadError);
        if (!cancelled && !committeesCache.get(key)) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load committees.');
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
  }, [applyData, key, organizationId, reportError]);

  const value = useMemo(
    (): SchoolAdminCommitteesContextValue => ({
      committees,
      templates,
      pendingRequestCount,
      isLoading,
      isRefreshing,
      error,
      hasLoaded,
      refresh,
    }),
    [
      committees,
      error,
      hasLoaded,
      isLoading,
      isRefreshing,
      pendingRequestCount,
      refresh,
      templates,
    ],
  );

  return (
    <SchoolAdminCommitteesContext.Provider value={value}>
      {children}
    </SchoolAdminCommitteesContext.Provider>
  );
}

export function useSchoolAdminCommittees(): SchoolAdminCommitteesContextValue {
  const context = useContext(SchoolAdminCommitteesContext);
  if (!context) {
    throw new Error('useSchoolAdminCommittees must be used within SchoolAdminCommitteesProvider');
  }
  return context;
}
