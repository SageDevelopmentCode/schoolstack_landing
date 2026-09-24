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

import { createTeacherPortalErrorReporter } from '@/lib/mobile-error-reporter';
import {
  fetchTeacherHomeData,
  type TeacherHomeData,
} from '@/lib/teacher/teacher-portal-api';
import {
  createTeacherPortalCache,
  resolveTeacherPortalProviderInit,
} from '@/lib/teacher/teacher-portal-cache';

type TeacherHomeContextValue = {
  data: TeacherHomeData | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  hasLoaded: boolean;
  ensureLoaded: () => void;
  refresh: () => Promise<void>;
  updateStudentHealthFlag: (studentId: string, hasStandingHealthItems: boolean) => void;
};

const TeacherHomeContext = createContext<TeacherHomeContextValue | null>(null);

const homeCache = createTeacherPortalCache<TeacherHomeData>('teacher_home:');

function cacheKey(organizationId: string, slug: string): string {
  return `${organizationId}:${slug}`;
}

function fetchAndCacheTeacherHome(
  organizationId: string,
  slug: string,
  options?: { refresh?: boolean },
): Promise<TeacherHomeData> {
  const key = cacheKey(organizationId, slug);
  return homeCache.fetchAndCache(key, () => fetchTeacherHomeData(organizationId, slug), options);
}

export function prefetchTeacherHome(organizationId: string, slug: string): Promise<void> {
  const key = cacheKey(organizationId, slug);
  return homeCache.prefetch(key, () => fetchTeacherHomeData(organizationId, slug));
}

export async function hydrateTeacherHomeFromDisk(
  organizationId: string,
  slug: string,
): Promise<TeacherHomeData | null> {
  return homeCache.hydrateFromDisk(cacheKey(organizationId, slug));
}

type TeacherHomeProviderProps = {
  children: ReactNode;
  organizationId: string;
  slug: string;
  authReady?: boolean;
};

export function TeacherHomeProvider({
  children,
  organizationId,
  slug,
  authReady = true,
}: TeacherHomeProviderProps) {
  const key = cacheKey(organizationId, slug);
  const cached = homeCache.get(key);

  const [data, setData] = useState<TeacherHomeData | null>(cached);
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
          const nextData = await fetchAndCacheTeacherHome(organizationId, slug, {
            refresh: isRefresh,
          });
          setData(nextData);
          setHasLoaded(true);
        } catch (loadError) {
          reportError('teacher_home_load', loadError);
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
    [data, key, organizationId, reportError, slug],
  );

  const ensureLoaded = useCallback(() => {
    if (hasLoaded || fetchPromiseRef.current) return;
    void load();
  }, [hasLoaded, load]);

  const refresh = useCallback(async () => {
    await load({ refresh: true });
  }, [load]);

  const updateStudentHealthFlag = useCallback(
    (studentId: string, hasStandingHealthItems: boolean) => {
      setData((previous) => {
        if (!previous) return previous;
        return {
          ...previous,
          summary: {
            ...previous.summary,
            assignedStudents: previous.summary.assignedStudents.map((student) =>
              student.id === studentId
                ? { ...student, hasStandingHealthItems }
                : student,
            ),
          },
        };
      });
    },
    [key],
  );

  useEffect(() => {
    if (!authReady) {
      return;
    }

    let cancelled = false;

    async function init() {
      const resolved = await resolveTeacherPortalProviderInit(key, homeCache, () =>
        hydrateTeacherHomeFromDisk(organizationId, slug),
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
        await fetchAndCacheTeacherHome(organizationId, slug);
        if (cancelled) return;

        setData(homeCache.get(key));
        setHasLoaded(Boolean(homeCache.get(key)));
        setError(null);
      } catch (loadError) {
        reportError('teacher_home_load', loadError);
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
  }, [authReady, key, organizationId, reportError, slug]);

  const value = useMemo(
    () => ({
      data,
      isLoading,
      isRefreshing,
      error,
      hasLoaded,
      ensureLoaded,
      refresh,
      updateStudentHealthFlag,
    }),
    [
      data,
      ensureLoaded,
      error,
      hasLoaded,
      isLoading,
      isRefreshing,
      refresh,
      updateStudentHealthFlag,
    ],
  );

  return <TeacherHomeContext.Provider value={value}>{children}</TeacherHomeContext.Provider>;
}

export function useTeacherHome(): TeacherHomeContextValue {
  const context = useContext(TeacherHomeContext);
  if (!context) {
    throw new Error('useTeacherHome must be used within TeacherHomeProvider');
  }
  return context;
}
