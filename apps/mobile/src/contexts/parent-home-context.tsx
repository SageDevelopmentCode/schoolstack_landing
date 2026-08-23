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

const homeCache = new Map<string, ParentHomeData>();

function cacheKey(organizationId: string, slug: string): string {
  return `${organizationId}:${slug}`;
}

type ParentHomeProviderProps = {
  children: ReactNode;
  organizationId: string;
  slug: string;
};

export function ParentHomeProvider({ children, organizationId, slug }: ParentHomeProviderProps) {
  const key = cacheKey(organizationId, slug);
  const cached = homeCache.get(key) ?? null;

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
        if (isRefresh) {
          setIsRefreshing(true);
        } else if (!homeCache.has(key)) {
          setIsLoading(true);
        }
        setError(null);

        try {
          const nextData = await fetchParentHomeData(organizationId, slug);
          homeCache.set(key, nextData);
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
    const cached = homeCache.get(key) ?? null;
    setData(cached);
    setHasLoaded(Boolean(cached));
    setIsLoading(!cached);
    setError(null);

    if (!cached) {
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

  return <ParentHomeContext.Provider value={value}>{children}</ParentHomeContext.Provider>;
}

export function useParentHome(): ParentHomeContextValue {
  const context = useContext(ParentHomeContext);
  if (!context) {
    throw new Error('useParentHome must be used within ParentHomeProvider');
  }
  return context;
}
