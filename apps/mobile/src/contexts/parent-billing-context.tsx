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
  fetchParentBillingData,
  type ParentBillingData,
} from '@/lib/parent/parent-portal-api';
import {
  createParentPortalCache,
  resolveParentPortalProviderInit,
} from '@/lib/parent/parent-portal-cache';

type ParentBillingContextValue = {
  data: ParentBillingData | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  hasLoaded: boolean;
  ensureLoaded: () => void;
  refresh: () => Promise<void>;
};

const ParentBillingContext = createContext<ParentBillingContextValue | null>(null);

const billingCache = createParentPortalCache<ParentBillingData>('parent_billing:');

function cacheKey(organizationId: string, slug: string): string {
  return `${organizationId}:${slug}`;
}

function fetchAndCacheParentBilling(
  organizationId: string,
  slug: string,
  options?: { refresh?: boolean },
): Promise<ParentBillingData> {
  const key = cacheKey(organizationId, slug);
  return billingCache.fetchAndCache(
    key,
    () => fetchParentBillingData(organizationId, slug),
    options,
  );
}

export function prefetchParentBilling(organizationId: string, slug: string): Promise<void> {
  const key = cacheKey(organizationId, slug);
  return billingCache.prefetch(key, () => fetchParentBillingData(organizationId, slug));
}

export async function hydrateParentBillingFromDisk(
  organizationId: string,
  slug: string,
): Promise<ParentBillingData | null> {
  return billingCache.hydrateFromDisk(cacheKey(organizationId, slug));
}

type ParentBillingProviderProps = {
  children: ReactNode;
  organizationId: string;
  slug: string;
};

export function ParentBillingProvider({
  children,
  organizationId,
  slug,
}: ParentBillingProviderProps) {
  const key = cacheKey(organizationId, slug);
  const cached = billingCache.get(key);

  const [data, setData] = useState<ParentBillingData | null>(cached);
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
        const hasCachedData = Boolean(billingCache.get(key) ?? data);
        if (isRefresh) {
          setIsRefreshing(true);
        } else if (!hasCachedData) {
          setIsLoading(true);
        }
        setError(null);

        try {
          const nextData = await fetchAndCacheParentBilling(organizationId, slug, {
            refresh: isRefresh,
          });
          setData(nextData);
          setHasLoaded(true);
        } catch (loadError) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load billing.');
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
      const resolved = await resolveParentPortalProviderInit(key, billingCache, () =>
        hydrateParentBillingFromDisk(organizationId, slug),
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
        await fetchAndCacheParentBilling(organizationId, slug);
        if (cancelled) return;

        setData(billingCache.get(key));
        setHasLoaded(Boolean(billingCache.get(key)));
        setError(null);
      } catch (loadError) {
        if (!cancelled && !billingCache.get(key)) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load billing.');
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

  return (
    <ParentBillingContext.Provider value={value}>{children}</ParentBillingContext.Provider>
  );
}

export function useParentBilling(): ParentBillingContextValue {
  const context = useContext(ParentBillingContext);
  if (!context) {
    throw new Error('useParentBilling must be used within ParentBillingProvider');
  }
  return context;
}
