import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
<<<<<<< Updated upstream
import { AppState, Platform } from 'react-native';
=======
import { Platform } from 'react-native';
>>>>>>> Stashed changes

import { useWebViewTerminationRecovery } from '@/hooks/use-webview-termination-recovery';
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
  /** Bumped to remount (and so reload) the WebView after its process is killed. */
  const [webViewKey, setWebViewKey] = useState(0);
  const { shouldReloadAfterTermination, resetTerminationRecovery } =
    useWebViewTerminationRecovery();

  /** Bumped to remount the WebView after iOS/Android kills its content process. */
  const [webViewKey, setWebViewKey] = useState(0);
  /** Content-process terminations seen for the current load. */
  const terminationsRef = useRef(0);
  /** True once the WebView finished loading since the last (re)mount. */
  const loadedRef = useRef(false);
  /** Set by `load()` before the WebView mounts; used for report diagnostics. */
  const loadStartedAtRef = useRef(0);

  const load = useCallback(async (options: { forceRefresh?: boolean } = {}) => {
<<<<<<< Updated upstream
    terminationsRef.current = 0;
    loadedRef.current = false;
    loadStartedAtRef.current = Date.now();
=======
    resetTerminationRecovery();
>>>>>>> Stashed changes
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
  }, [editionId, organizationId, reportError, resetTerminationRecovery]);

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

<<<<<<< Updated upstream
  const handleWebViewLoadEnd = useCallback(() => {
    loadedRef.current = true;
  }, []);

  /**
   * The OS killed the WebView's content process. iOS does this routinely while
   * the app is backgrounded or under memory pressure, so the first time (and
   * once more if the page loaded fine in between) we remount silently. Only a
   * repeat before the page loads, or a third kill, is reported as a failure.
   */
  const handleProcessTerminated = useCallback(
    (source: 'ios_terminate' | 'android_gone', didCrash?: boolean) => {
      terminationsRef.current += 1;
      const terminations = terminationsRef.current;
      const canRecover = terminations === 1 || (terminations === 2 && loadedRef.current);
      if (canRecover) {
        loadedRef.current = false;
=======
  /**
   * The WebView's web content process went away. iOS kills it routinely while
   * the app is in the background, so we remount the WebView silently (Apple's
   * documented recovery). Only a second termination soon after that reload is a
   * real crash loop, which is reported and shows the error card.
   */
  const handleProcessTerminated = useCallback(
    (event?: { nativeEvent?: { didCrash?: boolean } }) => {
      if (shouldReloadAfterTermination()) {
>>>>>>> Stashed changes
        setWebViewKey((key) => key + 1);
        return;
      }
      reportError(
        'parent_newsletter_detail_render_process_gone',
        new Error('The newsletter viewer process was terminated.'),
        {
          entityType: 'newsletter_edition',
          entityId: editionId,
          metadata: {
<<<<<<< Updated upstream
            source,
            platform: Platform.OS,
            didCrash,
            terminations,
            recoveries: terminations - 1,
            loadedBeforeTermination: loadedRef.current,
            appState: AppState.currentState,
            elapsedMs: Date.now() - loadStartedAtRef.current,
=======
            autoReloaded: true,
            platform: Platform.OS,
            didCrash: event?.nativeEvent?.didCrash,
>>>>>>> Stashed changes
          },
        },
      );
      setLoadError('This newsletter could not be loaded.');
    },
<<<<<<< Updated upstream
    [editionId, reportError],
=======
    [editionId, reportError, shouldReloadAfterTermination],
>>>>>>> Stashed changes
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
    webViewKey,
<<<<<<< Updated upstream
    handleWebViewLoadEnd,
=======
>>>>>>> Stashed changes
    handleProcessTerminated,
    onBack,
  };
}

export type ParentNewsletterDetailController = ReturnType<
  typeof useParentNewsletterDetailController
>;
