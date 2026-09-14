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
  ORG_SUBMISSIONS_INITIAL_PAGE_SIZE,
  type AdminApplicationSubmission,
} from '@/lib/admissions/application-submissions';
import {
  createPortalCache,
  resolvePortalProviderInit,
} from '@/lib/portal-cache';
import {
  fetchSubmissionPageMeta,
  submissionsPageHasMore,
  type SubmissionPageMeta,
} from '@/lib/school-admin/submissions-page-meta';
import { getSupabaseClient } from '@/lib/supabase';
import { createSchoolAdminErrorReporter } from '@/lib/use-mobile-error-reporter';

export type SchoolAdminSubmissionsData = {
  submissions: AdminApplicationSubmission[];
  meta: SubmissionPageMeta | null;
  hasMore: boolean;
};

type SchoolAdminSubmissionsContextValue = {
  submissions: AdminApplicationSubmission[];
  meta: SubmissionPageMeta | null;
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  hasLoaded: boolean;
  refresh: (options?: { silent?: boolean }) => Promise<void>;
  loadMore: () => Promise<void>;
};

const SchoolAdminSubmissionsContext = createContext<SchoolAdminSubmissionsContextValue | null>(null);

const submissionsCache = createPortalCache<SchoolAdminSubmissionsData>('school_admin_submissions:v2:');

function cacheKey(organizationId: string): string {
  return organizationId;
}

async function fetchSubmissionsPage(
  organizationId: string,
  offset: number,
): Promise<AdminApplicationSubmission[]> {
  const supabase = getSupabaseClient();
  return listOrgApplicationSubmissions(supabase, organizationId, {
    limit: ORG_SUBMISSIONS_INITIAL_PAGE_SIZE,
    offset,
  });
}

async function fetchSubmissionsData(organizationId: string): Promise<SchoolAdminSubmissionsData> {
  const supabase = getSupabaseClient();
  const [meta, submissions] = await Promise.all([
    fetchSubmissionPageMeta(supabase, organizationId),
    fetchSubmissionsPage(organizationId, 0),
  ]);

  return {
    submissions,
    meta,
    hasMore: submissionsPageHasMore(submissions.length, ORG_SUBMISSIONS_INITIAL_PAGE_SIZE),
  };
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
  const reportError = useMemo(
    () => createSchoolAdminErrorReporter(organizationId),
    [organizationId],
  );

  const [submissions, setSubmissions] = useState<AdminApplicationSubmission[]>(
    cached?.submissions ?? [],
  );
  const [meta, setMeta] = useState<SubmissionPageMeta | null>(cached?.meta ?? null);
  const [hasMore, setHasMore] = useState(cached?.hasMore ?? false);
  const [isLoading, setIsLoading] = useState(!cached);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(Boolean(cached));
  const fetchPromiseRef = useRef<Promise<void> | null>(null);
  const loadMorePromiseRef = useRef<Promise<void> | null>(null);

  const applyData = useCallback((data: SchoolAdminSubmissionsData | null) => {
    setSubmissions(data?.submissions ?? []);
    setMeta(data?.meta ?? null);
    setHasMore(data?.hasMore ?? false);
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
          reportError('school_admin_submissions_load', loadError);
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
    [applyData, key, organizationId, reportError],
  );

  const refresh = useCallback(
    async (options?: { silent?: boolean }) => {
      await load({ refresh: true, silent: options?.silent });
    },
    [load],
  );

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || isLoading || isRefreshing) return;
    if (loadMorePromiseRef.current) {
      await loadMorePromiseRef.current;
      return;
    }

    const run = async () => {
      setIsLoadingMore(true);
      setError(null);

      try {
        const nextPage = await fetchSubmissionsPage(organizationId, submissions.length);
        setSubmissions((prev) => [...prev, ...nextPage]);
        setHasMore(
          submissionsPageHasMore(nextPage.length, ORG_SUBMISSIONS_INITIAL_PAGE_SIZE),
        );
      } catch (loadError) {
        reportError('school_admin_submissions_load_more', loadError);
        setError(loadError instanceof Error ? loadError.message : 'Failed to load more submissions.');
      } finally {
        setIsLoadingMore(false);
        loadMorePromiseRef.current = null;
      }
    };

    const promise = run();
    loadMorePromiseRef.current = promise;
    await promise;
  }, [hasMore, isLoading, isLoadingMore, isRefreshing, organizationId, reportError, submissions.length]);

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
          reportError('school_admin_submissions_load', loadError);
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
  }, [applyData, key, organizationId, reportError]);

  const value = useMemo(
    () => ({
      submissions,
      meta,
      isLoading,
      isRefreshing,
      isLoadingMore,
      hasMore,
      error,
      hasLoaded,
      refresh,
      loadMore,
    }),
    [
      error,
      hasLoaded,
      hasMore,
      isLoading,
      isLoadingMore,
      isRefreshing,
      loadMore,
      meta,
      refresh,
      submissions,
    ],
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
