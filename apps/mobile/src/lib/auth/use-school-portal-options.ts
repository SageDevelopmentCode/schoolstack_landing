import { useCallback, useEffect, useRef, useState } from 'react';

import { useAuth } from '@/contexts/auth-context';
import {
  clearSchoolPortalOptionsCache,
  invalidateSchoolPortalOptionsCache,
  prefetchSchoolPortalOptions,
  readCachedSchoolPortalOptions,
} from '@/lib/auth/school-portal-options-cache';
import {
  shouldShowMobilePortalSwitcher,
  type SchoolPortalOption,
} from '@/lib/auth/school-portal-options-types';

export {
  clearSchoolPortalOptionsCache,
  invalidateSchoolPortalOptionsCache,
  prefetchSchoolPortalOptions,
};

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
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [options, setOptions] = useState<SchoolPortalOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const requestIdRef = useRef(0);

  const canLoad = Boolean(enabled && organizationId && slug && userId);

  const load = useCallback(async () => {
    if (!organizationId || !slug || !userId) {
      setOptions([]);
      return;
    }

    const requestId = ++requestIdRef.current;
    const cached = readCachedSchoolPortalOptions(userId, organizationId, slug);
    if (cached) {
      setOptions(cached);
      setError(null);
      setLoading(false);
      return;
    }

    setOptions([]);
    setLoading(true);
    setError(null);
    try {
      await prefetchSchoolPortalOptions(organizationId, slug);
      if (requestId !== requestIdRef.current) {
        return;
      }
      setOptions(readCachedSchoolPortalOptions(userId, organizationId, slug) ?? []);
    } catch (err) {
      if (requestId !== requestIdRef.current) {
        return;
      }
      setOptions([]);
      setError(err instanceof Error ? err : new Error('Failed to load portal options.'));
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [organizationId, slug, userId]);

  useEffect(() => {
    if (!canLoad) {
      requestIdRef.current += 1;
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
