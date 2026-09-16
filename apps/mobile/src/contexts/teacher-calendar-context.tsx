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

import { useTeacherHome } from '@/contexts/teacher-home-context';
import { createTeacherPortalErrorReporter } from '@/lib/mobile-error-reporter';
import { isTeacherFeatureEnabled } from '@/lib/teacher/teacher-features';
import {
  fetchTeacherCalendarData,
  type TeacherCalendarData,
} from '@/lib/teacher/teacher-portal-api';
import {
  createTeacherPortalCache,
  resolveTeacherPortalProviderInit,
} from '@/lib/teacher/teacher-portal-cache';

type TeacherCalendarContextValue = {
  data: TeacherCalendarData | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  hasLoaded: boolean;
  ensureLoaded: () => void;
  refresh: () => Promise<void>;
};

const TeacherCalendarContext = createContext<TeacherCalendarContextValue | null>(null);

const calendarCache = createTeacherPortalCache<TeacherCalendarData>('teacher_calendar:');

function cacheKey(organizationId: string, slug: string): string {
  return `${organizationId}:${slug}`;
}

function fetchAndCacheTeacherCalendar(
  organizationId: string,
  slug: string,
  options?: { refresh?: boolean },
): Promise<TeacherCalendarData> {
  const key = cacheKey(organizationId, slug);
  return calendarCache.fetchAndCache(
    key,
    () => fetchTeacherCalendarData(organizationId, slug),
    options,
  );
}

export function prefetchTeacherCalendar(organizationId: string, slug: string): Promise<void> {
  const key = cacheKey(organizationId, slug);
  return calendarCache.prefetch(key, () => fetchTeacherCalendarData(organizationId, slug));
}

export async function hydrateTeacherCalendarFromDisk(
  organizationId: string,
  slug: string,
): Promise<TeacherCalendarData | null> {
  return calendarCache.hydrateFromDisk(cacheKey(organizationId, slug));
}

function settleDisabledCalendar(
  setData: (data: TeacherCalendarData | null) => void,
  setHasLoaded: (hasLoaded: boolean) => void,
  setIsLoading: (isLoading: boolean) => void,
  setIsRefreshing: (isRefreshing: boolean) => void,
  setError: (error: string | null) => void,
): void {
  setData(null);
  setHasLoaded(true);
  setIsLoading(false);
  setIsRefreshing(false);
  setError(null);
}

type TeacherCalendarProviderProps = {
  children: ReactNode;
  organizationId: string;
  slug: string;
};

export function TeacherCalendarProvider({
  children,
  organizationId,
  slug,
}: TeacherCalendarProviderProps) {
  const key = cacheKey(organizationId, slug);
  const cached = calendarCache.get(key);
  const { data: homeData, hasLoaded: homeHasLoaded } = useTeacherHome();
  const calendarEnabled = isTeacherFeatureEnabled(homeData?.features, 'calendar');

  const [data, setData] = useState<TeacherCalendarData | null>(cached);
  const [isLoading, setIsLoading] = useState(!cached);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(Boolean(cached));
  const fetchPromiseRef = useRef<Promise<void> | null>(null);
  const reportError = useMemo(
    () => createTeacherPortalErrorReporter(organizationId),
    [organizationId],
  );

  const load = useCallback(
    async (options?: { refresh?: boolean }) => {
      if (!homeHasLoaded) {
        return;
      }

      if (!calendarEnabled) {
        settleDisabledCalendar(setData, setHasLoaded, setIsLoading, setIsRefreshing, setError);
        return;
      }

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
          const nextData = await fetchAndCacheTeacherCalendar(organizationId, slug, {
            refresh: isRefresh,
          });
          setData(nextData);
          setHasLoaded(true);
        } catch (loadError) {
          reportError('teacher_calendar_load', loadError);
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
    [calendarEnabled, data, homeHasLoaded, key, organizationId, reportError, slug],
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
      const resolved = await resolveTeacherPortalProviderInit(key, calendarCache, () =>
        hydrateTeacherCalendarFromDisk(organizationId, slug),
      );
      if (cancelled) return;

      setData(resolved.data);
      setHasLoaded(resolved.hasLoaded);
      setIsLoading(resolved.isLoading);
      setError(null);

      if (!homeHasLoaded) {
        return;
      }

      if (!calendarEnabled) {
        settleDisabledCalendar(setData, setHasLoaded, setIsLoading, setIsRefreshing, setError);
        return;
      }

      if (!resolved.shouldBackgroundRefresh) {
        return;
      }

      if (resolved.data) {
        setIsRefreshing(true);
      }

      try {
        await fetchAndCacheTeacherCalendar(organizationId, slug);
        if (cancelled) return;

        setData(calendarCache.get(key));
        setHasLoaded(Boolean(calendarCache.get(key)));
        setError(null);
      } catch (loadError) {
        reportError('teacher_calendar_load', loadError);
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
  }, [calendarEnabled, homeHasLoaded, key, organizationId, reportError, slug]);

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
    <TeacherCalendarContext.Provider value={value}>{children}</TeacherCalendarContext.Provider>
  );
}

export function useTeacherCalendar(): TeacherCalendarContextValue {
  const context = useContext(TeacherCalendarContext);
  if (!context) {
    throw new Error('useTeacherCalendar must be used within TeacherCalendarProvider');
  }
  return context;
}
