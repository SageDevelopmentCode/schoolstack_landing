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

import type { ParentFormDetail } from '@/lib/parent/parent-forms-documents-types';
import { patchParentHomeAfterFormSigned } from '@/lib/parent/parent-forms-documents-utils';
import {
  fetchParentProgramHomeData,
  normalizeParentProgramHomeData,
  type ParentProgramHomeData,
} from '@/lib/parent/parent-portal-api';
import {
  createParentPortalCache,
  resolveParentPortalProviderInit,
} from '@/lib/parent/parent-portal-cache';
import { createParentPortalErrorReporter } from '@/lib/mobile-error-reporter';

type ParentProgramHomeContextValue = {
  data: ParentProgramHomeData | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  hasLoaded: boolean;
  ensureLoaded: () => void;
  refresh: () => Promise<void>;
  applySignedForm: (detail: ParentFormDetail) => void;
};

const ParentProgramHomeContext = createContext<ParentProgramHomeContextValue | null>(null);

const programHomeCache = createParentPortalCache<ParentProgramHomeData>('parent_program_home:');

function cacheKey(organizationId: string, slug: string, programSlug: string): string {
  return `${organizationId}:${slug}:p:${programSlug}`;
}

function fetchAndCacheParentProgramHome(
  organizationId: string,
  slug: string,
  programSlug: string,
  options?: { refresh?: boolean },
): Promise<ParentProgramHomeData> {
  const key = cacheKey(organizationId, slug, programSlug);
  return programHomeCache.fetchAndCache(
    key,
    () => fetchParentProgramHomeData(organizationId, slug, programSlug),
    options,
  );
}

export async function hydrateParentProgramHomeFromDisk(
  organizationId: string,
  slug: string,
  programSlug: string,
): Promise<ParentProgramHomeData | null> {
  const data = await programHomeCache.hydrateFromDisk(cacheKey(organizationId, slug, programSlug));
  return data ? normalizeParentProgramHomeData(data) : null;
}

type ParentProgramHomeProviderProps = {
  children: ReactNode;
  organizationId: string;
  slug: string;
  programSlug: string;
  authReady?: boolean;
};

export function ParentProgramHomeProvider({
  children,
  organizationId,
  slug,
  programSlug,
  authReady = true,
}: ParentProgramHomeProviderProps) {
  const key = cacheKey(organizationId, slug, programSlug);
  const cached = programHomeCache.get(key);
  const normalizedCached = cached ? normalizeParentProgramHomeData(cached) : null;

  const [data, setData] = useState<ParentProgramHomeData | null>(normalizedCached);
  const [isLoading, setIsLoading] = useState(!normalizedCached);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(Boolean(normalizedCached));
  const fetchPromiseRef = useRef<Promise<void> | null>(null);
  const reportError = useMemo(
    () => createParentPortalErrorReporter(organizationId),
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
        const hasCachedData = Boolean(programHomeCache.get(key) ?? data);
        if (isRefresh) {
          setIsRefreshing(true);
        } else if (!hasCachedData) {
          setIsLoading(true);
        }
        setError(null);

        try {
          const nextData = await fetchAndCacheParentProgramHome(organizationId, slug, programSlug, {
            refresh: isRefresh,
          });
          setData(normalizeParentProgramHomeData(nextData));
          setHasLoaded(true);
        } catch (loadError) {
          reportError('parent_program_home_load', loadError);
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
    [data, key, organizationId, programSlug, reportError, slug],
  );

  const ensureLoaded = useCallback(() => {
    if (hasLoaded || fetchPromiseRef.current) return;
    void load();
  }, [hasLoaded, load]);

  const refresh = useCallback(async () => {
    await load({ refresh: true });
  }, [load]);

  const applySignedForm = useCallback((detail: ParentFormDetail) => {
    setData((current) => {
      if (!current) return current;
      const patched = patchParentHomeAfterFormSigned(current, detail);
      return { ...current, ...patched };
    });
  }, []);

  useEffect(() => {
    if (!authReady) {
      return;
    }

    let cancelled = false;

    async function init() {
      const resolved = await resolveParentPortalProviderInit(key, programHomeCache, () =>
        hydrateParentProgramHomeFromDisk(organizationId, slug, programSlug),
      );
      if (cancelled) return;

      setData(resolved.data ? normalizeParentProgramHomeData(resolved.data) : null);
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
        await fetchAndCacheParentProgramHome(organizationId, slug, programSlug);
        if (cancelled) return;

        const refreshed = programHomeCache.get(key);
        setData(refreshed ? normalizeParentProgramHomeData(refreshed) : null);
        setHasLoaded(Boolean(refreshed));
        setError(null);
      } catch (loadError) {
        reportError('parent_program_home_load', loadError);
        if (!cancelled && !programHomeCache.get(key)) {
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
  }, [authReady, key, organizationId, programSlug, reportError, slug]);

  const value = useMemo(
    () => ({
      data,
      isLoading,
      isRefreshing,
      error,
      hasLoaded,
      ensureLoaded,
      refresh,
      applySignedForm,
    }),
    [applySignedForm, data, ensureLoaded, error, hasLoaded, isLoading, isRefreshing, refresh],
  );

  return (
    <ParentProgramHomeContext.Provider value={value}>{children}</ParentProgramHomeContext.Provider>
  );
}

export function useParentProgramHome(): ParentProgramHomeContextValue {
  const context = useContext(ParentProgramHomeContext);
  if (!context) {
    throw new Error('useParentProgramHome must be used within ParentProgramHomeProvider');
  }
  return context;
}
