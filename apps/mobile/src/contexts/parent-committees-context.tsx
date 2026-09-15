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

import { createParentPortalErrorReporter } from '@/lib/mobile-error-reporter';
import type { ParentCommitteesData } from '@/lib/parent/parent-committees-types';
import {
  createParentPortalCache,
  resolveParentPortalProviderInit,
} from '@/lib/parent/parent-portal-cache';
import {
  fetchParentCommitteesBrowse,
  fetchParentCommitteesMine,
} from '@/lib/parent/parent-portal-api';

type ParentCommitteesContextValue = {
  browseCommittees: ParentCommitteesData['browseCommittees'];
  myCommittees: ParentCommitteesData['myCommittees'];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  hasLoaded: boolean;
  ensureLoaded: () => void;
  refresh: () => Promise<void>;
  getBrowseCommittee: (committeeId: string) => ParentCommitteesData['browseCommittees'][number] | null;
};

const ParentCommitteesContext = createContext<ParentCommitteesContextValue | null>(null);

const committeesCache = createParentPortalCache<ParentCommitteesData>('parent_committees:');

function cacheKey(organizationId: string, slug: string): string {
  return `${organizationId}:${slug}`;
}

async function fetchAndCacheParentCommittees(
  organizationId: string,
  slug: string,
  options?: { refresh?: boolean },
): Promise<ParentCommitteesData> {
  const key = cacheKey(organizationId, slug);
  return committeesCache.fetchAndCache(
    key,
    async () => {
      const [browseCommittees, myCommittees] = await Promise.all([
        fetchParentCommitteesBrowse(organizationId),
        fetchParentCommitteesMine(organizationId),
      ]);
      return { browseCommittees, myCommittees };
    },
    options,
  );
}

export function prefetchParentCommittees(organizationId: string, slug: string): Promise<void> {
  const key = cacheKey(organizationId, slug);
  return committeesCache.prefetch(key, () => fetchAndCacheParentCommittees(organizationId, slug));
}

export async function hydrateParentCommitteesFromDisk(
  organizationId: string,
  slug: string,
): Promise<ParentCommitteesData | null> {
  return committeesCache.hydrateFromDisk(cacheKey(organizationId, slug));
}

type ParentCommitteesProviderProps = {
  children: ReactNode;
  organizationId: string;
  slug: string;
};

export function ParentCommitteesProvider({
  children,
  organizationId,
  slug,
}: ParentCommitteesProviderProps) {
  const key = cacheKey(organizationId, slug);
  const cached = committeesCache.get(key);

  const [browseCommittees, setBrowseCommittees] = useState(
    cached?.browseCommittees ?? [],
  );
  const [myCommittees, setMyCommittees] = useState(cached?.myCommittees ?? []);
  const [isLoading, setIsLoading] = useState(!cached);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(Boolean(cached));
  const fetchPromiseRef = useRef<Promise<void> | null>(null);
  const reportError = useMemo(
    () => createParentPortalErrorReporter(organizationId),
    [organizationId],
  );

  const applyData = useCallback((data: ParentCommitteesData | null | undefined) => {
    setBrowseCommittees(data?.browseCommittees ?? []);
    setMyCommittees(data?.myCommittees ?? []);
  }, []);

  const load = useCallback(
    async (options?: { refresh?: boolean }) => {
      const isRefresh = options?.refresh ?? false;

      if (fetchPromiseRef.current && !isRefresh) {
        await fetchPromiseRef.current;
        return;
      }

      const run = async () => {
        const hasCachedData = Boolean(committeesCache.get(key));
        if (isRefresh) {
          setIsRefreshing(true);
        } else if (!hasCachedData) {
          setIsLoading(true);
        }
        setError(null);

        try {
          const nextData = await fetchAndCacheParentCommittees(organizationId, slug, {
            refresh: isRefresh,
          });
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
    [applyData, key, organizationId, reportError, slug],
  );

  const ensureLoaded = useCallback(() => {
    if (hasLoaded || fetchPromiseRef.current) return;
    void load();
  }, [hasLoaded, load]);

  const refresh = useCallback(async () => {
    await load({ refresh: true });
  }, [load]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const resolved = await resolveParentPortalProviderInit(key, committeesCache, () =>
        hydrateParentCommitteesFromDisk(organizationId, slug),
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
        await fetchAndCacheParentCommittees(organizationId, slug);
        if (cancelled) return;

        applyData(committeesCache.get(key));
        setHasLoaded(Boolean(committeesCache.get(key)));
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
  }, [applyData, key, organizationId, reportError, slug]);

  const getBrowseCommittee = useCallback(
    (committeeId: string) => browseCommittees.find((committee) => committee.id === committeeId) ?? null,
    [browseCommittees],
  );

  const value = useMemo(
    () => ({
      browseCommittees,
      myCommittees,
      isLoading,
      isRefreshing,
      error,
      hasLoaded,
      ensureLoaded,
      refresh,
      getBrowseCommittee,
    }),
    [
      browseCommittees,
      ensureLoaded,
      error,
      getBrowseCommittee,
      hasLoaded,
      isLoading,
      isRefreshing,
      myCommittees,
      refresh,
    ],
  );

  return (
    <ParentCommitteesContext.Provider value={value}>{children}</ParentCommitteesContext.Provider>
  );
}

export function useParentCommittees(): ParentCommitteesContextValue {
  const context = useContext(ParentCommitteesContext);
  if (!context) {
    throw new Error('useParentCommittees must be used within ParentCommitteesProvider');
  }
  return context;
}
