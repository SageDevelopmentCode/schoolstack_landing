import { type Href, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import type { ParentNewsletterListItem } from '@/lib/parent/parent-newsletters-types';
import { goBackOrReplace } from '@/lib/navigation';
import {
  parentNewsletterEditionRoute,
  parentProgramBasePath,
  parentProgramMoreRoute,
  parentTabRoute,
} from '@/lib/parent/parent-nav';
import { fetchParentNewslettersList } from '@/lib/parent/parent-portal-api';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

export function resolveEditionRoute(slug: string, editionId: string, programSlug?: string): Href {
  if (programSlug) {
    return `${parentProgramMoreRoute(slug, programSlug, 'newsletters')}/${encodeURIComponent(editionId)}` as Href;
  }
  return parentNewsletterEditionRoute(slug, editionId);
}

/**
 * Newsletters list data + callbacks (no UI). Same request and error reporting
 * (`parent_newsletters_load`) as the Story screen; edition routes still honour
 * `programSlug`.
 */
export function useParentNewslettersScreenController({
  slug,
  organizationId,
  programSlug,
}: {
  slug: string;
  organizationId: string;
  programSlug?: string;
}) {
  const router = useRouter();
  const { reportError } = useMobileErrorReporter(organizationId);

  const [editions, setEditions] = useState<ParentNewsletterListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const load = useCallback(
    async (mode: 'initial' | 'refresh') => {
      if (mode === 'initial') setIsLoading(true);
      else setIsRefreshing(true);
      setError(null);
      try {
        const bundle = await fetchParentNewslettersList(organizationId);
        setEditions(bundle.editions);
        setHasLoaded(true);
      } catch (err) {
        reportError('parent_newsletters_load', err);
        setError('We could not load newsletters right now.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [organizationId, reportError],
  );

  useEffect(() => {
    void load('initial');
  }, [load]);

  const refresh = useCallback(() => load('refresh'), [load]);
  const retry = useCallback(() => {
    void load('initial');
  }, [load]);

  const openEdition = useCallback(
    (editionId: string) => {
      router.push(resolveEditionRoute(slug, editionId, programSlug));
    },
    [programSlug, router, slug],
  );

  const onBack = useCallback(() => {
    goBackOrReplace(
      router,
      programSlug ? (parentProgramBasePath(slug, programSlug) as Href) : parentTabRoute(slug, 'home'),
    );
  }, [programSlug, router, slug]);

  return {
    editions,
    isInitialLoading: isLoading && !hasLoaded,
    hasLoaded,
    isRefreshing,
    error,
    refresh,
    retry,
    openEdition,
    onBack,
  };
}

export type ParentNewslettersScreenController = ReturnType<
  typeof useParentNewslettersScreenController
>;
