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
  fetchParentHomeData,
  type ParentHomeData,
} from '@/lib/parent/parent-portal-api';
import {
  DEFAULT_PARENT_PORTAL_CACHE_TTL_MS,
  createParentPortalCache,
  resolveParentPortalProviderInit,
} from '@/lib/parent/parent-portal-cache';

type ParentHomeContextValue = {
  data: ParentHomeData | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  hasLoaded: boolean;
  ensureLoaded: () => void;
  refresh: () => Promise<void>;
};

const ParentHomeContext = createContext<ParentHomeContextValue | null>(null);

const homeCache = createParentPortalCache<ParentHomeData>('parent_home:');

function cacheKey(organizationId: string, slug: string): string {
  return `${organizationId}:${slug}`;
}

function fetchAndCacheParentHome(
  organizationId: string,
  slug: string,
  options?: { refresh?: boolean },
): Promise<ParentHomeData> {
  const key = cacheKey(organizationId, slug);
  return homeCache.fetchAndCache(key, () => fetchParentHomeData(organizationId, slug), options);
}

export function prefetchParentHome(organizationId: string, slug: string): Promise<void> {
  const key = cacheKey(organizationId, slug);
  return homeCache.prefetch(key, () => fetchParentHomeData(organizationId, slug));
}

export async function hydrateParentHomeFromDisk(
  organizationId: string,
  slug: string,
): Promise<ParentHomeData | null> {
  return homeCache.hydrateFromDisk(cacheKey(organizationId, slug));
}

export async function clearPersistedParentHomeCache(): Promise<void> {
  homeCache.clearMemory();
}

type ParentHomeProviderProps = {
  children: ReactNode;
  organizationId: string;
  slug: string;
};

export function ParentHomeProvider({ children, organizationId, slug }: ParentHomeProviderProps) {
  const key = cacheKey(organizationId, slug);
  const cached = homeCache.get(key);

  const [data, setData] = useState<ParentHomeData | null>(cached);
  const [isLoading, setIsLoading] = useState(!cached);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(Boolean(cached));
  const fetchPromiseRef = useRef<Promise<void> | null>(null);

  const load = useCallback(
    async (options?: { refresh?: boolean }) => {
      const isRefresh = options?.refresh ?? false;

      if (fetchPromiseRef.current && !isRefresh) {
        await fetchPromiseRef.current;
        return;
      }

      const run = async () => {
        const hasCachedData = Boolean(homeCache.get(key) ?? data);
        if (isRefresh) {
          setIsRefreshing(true);
        } else if (!hasCachedData) {
          setIsLoading(true);
        }
        setError(null);

        try {
          const nextData = await fetchAndCacheParentHome(organizationId, slug, { refresh: isRefresh });
          setData(nextData);
          setHasLoaded(true);
        } catch (loadError) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load home.');
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
    [data, key, organizationId, slug],
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
      const resolved = await resolveParentPortalProviderInit(key, homeCache, () =>
        hydrateParentHomeFromDisk(organizationId, slug),
      );
      if (cancelled) return;

      setData(resolved.data);
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
        await fetchAndCacheParentHome(organizationId, slug);
        if (cancelled) return;

        setData(homeCache.get(key));
        setHasLoaded(Boolean(homeCache.get(key)));
        setError(null);
      } catch (loadError) {
        if (!cancelled && !homeCache.get(key)) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load home.');
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
  }, [key, organizationId, slug]);

  const value = useMemo(
    () => ({
      data,
      isLoading,
      isRefreshing,
      error,
      hasLoaded,
      ensureLoaded,
      refresh,
    }),
    [data, ensureLoaded, error, hasLoaded, isLoading, isRefreshing, refresh],
  );

  return <ParentHomeContext.Provider value={value}>{children}</ParentHomeContext.Provider>;
}

export function useParentHome(): ParentHomeContextValue {
  const context = useContext(ParentHomeContext);
  if (!context) {
    throw new Error('useParentHome must be used within ParentHomeProvider');
  }
  return context;
}
