import AsyncStorage from '@react-native-async-storage/async-storage';
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

const DISK_CACHE_PREFIX = 'parent_home:';

const homeCache = new Map<string, ParentHomeData>();
const fetchPromises = new Map<string, Promise<ParentHomeData>>();

type DiskCacheEntry = {
  cachedAt: number;
  data: ParentHomeData;
};

function cacheKey(organizationId: string, slug: string): string {
  return `${organizationId}:${slug}`;
}

function diskCacheKey(key: string): string {
  return `${DISK_CACHE_PREFIX}${key}`;
}

async function readDiskCache(key: string): Promise<ParentHomeData | null> {
  try {
    const raw = await AsyncStorage.getItem(diskCacheKey(key));
    if (!raw) return null;

    const entry = JSON.parse(raw) as DiskCacheEntry;
    if (!entry?.data) return null;

    return entry.data;
  } catch {
    return null;
  }
}

async function writeDiskCache(key: string, data: ParentHomeData): Promise<void> {
  const entry: DiskCacheEntry = { cachedAt: Date.now(), data };
  await AsyncStorage.setItem(diskCacheKey(key), JSON.stringify(entry));
}

async function fetchAndCacheParentHome(
  organizationId: string,
  slug: string,
  options?: { refresh?: boolean },
): Promise<ParentHomeData> {
  const key = cacheKey(organizationId, slug);
  const isRefresh = options?.refresh ?? false;

  if (!isRefresh) {
    const memoryCached = homeCache.get(key);
    if (memoryCached) return memoryCached;

    const inFlight = fetchPromises.get(key);
    if (inFlight) return inFlight;
  }

  const promise = fetchParentHomeData(organizationId, slug)
    .then(async (data) => {
      homeCache.set(key, data);
      await writeDiskCache(key, data);
      fetchPromises.delete(key);
      return data;
    })
    .catch((error) => {
      fetchPromises.delete(key);
      throw error;
    });

  if (!isRefresh) {
    fetchPromises.set(key, promise);
  }

  return promise;
}

export function prefetchParentHome(organizationId: string, slug: string): Promise<void> {
  return fetchAndCacheParentHome(organizationId, slug).then(
    () => undefined,
    () => undefined,
  );
}

export async function hydrateParentHomeFromDisk(
  organizationId: string,
  slug: string,
): Promise<ParentHomeData | null> {
  const key = cacheKey(organizationId, slug);
  const memoryCached = homeCache.get(key);
  if (memoryCached) return memoryCached;

  const diskCached = await readDiskCache(key);
  if (diskCached) {
    homeCache.set(key, diskCached);
  }
  return diskCached;
}

export async function clearPersistedParentHomeCache(): Promise<void> {
  homeCache.clear();
  fetchPromises.clear();

  const keys = await AsyncStorage.getAllKeys();
  const parentHomeKeys = keys.filter((key) => key.startsWith(DISK_CACHE_PREFIX));
  if (parentHomeKeys.length > 0) {
    await AsyncStorage.multiRemove(parentHomeKeys);
  }
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
      const memoryCached = homeCache.get(key) ?? null;
      if (memoryCached) {
        setData(memoryCached);
        setHasLoaded(true);
        setIsLoading(false);
      } else {
        const diskCached = await hydrateParentHomeFromDisk(organizationId, slug);
        if (cancelled) return;

        if (diskCached) {
          setData(diskCached);
          setHasLoaded(true);
          setIsLoading(false);
        } else {
          setData(null);
          setHasLoaded(false);
          setIsLoading(true);
        }
      }

      setError(null);

      const hasCachedData = Boolean(homeCache.get(key));
      if (hasCachedData) {
        setIsRefreshing(true);
      }

      try {
        await fetchAndCacheParentHome(organizationId, slug);
        if (cancelled) return;

        const nextData = homeCache.get(key) ?? null;
        setData(nextData);
        setHasLoaded(Boolean(nextData));
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
