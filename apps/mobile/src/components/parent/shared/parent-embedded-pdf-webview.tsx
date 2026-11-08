import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { WebView, type WebViewProps } from 'react-native-webview';

import { ParentEmbeddedPdfLoadingPlaceholder } from '@/components/parent/shared/parent-embedded-pdf-loading-placeholder';
import { StoryButton } from '@/components/story/story-button';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import { openExternalUrlSafely } from '@/lib/open-external-url';
import { isAllowedAndroidPdfWebViewNavigation } from '@/lib/pdf/mobile-pdf-webview-navigation';
import {
  buildAndroidPdfViewerLoadMessage,
  getAndroidPdfWebViewSource,
  getMobilePdfExternalOpenUrl,
  getMobilePdfWebViewSource,
  parseAndroidPdfViewerMessage,
  stripViewerFragment,
  usesAndroidPdfJsHtml,
} from '@/lib/pdf/mobile-pdf-webview-source';
import { useAndroidPdfViewerAssets } from '@/lib/pdf/use-android-pdf-viewer-assets';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

/** Time allowed for the viewer to show the first page (pdf.js renders later pages on demand). */
const LOAD_TIMEOUT_MS = 45_000;

type ParentEmbeddedPdfWebViewProps = {
  url: string;
  style?: StyleProp<ViewStyle>;
  scrollEnabled?: boolean;
  pointerEvents?: WebViewProps['pointerEvents'];
  startInLoadingState?: boolean;
  /** Android only: render just page 1 (non-interactive inline preview). */
  firstPageOnly?: boolean;
  /** Included in operational error reports (for example `curriculum` + its id). */
  reportEntityType?: string;
  reportEntityId?: string;
};

function describeUrlTarget(url: string): string {
  if (url.startsWith('data:')) return 'data';
  if (url.startsWith('file:')) return 'file';
  try {
    return new URL(url).host || 'unknown';
  } catch {
    return 'invalid_url';
  }
}

export function ParentEmbeddedPdfWebView({
  url,
  style,
  scrollEnabled = true,
  pointerEvents,
  startInLoadingState = false,
  firstPageOnly = false,
  reportEntityType,
  reportEntityId,
}: ParentEmbeddedPdfWebViewProps) {
  const androidPdfJs = usesAndroidPdfJsHtml(url);
  const documentUrl = useMemo(() => stripViewerFragment(url), [url]);
  const { assetUris, assetsError, assetsFailed, assetsReady } =
    useAndroidPdfViewerAssets(androidPdfJs);
  const { reportError } = useMobileErrorReporter();
  const webViewRef = useRef<WebView>(null);
  const [viewerReady, setViewerReady] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const source = useMemo(() => {
    if (!androidPdfJs) {
      return getMobilePdfWebViewSource(url);
    }
    if (!assetUris) {
      return null;
    }
    return getAndroidPdfWebViewSource({
      pdfModuleUri: assetUris.pdfModuleUri,
      workerModuleUri: assetUris.workerModuleUri,
    });
  }, [androidPdfJs, assetUris, url]);

  const [phase, setPhase] = useState<'loading' | 'ready' | 'error'>('loading');

  // Diagnostics for operational reports (read from refs so callbacks stay stable).
  const loadStartedAtRef = useRef(0);
  const viewerReadyRef = useRef(false);
  const firstPageShownRef = useRef(false);
  const reportedKeysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    setPhase('loading');
    setViewerReady(false);
    loadStartedAtRef.current = Date.now();
    viewerReadyRef.current = false;
    firstPageShownRef.current = false;
    reportedKeysRef.current = new Set();
  }, [url, reloadKey]);

  /** Reports each distinct failure once per document load so a bad file cannot flood Discord. */
  const reportViewerFailure = useCallback(
    (operation: string, err: unknown, extra?: Record<string, unknown>) => {
      const dedupeKey = `${operation}:${extra?.stage ?? ''}`;
      if (reportedKeysRef.current.has(dedupeKey)) return;
      reportedKeysRef.current.add(dedupeKey);

      reportError(operation, err, {
        entityType: reportEntityType,
        entityId: reportEntityId,
        metadata: {
          viewer: androidPdfJs ? 'android_pdfjs' : 'native_webview',
          platform: Platform.OS,
          osVersion: String(Platform.Version),
          urlTarget: describeUrlTarget(url),
          firstPageOnly,
          viewerReady: viewerReadyRef.current,
          firstPageShown: firstPageShownRef.current,
          elapsedMs: Date.now() - loadStartedAtRef.current,
          ...(extra ?? {}),
        },
      });
    },
    [androidPdfJs, firstPageOnly, reportEntityId, reportEntityType, reportError, url],
  );

  useEffect(() => {
    if (phase !== 'loading') return;
    const timer = setTimeout(() => {
      reportViewerFailure(
        'parent_pdf_viewer_load_timeout',
        new Error(
          `PDF viewer did not show the first page within ${LOAD_TIMEOUT_MS / 1000}s.`,
        ),
        { assetsReady, timeoutMs: LOAD_TIMEOUT_MS },
      );
      setPhase('error');
    }, LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
    // `assetsReady` is diagnostic only; do not restart the timer when it flips.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, url, reloadKey, reportViewerFailure]);

  useEffect(() => {
    if (!androidPdfJs || !assetsFailed) return;
    reportViewerFailure(
      'parent_pdf_viewer_assets_failed',
      assetsError instanceof Error ? assetsError : new Error('Bundled pdf.js assets failed to load.'),
    );
  }, [androidPdfJs, assetsError, assetsFailed, reportViewerFailure]);

  const postLoadDocument = useCallback(() => {
    if (!androidPdfJs || !documentUrl) return;
    webViewRef.current?.postMessage(
      buildAndroidPdfViewerLoadMessage(documentUrl, { firstPageOnly }),
    );
  }, [androidPdfJs, documentUrl, firstPageOnly]);

  useEffect(() => {
    if (!androidPdfJs || !viewerReady) return;
    postLoadDocument();
  }, [androidPdfJs, documentUrl, postLoadDocument, viewerReady, reloadKey]);

  const markReady = useCallback(() => {
    firstPageShownRef.current = true;
    setPhase('ready');
  }, []);

  const markError = useCallback(() => {
    setPhase('error');
  }, []);

  const handleMessage = useCallback(
    (event: { nativeEvent: { data: string } }) => {
      const message = parseAndroidPdfViewerMessage(event.nativeEvent.data);
      switch (message.type) {
        case 'ready':
          viewerReadyRef.current = true;
          setViewerReady(true);
          return;
        case 'loaded':
          markReady();
          return;
        case 'error': {
          const error = new Error(`${message.name}: ${message.message}`);
          reportViewerFailure(
            message.fatal ? 'parent_pdf_viewer_error' : 'parent_pdf_viewer_non_fatal_error',
            error,
            { stage: message.stage, fatal: message.fatal },
          );
          if (message.fatal) {
            markError();
          }
          return;
        }
        default:
          return;
      }
    },
    [markError, markReady, reportViewerFailure],
  );

  const handleWebViewError = useCallback(
    (event: { nativeEvent: { description?: string; code?: number; domain?: string } }) => {
      const { description, code, domain } = event.nativeEvent;
      reportViewerFailure(
        'parent_pdf_viewer_webview_error',
        new Error(description?.trim() || 'WebView failed to load the document.'),
        { stage: 'webview_error', code, domain },
      );
      markError();
    },
    [markError, reportViewerFailure],
  );

  const handleHttpError = useCallback(
    (event: { nativeEvent: { statusCode?: number; description?: string; url?: string } }) => {
      const { statusCode, description } = event.nativeEvent;
      reportViewerFailure(
        'parent_pdf_viewer_http_error',
        new Error(`PDF request failed with HTTP ${statusCode ?? 'unknown'}`),
        { stage: 'http_error', statusCode, description },
      );
      markError();
    },
    [markError, reportViewerFailure],
  );

  const handleRenderProcessGone = useCallback(
    (event: { nativeEvent?: object }) => {
      const didCrash = (event?.nativeEvent as { didCrash?: boolean } | undefined)?.didCrash;
      reportViewerFailure(
        'parent_pdf_viewer_render_process_gone',
        new Error('The PDF viewer process was terminated (likely out of memory).'),
        { stage: 'render_process_gone', didCrash },
      );
      markError();
    },
    [markError, reportViewerFailure],
  );

  const openExternally = useCallback(async () => {
    const openUrl = getMobilePdfExternalOpenUrl(url);
    await openExternalUrlSafely(openUrl, reportError, {
      operation: 'parent_pdf_viewer_open_external',
      entityType: reportEntityType,
      entityId: reportEntityId,
      errorTitle: 'Could not open document',
      errorMessage: 'Please check your connection and try again.',
    });
  }, [reportEntityId, reportEntityType, reportError, url]);

  const retry = useCallback(() => {
    setReloadKey((key) => key + 1);
  }, []);

  const bundledAssetUris = useMemo(
    () => (assetUris ? [assetUris.pdfModuleUri, assetUris.workerModuleUri] : []),
    [assetUris],
  );

  const handleShouldStartLoadWithRequest = useCallback(
    (request: { url: string }) => {
      if (Platform.OS !== 'android' || !androidPdfJs) {
        return true;
      }
      return isAllowedAndroidPdfWebViewNavigation(request.url, { bundledAssetUris });
    },
    [androidPdfJs, bundledAssetUris],
  );

  if (phase === 'error' || (androidPdfJs && assetsFailed)) {
    return (
      <View style={[styles.fallback, style]}>
        <Text style={styles.fallbackText}>This document could not be shown in the app.</Text>
        <StoryButton label="Open document" previewSafe onPress={() => void openExternally()} />
        <StoryButton label="Try again" variant="outline" previewSafe onPress={retry} />
      </View>
    );
  }

  if (!source) {
    return (
      <View style={[styles.wrap, style]}>
        <ParentEmbeddedPdfLoadingPlaceholder />
      </View>
    );
  }

  return (
    <View style={[styles.wrap, style]}>
      <WebView
        key={reloadKey}
        ref={webViewRef}
        source={source}
        style={styles.webView}
        scrollEnabled={scrollEnabled}
        pointerEvents={pointerEvents}
        originWhitelist={['https://*', 'http://*', 'file://*', 'about:*', 'data:*']}
        mixedContentMode="always"
        allowFileAccess
        allowUniversalAccessFromFileURLs={androidPdfJs}
        setSupportMultipleWindows={false}
        allowsInlineMediaPlayback
        startInLoadingState={startInLoadingState}
        onMessage={androidPdfJs ? handleMessage : undefined}
        onLoadEnd={androidPdfJs ? undefined : markReady}
        onError={handleWebViewError}
        onHttpError={handleHttpError}
        onRenderProcessGone={handleRenderProcessGone}
        onContentProcessDidTerminate={handleRenderProcessGone}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
      />
      {phase === 'loading' || (androidPdfJs && !assetsReady) ? (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ParentEmbeddedPdfLoadingPlaceholder style={StyleSheet.absoluteFill} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
  },
  webView: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(248, 250, 252, 0.85)',
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
    backgroundColor: '#F8FAFC',
  },
  fallbackText: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: '#64748B',
    textAlign: 'center',
  },
});
