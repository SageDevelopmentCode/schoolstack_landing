import { useCallback, useEffect, useState } from 'react';

import { fetchSchoolPortalOptions } from '@/lib/auth/school-portal-options-api';
import {
  filterSchoolPortalOptionsForMobile,
  shouldShowMobilePortalSwitcher,
  type SchoolPortalOption,
} from '@/lib/auth/school-portal-options-types';

type CacheEntry = {
  options: SchoolPortalOption[];
};

const optionsCache = new Map<string, CacheEntry>();
const inflightRequests = new Map<string, Promise<SchoolPortalOption[]>>();

function cacheKey(organizationId: string, slug: string): string {
  return `${organizationId}:${slug}`;
}

export async function prefetchSchoolPortalOptions(
  organizationId: string,
  slug: string,
): Promise<SchoolPortalOption[]> {
  const key = cacheKey(organizationId, slug);
  const cached = optionsCache.get(key);
  if (cached) {
    return cached.options;
  }

  const existing = inflightRequests.get(key);
  if (existing) {
    return existing;
  }

  const request = fetchSchoolPortalOptions(organizationId, slug)
    .then((raw) => {
      const options = filterSchoolPortalOptionsForMobile(raw);
      optionsCache.set(key, { options });
      return options;
    })
    .finally(() => {
      inflightRequests.delete(key);
    });

  inflightRequests.set(key, request);
  return request;
}

export function invalidateSchoolPortalOptionsCache(organizationId: string, slug: string): void {
  optionsCache.delete(cacheKey(organizationId, slug));
}

type UseSchoolPortalOptionsArgs = {
  organizationId: string | null | undefined;
  slug: string | null | undefined;
  enabled?: boolean;
};

export function useSchoolPortalOptions({
  organizationId,
  slug,
  enabled = true,
}: UseSchoolPortalOptionsArgs) {
  const [options, setOptions] = useState<SchoolPortalOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const canLoad = Boolean(enabled && organizationId && slug);

  const load = useCallback(async () => {
    if (!organizationId || !slug) {
      setOptions([]);
      return;
    }

    const key = cacheKey(organizationId, slug);
    const cached = optionsCache.get(key);
    if (cached) {
      setOptions(cached.options);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const next = await prefetchSchoolPortalOptions(organizationId, slug);
      setOptions(next);
    } catch (err) {
      setOptions([]);
      setError(err instanceof Error ? err : new Error('Failed to load portal options.'));
    } finally {
      setLoading(false);
    }
  }, [organizationId, slug]);

  useEffect(() => {
    if (!canLoad) {
      setOptions([]);
      setLoading(false);
      return;
    }
    void load();
  }, [canLoad, load]);

  const showSwitcher = shouldShowMobilePortalSwitcher(options);

  return {
    options,
    loading: canLoad && loading && options.length === 0,
    error,
    showSwitcher,
    refetch: load,
  };
}
