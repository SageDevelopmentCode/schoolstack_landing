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
  fetchParentCalendarData,
  type ParentCalendarData,
} from '@/lib/parent/parent-portal-api';
import {
  createParentPortalCache,
  resolveParentPortalProviderInit,
} from '@/lib/parent/parent-portal-cache';

type ParentCalendarContextValue = {
  data: ParentCalendarData | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  hasLoaded: boolean;
  ensureLoaded: () => void;
  refresh: () => Promise<void>;
};

const ParentCalendarContext = createContext<ParentCalendarContextValue | null>(null);

const calendarCache = createParentPortalCache<ParentCalendarData>('parent_calendar:');

function cacheKey(organizationId: string, slug: string): string {
  return `${organizationId}:${slug}`;
}

function fetchAndCacheParentCalendar(
  organizationId: string,
  slug: string,
  options?: { refresh?: boolean },
): Promise<ParentCalendarData> {
  const key = cacheKey(organizationId, slug);
  return calendarCache.fetchAndCache(
    key,
    () => fetchParentCalendarData(organizationId, slug),
    options,
  );
}

export function prefetchParentCalendar(organizationId: string, slug: string): Promise<void> {
  const key = cacheKey(organizationId, slug);
  return calendarCache.prefetch(key, () => fetchParentCalendarData(organizationId, slug));
}

export async function hydrateParentCalendarFromDisk(
  organizationId: string,
  slug: string,
): Promise<ParentCalendarData | null> {
  return calendarCache.hydrateFromDisk(cacheKey(organizationId, slug));
}

type ParentCalendarProviderProps = {
  children: ReactNode;
  organizationId: string;
  slug: string;
};

export function ParentCalendarProvider({
  children,
  organizationId,
  slug,
}: ParentCalendarProviderProps) {
  const key = cacheKey(organizationId, slug);
  const cached = calendarCache.get(key);

  const [data, setData] = useState<ParentCalendarData | null>(cached);
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
        const hasCachedData = Boolean(calendarCache.get(key) ?? data);
        if (isRefresh) {
          setIsRefreshing(true);
        } else if (!hasCachedData) {
          setIsLoading(true);
        }
        setError(null);

        try {
          const nextData = await fetchAndCacheParentCalendar(organizationId, slug, {
            refresh: isRefresh,
          });
          setData(nextData);
          setHasLoaded(true);
        } catch (loadError) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load calendar.');
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
      const resolved = await resolveParentPortalProviderInit(key, calendarCache, () =>
        hydrateParentCalendarFromDisk(organizationId, slug),
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
        await fetchAndCacheParentCalendar(organizationId, slug);
        if (cancelled) return;

        setData(calendarCache.get(key));
        setHasLoaded(Boolean(calendarCache.get(key)));
        setError(null);
      } catch (loadError) {
        if (!cancelled && !calendarCache.get(key)) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load calendar.');
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
    <ParentCalendarContext.Provider value={value}>{children}</ParentCalendarContext.Provider>
  );
}

export function useParentCalendar(): ParentCalendarContextValue {
  const context = useContext(ParentCalendarContext);
  if (!context) {
    throw new Error('useParentCalendar must be used within ParentCalendarProvider');
  }
  return context;
}
