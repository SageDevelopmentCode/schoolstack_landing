import AsyncStorage from '@react-native-async-storage/async-storage';

export const DEFAULT_PARENT_PORTAL_CACHE_TTL_MS = 2 * 60 * 1000;

type DiskCacheEntry<T> = {
  cachedAt: number;
  data: T;
};

type MemoryCacheEntry<T> = {
  cachedAt: number;
  data: T;
};

const memoryClearHandlers = new Set<() => void>();

export function isStale(cachedAt: number | undefined, ttlMs: number): boolean {
  if (cachedAt === undefined) return true;
  return Date.now() - cachedAt > ttlMs;
}

export function registerParentPortalMemoryClear(handler: () => void): void {
  memoryClearHandlers.add(handler);
}

export function unregisterParentPortalMemoryClear(handler: () => void): void {
  memoryClearHandlers.delete(handler);
}

export async function clearAllPersistedParentPortalCaches(): Promise<void> {
  for (const handler of memoryClearHandlers) {
    handler();
  }

  const keys = await AsyncStorage.getAllKeys();
  const parentKeys = keys.filter((key) => key.startsWith('parent_'));
  if (parentKeys.length > 0) {
    await AsyncStorage.multiRemove(parentKeys);
  }
}

export type ParentPortalCache<T> = {
  get: (key: string) => T | null;
  getCachedAt: (key: string) => number | undefined;
  has: (key: string) => boolean;
  isStale: (key: string, ttlMs?: number) => boolean;
  hydrateFromDisk: (key: string) => Promise<T | null>;
  fetchAndCache: (
    key: string,
    fetcher: () => Promise<T>,
    options?: { refresh?: boolean },
  ) => Promise<T>;
  prefetch: (key: string, fetcher: () => Promise<T>) => Promise<void>;
  clearMemory: () => void;
};

export function createParentPortalCache<T>(diskCachePrefix: string): ParentPortalCache<T> {
  const memoryCache = new Map<string, MemoryCacheEntry<T>>();
  const fetchPromises = new Map<string, Promise<T>>();

  function diskKey(key: string): string {
    return `${diskCachePrefix}${key}`;
  }

  function setMemory(key: string, data: T, cachedAt = Date.now()): void {
    memoryCache.set(key, { data, cachedAt });
  }

  async function readDisk(key: string): Promise<MemoryCacheEntry<T> | null> {
    try {
      const raw = await AsyncStorage.getItem(diskKey(key));
      if (!raw) return null;

      const entry = JSON.parse(raw) as DiskCacheEntry<T>;
      if (!entry?.data) return null;

      return { data: entry.data, cachedAt: entry.cachedAt };
    } catch {
      return null;
    }
  }

  async function writeDisk(key: string, data: T, cachedAt: number): Promise<void> {
    const entry: DiskCacheEntry<T> = { cachedAt, data };
    await AsyncStorage.setItem(diskKey(key), JSON.stringify(entry));
  }

  const clearMemory = () => {
    memoryCache.clear();
    fetchPromises.clear();
  };

  registerParentPortalMemoryClear(clearMemory);

  return {
    get(key: string): T | null {
      return memoryCache.get(key)?.data ?? null;
    },

    getCachedAt(key: string): number | undefined {
      return memoryCache.get(key)?.cachedAt;
    },

    has(key: string): boolean {
      return memoryCache.has(key);
    },

    isStale(key: string, ttlMs = DEFAULT_PARENT_PORTAL_CACHE_TTL_MS): boolean {
      return isStale(memoryCache.get(key)?.cachedAt, ttlMs);
    },

    async hydrateFromDisk(key: string): Promise<T | null> {
      const memoryCached = memoryCache.get(key);
      if (memoryCached) return memoryCached.data;

      const diskCached = await readDisk(key);
      if (diskCached) {
        memoryCache.set(key, diskCached);
      }
      return diskCached?.data ?? null;
    },

    async fetchAndCache(
      key: string,
      fetcher: () => Promise<T>,
      options?: { refresh?: boolean },
    ): Promise<T> {
      const isRefresh = options?.refresh ?? false;

      if (!isRefresh) {
        const memoryCached = memoryCache.get(key);
        if (memoryCached) return memoryCached.data;

        const inFlight = fetchPromises.get(key);
        if (inFlight) return inFlight;
      }

      const promise = fetcher()
        .then(async (data) => {
          const cachedAt = Date.now();
          setMemory(key, data, cachedAt);
          await writeDisk(key, data, cachedAt);
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
    },

    prefetch(key: string, fetcher: () => Promise<T>): Promise<void> {
      return this.fetchAndCache(key, fetcher).then(
        () => undefined,
        () => undefined,
      );
    },

    clearMemory,
  };
}

export type ParentPortalProviderInitResult<T> = {
  data: T | null;
  hasLoaded: boolean;
  isLoading: boolean;
  shouldBackgroundRefresh: boolean;
};

export async function resolveParentPortalProviderInit<T>(
  key: string,
  cache: ParentPortalCache<T>,
  hydrateFromDisk: () => Promise<T | null>,
  ttlMs = DEFAULT_PARENT_PORTAL_CACHE_TTL_MS,
): Promise<ParentPortalProviderInitResult<T>> {
  const memoryCached = cache.get(key);
  if (memoryCached) {
    return {
      data: memoryCached,
      hasLoaded: true,
      isLoading: false,
      shouldBackgroundRefresh: cache.isStale(key, ttlMs),
    };
  }

  const diskCached = await hydrateFromDisk();
  if (diskCached) {
    return {
      data: diskCached,
      hasLoaded: true,
      isLoading: false,
      shouldBackgroundRefresh: cache.isStale(key, ttlMs),
    };
  }

  return {
    data: null,
    hasLoaded: false,
    isLoading: true,
    shouldBackgroundRefresh: true,
  };
}
