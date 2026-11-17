import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

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

  /** Set once a load has already retried a 401 with a refreshed token. */
  const retriedAuthRef = useRef(false);

  const load = useCallback(async (options: { forceRefresh?: boolean } = {}) => {
    setIsLoading(true);
    setLoadError(null);
    setWebSource(null);
    try {
      const source = await withCommitteeWorkspaceLoadTimeout(
        getParentNewsletterDocumentWebViewSource(organizationId, editionId, options),
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
    retriedAuthRef.current = false;
    void load();
  }, [load]);

  /** Try again always mints a fresh token so it can't reuse a stale one. */
  const retry = useCallback(() => {
    retriedAuthRef.current = false;
    void load({ forceRefresh: true });
  }, [load]);

  /**
   * WebView HTTP failure. The cached token can expire while the app is in the
   * background, so the first 401 refreshes and reloads silently; anything else
   * (or a second 401) is reported and shows the error card.
   */
  const handleHttpError = useCallback(
    (statusCode: number) => {
      if (statusCode === 401 && !retriedAuthRef.current) {
        retriedAuthRef.current = true;
        void load({ forceRefresh: true });
        return;
      }
      reportError(
        'parent_newsletter_detail_http_error',
        new Error(`Newsletter request failed with HTTP ${statusCode}`),
        {
          entityType: 'newsletter_edition',
          entityId: editionId,
          metadata: { statusCode, retriedAuth: retriedAuthRef.current },
        },
      );
      setLoadError('This newsletter could not be loaded.');
    },
    [editionId, load, reportError],
  );

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
    handleHttpError,
    onBack,
  };
}

export type ParentNewsletterDetailController = ReturnType<
  typeof useParentNewsletterDetailController
>;
