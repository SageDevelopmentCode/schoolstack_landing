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

const billingCache = new Map<string, ParentBillingData>();

function cacheKey(organizationId: string, slug: string): string {
  return `${organizationId}:${slug}`;
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
  const cached = billingCache.get(key) ?? null;

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
        if (isRefresh) {
          setIsRefreshing(true);
        } else if (!billingCache.has(key)) {
          setIsLoading(true);
        }
        setError(null);

        try {
          const nextData = await fetchParentBillingData(organizationId, slug);
          billingCache.set(key, nextData);
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
    [key, organizationId, slug],
  );

  const ensureLoaded = useCallback(() => {
    if (hasLoaded || fetchPromiseRef.current) return;
    void load();
  }, [hasLoaded, load]);

  const refresh = useCallback(async () => {
    await load({ refresh: true });
  }, [load]);

  useEffect(() => {
    const nextCached = billingCache.get(key) ?? null;
    setData(nextCached);
    setHasLoaded(Boolean(nextCached));
    setIsLoading(!nextCached);
    setError(null);

    if (!nextCached) {
      void load();
    }
  }, [key, load]);

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
