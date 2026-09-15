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
  ClassroomSignupResponse,
  ParentClassroomSignupListItem,
  ParentClassroomSignupsPageBundle,
  ParentClassroomSignupStudentOption,
} from '@/lib/parent/parent-classroom-signups-types';
import { classifyParentClassroomSignupListItem } from '@/lib/parent/parent-classroom-signups-utils';
import {
  createParentPortalCache,
  resolveParentPortalProviderInit,
} from '@/lib/parent/parent-portal-cache';
import { fetchParentClassroomSignups } from '@/lib/parent/parent-portal-api';

type ParentClassroomSignupsContextValue = {
  items: ParentClassroomSignupListItem[];
  responsesBySignupId: Record<string, ClassroomSignupResponse[]>;
  studentOptions: ParentClassroomSignupStudentOption[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  hasLoaded: boolean;
  ensureLoaded: () => void;
  refresh: () => Promise<void>;
  applySubmittedResponse: (
    signupId: string,
    response: ClassroomSignupResponse,
    allResponses: ClassroomSignupResponse[],
  ) => void;
  applyWithdrawnResponse: (
    signupId: string,
    familyId: string,
    allResponses: ClassroomSignupResponse[],
  ) => void;
};

const ParentClassroomSignupsContext = createContext<ParentClassroomSignupsContextValue | null>(
  null,
);

const signupsCache = createParentPortalCache<ParentClassroomSignupsPageBundle>(
  'parent_classroom_signups:',
);

function cacheKey(organizationId: string, slug: string): string {
  return `${organizationId}:${slug}`;
}

async function fetchAndCacheParentClassroomSignups(
  organizationId: string,
  slug: string,
  options?: { refresh?: boolean },
): Promise<ParentClassroomSignupsPageBundle> {
  const key = cacheKey(organizationId, slug);
  return signupsCache.fetchAndCache(
    key,
    () => fetchParentClassroomSignups(organizationId),
    options,
  );
}

export function prefetchParentClassroomSignups(
  organizationId: string,
  slug: string,
): Promise<void> {
  const key = cacheKey(organizationId, slug);
  return signupsCache.prefetch(key, () =>
    fetchAndCacheParentClassroomSignups(organizationId, slug),
  );
}

export async function hydrateParentClassroomSignupsFromDisk(
  organizationId: string,
  slug: string,
): Promise<ParentClassroomSignupsPageBundle | null> {
  return signupsCache.hydrateFromDisk(cacheKey(organizationId, slug));
}

type ParentClassroomSignupsProviderProps = {
  children: ReactNode;
  organizationId: string;
  slug: string;
};

export function ParentClassroomSignupsProvider({
  children,
  organizationId,
  slug,
}: ParentClassroomSignupsProviderProps) {
  const key = cacheKey(organizationId, slug);
  const cached = signupsCache.get(key);

  const [items, setItems] = useState(cached?.items ?? []);
  const [responsesBySignupId, setResponsesBySignupId] = useState(
    cached?.responsesBySignupId ?? {},
  );
  const [studentOptions, setStudentOptions] = useState(cached?.studentOptions ?? []);
  const [isLoading, setIsLoading] = useState(!cached);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(Boolean(cached));
  const fetchPromiseRef = useRef<Promise<void> | null>(null);
  const reportError = useMemo(
    () => createParentPortalErrorReporter(organizationId),
    [organizationId],
  );

  const applyData = useCallback((data: ParentClassroomSignupsPageBundle | null | undefined) => {
    setItems(data?.items ?? []);
    setResponsesBySignupId(data?.responsesBySignupId ?? {});
    setStudentOptions(data?.studentOptions ?? []);
  }, []);

  const load = useCallback(
    async (options?: { refresh?: boolean }) => {
      const isRefresh = options?.refresh ?? false;

      if (fetchPromiseRef.current && !isRefresh) {
        await fetchPromiseRef.current;
        return;
      }

      const run = async () => {
        const hasCachedData = Boolean(signupsCache.get(key));
        if (isRefresh) {
          setIsRefreshing(true);
        } else if (!hasCachedData) {
          setIsLoading(true);
        }
        setError(null);

        try {
          const nextData = await fetchAndCacheParentClassroomSignups(organizationId, slug, {
            refresh: isRefresh,
          });
          applyData(nextData);
          setHasLoaded(true);
        } catch (loadError) {
          reportError('classroom_signups.load', loadError);
          setError(
            loadError instanceof Error ? loadError.message : 'Failed to load classroom signups.',
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
    [applyData, key, organizationId, reportError, slug],
  );

  const ensureLoaded = useCallback(() => {
    if (hasLoaded || fetchPromiseRef.current) return;
    void load();
  }, [hasLoaded, load]);

  const refresh = useCallback(async () => {
    await load({ refresh: true });
  }, [load]);

  const applySubmittedResponse = useCallback(
    (signupId: string, response: ClassroomSignupResponse, allResponses: ClassroomSignupResponse[]) => {
      setResponsesBySignupId((current) => ({
        ...current,
        [signupId]: allResponses,
      }));

      setItems((current) => {
        const existing = current.find((item) => item.signup.id === signupId);
        if (!existing) return current;
        const nextItem = classifyParentClassroomSignupListItem(existing.signup, response);
        if (!nextItem) {
          return current.filter((item) => item.signup.id !== signupId);
        }
        return current.map((item) => (item.signup.id === signupId ? nextItem : item));
      });
    },
    [],
  );

  const applyWithdrawnResponse = useCallback(
    (signupId: string, familyId: string, allResponses: ClassroomSignupResponse[]) => {
      setResponsesBySignupId((current) => ({
        ...current,
        [signupId]: allResponses,
      }));

      setItems((current) => {
        const existing = current.find((item) => item.signup.id === signupId);
        if (!existing) return current;
        const nextItem = classifyParentClassroomSignupListItem(existing.signup, null);
        if (!nextItem) {
          return current.filter((item) => item.signup.id !== signupId);
        }
        return current.map((item) => (item.signup.id === signupId ? nextItem : item));
      });
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const resolved = await resolveParentPortalProviderInit(key, signupsCache, () =>
        hydrateParentClassroomSignupsFromDisk(organizationId, slug),
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
        await fetchAndCacheParentClassroomSignups(organizationId, slug);
        if (cancelled) return;

        applyData(signupsCache.get(key));
        setHasLoaded(Boolean(signupsCache.get(key)));
        setError(null);
      } catch (loadError) {
        reportError('classroom_signups.load', loadError);
        if (!cancelled && !signupsCache.get(key)) {
          setError(
            loadError instanceof Error ? loadError.message : 'Failed to load classroom signups.',
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
  }, [applyData, key, organizationId, reportError, slug]);

  const value = useMemo(
    () => ({
      items,
      responsesBySignupId,
      studentOptions,
      isLoading,
      isRefreshing,
      error,
      hasLoaded,
      ensureLoaded,
      refresh,
      applySubmittedResponse,
      applyWithdrawnResponse,
    }),
    [
      applySubmittedResponse,
      applyWithdrawnResponse,
      ensureLoaded,
      error,
      hasLoaded,
      isLoading,
      isRefreshing,
      items,
      refresh,
      responsesBySignupId,
      studentOptions,
    ],
  );

  return (
    <ParentClassroomSignupsContext.Provider value={value}>
      {children}
    </ParentClassroomSignupsContext.Provider>
  );
}

export function useParentClassroomSignups(): ParentClassroomSignupsContextValue {
  const context = useContext(ParentClassroomSignupsContext);
  if (!context) {
    throw new Error('useParentClassroomSignups must be used within ParentClassroomSignupsProvider');
  }
  return context;
}
