import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { getParentNewsletterDocumentWebViewSource } from '@/lib/parent/parent-portal-api';
import {
  isCommitteeWorkspaceLoadTimeoutError,
  withCommitteeWorkspaceLoadTimeout,
} from '@/lib/school-admin/committees/committee-workspace-load';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

/**
 * Newsletter edition data + callbacks (no UI). Same timeout-wrapped request and
 * error reporting as the Story screen; `load()` doubles as Try again.
 */
export function useParentNewsletterDetailController({
  organizationId,
  editionId,
}: {
  organizationId: string;
  editionId: string;
}) {
  const router = useRouter();
  const { reportError } = useMobileErrorReporter(organizationId);

  const [webSource, setWebSource] = useState<{
    uri: string;
    headers: Record<string, string>;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    setWebSource(null);
    try {
      const source = await withCommitteeWorkspaceLoadTimeout(
        getParentNewsletterDocumentWebViewSource(organizationId, editionId),
      );
      setWebSource(source);
    } catch (err) {
      const timedOut = isCommitteeWorkspaceLoadTimeoutError(err);
      reportError(
        timedOut ? 'parent_newsletter_detail_load_timeout' : 'parent_newsletter_detail_load',
        err,
        timedOut ? { entityId: editionId, metadata: { editionId } } : undefined,
      );
      setLoadError(
        timedOut
          ? 'Loading this newsletter is taking longer than expected. Check your connection and try again.'
          : 'This newsletter could not be loaded.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [editionId, organizationId, reportError]);

  useEffect(() => {
    void load();
  }, [load]);

  const retry = useCallback(() => {
    void load();
  }, [load]);

  const onBack = useCallback(() => {
    router.back();
  }, [router]);

  return {
    editionId,
    webSource,
    isLoading,
    loadError,
    /** WebView callback failures set this so the screen swaps to the error card. */
    setLoadError,
    reportError,
    retry,
    onBack,
  };
}

export type ParentNewsletterDetailController = ReturnType<
  typeof useParentNewsletterDetailController
>;
