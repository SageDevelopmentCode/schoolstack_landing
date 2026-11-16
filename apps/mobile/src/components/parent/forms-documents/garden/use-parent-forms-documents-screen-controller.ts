import { useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';

import { useParentFormsDocuments } from '@/contexts/parent-forms-documents-context';
import { goBackOrReplace } from '@/lib/navigation';
import { parentFormDetailRoute, parentTabRoute } from '@/lib/parent/parent-nav';

/**
 * Forms & documents list data + callbacks (no UI). Same context loading as the
 * Story screen; load failures are reported inside the context.
 */
export function useParentFormsDocumentsScreenController({ slug }: { slug: string }) {
  const router = useRouter();
  const { items, isLoading, isRefreshing, error, hasLoaded, ensureLoaded, refresh } =
    useParentFormsDocuments();

  useEffect(() => {
    ensureLoaded();
  }, [ensureLoaded]);

  const openForm = useCallback(
    (formId: string) => router.push(parentFormDetailRoute(slug, formId)),
    [router, slug],
  );

  const onBack = useCallback(() => {
    goBackOrReplace(router, parentTabRoute(slug, 'home'));
  }, [router, slug]);

  const retry = useCallback(() => {
    void refresh();
  }, [refresh]);

  return {
    slug,
    items,
    isInitialLoading: isLoading && !hasLoaded,
    isRefreshing,
    hasLoaded,
    error,
    refresh,
    retry,
    openForm,
    onBack,
  };
}

export type ParentFormsDocumentsScreenController = ReturnType<
  typeof useParentFormsDocumentsScreenController
>;
