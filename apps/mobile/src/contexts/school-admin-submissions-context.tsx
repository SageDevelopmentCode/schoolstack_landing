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

import {
  listOrgApplicationSubmissions,
  type AdminApplicationSubmission,
} from '@/lib/admissions/application-submissions';
import {
  createPortalCache,
  resolvePortalProviderInit,
} from '@/lib/portal-cache';
import { getSupabaseClient } from '@/lib/supabase';

export type SchoolAdminSubmissionsData = {
  submissions: AdminApplicationSubmission[];
};

type SchoolAdminSubmissionsContextValue = {
  submissions: AdminApplicationSubmission[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  hasLoaded: boolean;
  refresh: (options?: { silent?: boolean }) => Promise<void>;
};

const SchoolAdminSubmissionsContext = createContext<SchoolAdminSubmissionsContextValue | null>(null);

const submissionsCache = createPortalCache<SchoolAdminSubmissionsData>('school_admin_submissions:');

function cacheKey(organizationId: string): string {
  return organizationId;
}

async function fetchSubmissionsData(organizationId: string): Promise<SchoolAdminSubmissionsData> {
  const supabase = getSupabaseClient();
  const submissions = await listOrgApplicationSubmissions(supabase, organizationId);
  return { submissions };
}

function fetchAndCacheSubmissions(
  organizationId: string,
  options?: { refresh?: boolean },
): Promise<SchoolAdminSubmissionsData> {
  const key = cacheKey(organizationId);
  return submissionsCache.fetchAndCache(key, () => fetchSubmissionsData(organizationId), options);
}

export function prefetchSchoolAdminSubmissions(organizationId: string): Promise<void> {
  const key = cacheKey(organizationId);
  return submissionsCache.prefetch(key, () => fetchSubmissionsData(organizationId));
}

export async function hydrateSchoolAdminSubmissionsFromDisk(
  organizationId: string,
): Promise<SchoolAdminSubmissionsData | null> {
  return submissionsCache.hydrateFromDisk(cacheKey(organizationId));
}

type SchoolAdminSubmissionsProviderProps = {
  children: ReactNode;
  organizationId: string;
};

export function SchoolAdminSubmissionsProvider({
  children,
  organizationId,
}: SchoolAdminSubmissionsProviderProps) {
  const key = cacheKey(organizationId);
  const cached = submissionsCache.get(key);

  const [submissions, setSubmissions] = useState<AdminApplicationSubmission[]>(
    cached?.submissions ?? [],
  );
  const [isLoading, setIsLoading] = useState(!cached);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(Boolean(cached));
  const fetchPromiseRef = useRef<Promise<void> | null>(null);

  const applyData = useCallback((data: SchoolAdminSubmissionsData | null) => {
    setSubmissions(data?.submissions ?? []);
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
        const hasCachedData = Boolean(submissionsCache.get(key));
        if (isRefresh || silent) {
          if (!silent || hasCachedData) {
            setIsRefreshing(true);
          }
        } else if (!hasCachedData) {
          setIsLoading(true);
        }
        setError(null);

        try {
          const nextData = await fetchAndCacheSubmissions(organizationId, { refresh: isRefresh });
          applyData(nextData);
          setHasLoaded(true);
        } catch (loadError) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load submissions.');
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
    [applyData, key, organizationId],
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
      const resolved = await resolvePortalProviderInit(key, submissionsCache, () =>
        hydrateSchoolAdminSubmissionsFromDisk(organizationId),
      );
      if (cancelled) return;

      applyData(resolved.data);
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
        await fetchAndCacheSubmissions(organizationId);
        if (cancelled) return;

        applyData(submissionsCache.get(key));
        setHasLoaded(Boolean(submissionsCache.get(key)));
        setError(null);
      } catch (loadError) {
        if (!cancelled && !submissionsCache.get(key)) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load submissions.');
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
  }, [applyData, key, organizationId]);

  const value = useMemo(
    () => ({
      submissions,
      isLoading,
      isRefreshing,
      error,
      hasLoaded,
      refresh,
    }),
    [error, hasLoaded, isLoading, isRefreshing, refresh, submissions],
  );

  return (
    <SchoolAdminSubmissionsContext.Provider value={value}>
      {children}
    </SchoolAdminSubmissionsContext.Provider>
  );
}

export function useSchoolAdminSubmissions(): SchoolAdminSubmissionsContextValue {
  const context = useContext(SchoolAdminSubmissionsContext);
  if (!context) {
    throw new Error('useSchoolAdminSubmissions must be used within SchoolAdminSubmissionsProvider');
  }
  return context;
}
