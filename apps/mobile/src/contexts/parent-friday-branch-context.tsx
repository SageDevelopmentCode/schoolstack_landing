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
import type {
  ParentFridayBranchClassDetailBundle,
  ParentFridayBranchPageBundle,
} from '@/lib/parent/parent-friday-branch-types';
import { applyFridayBranchClassDetailToBundle } from '@/lib/parent/parent-friday-branch-utils';
import {
  createParentPortalCache,
  resolveParentPortalProviderInit,
} from '@/lib/parent/parent-portal-cache';
import { fetchParentFridayBranchSchedule } from '@/lib/parent/parent-portal-api';

type ParentFridayBranchContextValue = {
  bundle: ParentFridayBranchPageBundle | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  hasLoaded: boolean;
  ensureLoaded: () => void;
  refresh: () => Promise<void>;
  applyClassDetailUpdate: (classId: string, detail: ParentFridayBranchClassDetailBundle) => void;
  setBundle: (bundle: ParentFridayBranchPageBundle) => void;
};

const ParentFridayBranchContext = createContext<ParentFridayBranchContextValue | null>(null);

const fridayBranchCache = createParentPortalCache<ParentFridayBranchPageBundle>(
  'parent_friday_branch:v1:',
);

function cacheKey(organizationId: string, slug: string): string {
  return `${organizationId}:${slug}`;
}

async function fetchAndCacheParentFridayBranch(
  organizationId: string,
  slug: string,
  options?: { refresh?: boolean },
): Promise<ParentFridayBranchPageBundle> {
  const key = cacheKey(organizationId, slug);
  return fridayBranchCache.fetchAndCache(
    key,
    () => fetchParentFridayBranchSchedule(organizationId),
    options,
  );
}

export async function hydrateParentFridayBranchFromDisk(
  organizationId: string,
  slug: string,
): Promise<ParentFridayBranchPageBundle | null> {
  return fridayBranchCache.hydrateFromDisk(cacheKey(organizationId, slug));
}

type ParentFridayBranchProviderProps = {
  children: ReactNode;
  organizationId: string;
  slug: string;
  authReady?: boolean;
};

export function ParentFridayBranchProvider({
  children,
  organizationId,
  slug,
  authReady = true,
}: ParentFridayBranchProviderProps) {
  const key = cacheKey(organizationId, slug);
  const cached = fridayBranchCache.get(key);

  const [bundle, setBundleState] = useState<ParentFridayBranchPageBundle | null>(cached);
  const [isLoading, setIsLoading] = useState(!cached);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(Boolean(cached));
  const fetchPromiseRef = useRef<Promise<void> | null>(null);
  const reportError = useMemo(
    () => createParentPortalErrorReporter(organizationId),
    [organizationId],
  );

  const setBundle = useCallback((nextBundle: ParentFridayBranchPageBundle) => {
    setBundleState(nextBundle);
  }, []);

  const load = useCallback(
    async (options?: { refresh?: boolean }) => {
      const isRefresh = options?.refresh ?? false;

      if (fetchPromiseRef.current && !isRefresh) {
        await fetchPromiseRef.current;
        return;
      }

      const run = async () => {
        const hasCachedData = Boolean(fridayBranchCache.get(key));
        if (isRefresh) {
          setIsRefreshing(true);
        } else if (!hasCachedData) {
          setIsLoading(true);
        }
        setError(null);

        try {
          const nextBundle = await fetchAndCacheParentFridayBranch(organizationId, slug, {
            refresh: isRefresh,
          });
          setBundleState(nextBundle);
          setHasLoaded(true);
        } catch (loadError) {
          reportError('friday_branch.load', loadError);
          setError(
            loadError instanceof Error ? loadError.message : 'Failed to load Friday Branch.',
          );
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
    [key, organizationId, reportError, slug],
  );

  const ensureLoaded = useCallback(() => {
    if (hasLoaded || fetchPromiseRef.current) return;
    void load();
  }, [hasLoaded, load]);

  const refresh = useCallback(async () => {
    await load({ refresh: true });
  }, [load]);

  const applyClassDetailUpdate = useCallback(
    (classId: string, detail: ParentFridayBranchClassDetailBundle) => {
      setBundleState((current) => {
        if (!current) return current;
        return applyFridayBranchClassDetailToBundle(current, classId, detail);
      });
    },
    [],
  );

  useEffect(() => {
    if (!authReady) {
      return;
    }

    let cancelled = false;

    async function init() {
      const resolved = await resolveParentPortalProviderInit(key, fridayBranchCache, () =>
        hydrateParentFridayBranchFromDisk(organizationId, slug),
      );
      if (cancelled) return;

      if (resolved.data) {
        setBundleState(resolved.data);
      }
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
        await fetchAndCacheParentFridayBranch(organizationId, slug);
        if (cancelled) return;

        setBundleState(fridayBranchCache.get(key));
        setHasLoaded(Boolean(fridayBranchCache.get(key)));
        setError(null);
      } catch (loadError) {
        reportError('friday_branch.load', loadError);
        if (!cancelled && !fridayBranchCache.get(key)) {
          setError(
            loadError instanceof Error ? loadError.message : 'Failed to load Friday Branch.',
          );
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
  }, [authReady, key, organizationId, reportError, slug]);

  const value = useMemo(
    () => ({
      bundle,
      isLoading,
      isRefreshing,
      error,
      hasLoaded,
      ensureLoaded,
      refresh,
      applyClassDetailUpdate,
      setBundle,
    }),
    [
      applyClassDetailUpdate,
      bundle,
      ensureLoaded,
      error,
      hasLoaded,
      isLoading,
      isRefreshing,
      refresh,
      setBundle,
    ],
  );

  return (
    <ParentFridayBranchContext.Provider value={value}>
      {children}
    </ParentFridayBranchContext.Provider>
  );
}

export function useParentFridayBranch(): ParentFridayBranchContextValue {
  const context = useContext(ParentFridayBranchContext);
  if (!context) {
    throw new Error('useParentFridayBranch must be used within ParentFridayBranchProvider');
  }
  return context;
}
