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

import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import { GOutlineButton, GToyButton } from '@/components/parent/garden/ui';
import { ParentEmbeddedPdfLoadingPlaceholder } from '@/components/parent/shared/parent-embedded-pdf-loading-placeholder';
import { openExternalUrlSafely } from '@/lib/open-external-url';
import { isAllowedPdfJsWebViewNavigation } from '@/lib/pdf/mobile-pdf-webview-navigation';
import {
  buildPdfViewerLoadMessage,
  getMobilePdfExternalOpenUrl,
  getMobilePdfWebViewSource,
  getPdfJsWebViewSource,
  parsePdfViewerMessage,
  shouldFallBackToNativePdfViewer,
  stripViewerFragment,
  usesPdfJsViewer,
} from '@/lib/pdf/mobile-pdf-webview-source';
import { usePdfViewerAssets } from '@/lib/pdf/use-pdf-viewer-assets';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

/** Time allowed for the viewer to show the first page (pdf.js renders later pages on demand). */
const LOAD_TIMEOUT_MS = 45_000;
/** A second process termination within this window of a silent reload is a crash loop. */
const TERMINATION_CRASH_LOOP_WINDOW_MS = 30_000;

type ParentEmbeddedPdfWebViewProps = {
  url: string;
  style?: StyleProp<ViewStyle>;
  scrollEnabled?: boolean;
  pointerEvents?: WebViewProps['pointerEvents'];
  startInLoadingState?: boolean;
  /** pdf.js only: render just page 1 (non-interactive inline preview). Ignored by the native fallback. */
  firstPageOnly?: boolean;
  /** Document title for the loading caption ("Opening {title}…"). */
  title?: string;
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
  title,
  reportEntityType,
  reportEntityId,
}: ParentEmbeddedPdfWebViewProps) {
  /**
   * iOS only: pdf.js could not run in this WebKit (old iOS), so this document uses the native
   * WKWebView viewer instead. Switched at most once per URL.
   */
  const [nativeFallback, setNativeFallback] = useState(false);
  const [fallbackUrl, setFallbackUrl] = useState(url);
  if (fallbackUrl !== url) {
    setFallbackUrl(url);
    setNativeFallback(false);
  }
  const pdfJs = usesPdfJsViewer(url) && !nativeFallback;
  const viewerKind = pdfJs ? `${Platform.OS}_pdfjs` : 'native_webview';
  const canFallBackToNative = Platform.OS === 'ios' && pdfJs;
  const documentUrl = useMemo(() => stripViewerFragment(url), [url]);
  const [reloadKey, setReloadKey] = useState(0);
  const { sources, assetsError, assetsFailed, assetsReady } = usePdfViewerAssets(
    pdfJs,
    reloadKey,
  );
  const { reportError } = useMobileErrorReporter();
  const webViewRef = useRef<WebView>(null);
  const [viewerReady, setViewerReady] = useState(false);

  const source = useMemo(() => {
    if (!pdfJs) {
      return getMobilePdfWebViewSource(url);
    }
    if (!sources) {
      return null;
    }
    return getPdfJsWebViewSource(sources);
  }, [pdfJs, sources, url]);

  const [phase, setPhase] = useState<'loading' | 'ready' | 'error'>('loading');

  // Diagnostics for operational reports (read from refs so callbacks stay stable).
  const loadStartedAtRef = useRef(0);
  const viewerReadyRef = useRef(false);
  const firstPageShownRef = useRef(false);
  const reportedKeysRef = useRef<Set<string>>(new Set());
  /** When the viewer was last remounted after its process was killed (ms). */
  const lastTerminationReloadAtRef = useRef<number | null>(null);

  useEffect(() => {
    lastTerminationReloadAtRef.current = null;
  }, [url]);

  useEffect(() => {
    setPhase('loading');
    setViewerReady(false);
    loadStartedAtRef.current = Date.now();
    viewerReadyRef.current = false;
    firstPageShownRef.current = false;
    reportedKeysRef.current = new Set();
  }, [url, reloadKey, nativeFallback]);

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
          viewer: viewerKind,
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
    [firstPageOnly, reportEntityId, reportEntityType, reportError, url, viewerKind],
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
    // `assetsReady` is diagnostic only; do not restart the timer when it flips. A native
    // fallback restarts it so the native viewer gets the full window too.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, url, reloadKey, nativeFallback, reportViewerFailure]);

  /** iOS: switch this document to the native WKWebView viewer (once) and report why. */
  const fallBackToNative = useCallback(
    (stage: string, err: unknown, extra?: Record<string, unknown>) => {
      reportViewerFailure(
        'parent_pdf_viewer_pdfjs_fallback',
        err instanceof Error ? err : new Error('pdf.js could not run; using the native viewer.'),
        { stage, fallback: 'native_webview', ...(extra ?? {}) },
      );
      setNativeFallback(true);
    },
    [reportViewerFailure],
  );

  useEffect(() => {
    if (!pdfJs || !assetsFailed) return;
    if (canFallBackToNative) {
      fallBackToNative(
        'assets',
        assetsError instanceof Error ? assetsError : new Error('Bundled pdf.js assets failed to load.'),
      );
      return;
    }
    reportViewerFailure(
      'parent_pdf_viewer_assets_failed',
      assetsError instanceof Error ? assetsError : new Error('Bundled pdf.js assets failed to load.'),
    );
  }, [
    assetsError,
    assetsFailed,
    canFallBackToNative,
    fallBackToNative,
    pdfJs,
    reportViewerFailure,
  ]);

  // pdf.js still renders without an image decoder, but JPEG 2000 / JBIG2 images come out blank.
  const imageDecodersError = pdfJs ? (sources?.imageDecodersError ?? null) : null;
  useEffect(() => {
    if (!imageDecodersError) return;
    reportViewerFailure(
      'parent_pdf_viewer_image_decoder_missing',
      imageDecodersError instanceof Error
        ? imageDecodersError
        : new Error('A bundled pdf.js image decoder failed to load.'),
      { stage: 'assets_image_decoders', fatal: false },
    );
  }, [imageDecodersError, reportViewerFailure]);

  const postLoadDocument = useCallback(() => {
    if (!pdfJs || !documentUrl) return;
    webViewRef.current?.postMessage(buildPdfViewerLoadMessage(documentUrl, { firstPageOnly }));
  }, [documentUrl, firstPageOnly, pdfJs]);

  useEffect(() => {
    if (!pdfJs || !viewerReady) return;
    postLoadDocument();
  }, [documentUrl, pdfJs, postLoadDocument, viewerReady, reloadKey]);

  /** Never downgrades an error: a failed native load fires `onError` and then `onLoadEnd`. */
  const markReady = useCallback(() => {
    setPhase((current) => {
      if (current === 'error') return current;
      firstPageShownRef.current = true;
      return 'ready';
    });
  }, []);

  const markError = useCallback(() => {
    setPhase('error');
  }, []);

  const handleMessage = useCallback(
    (event: { nativeEvent: { data: string } }) => {
      const message = parsePdfViewerMessage(event.nativeEvent.data);
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
          if (
            canFallBackToNative &&
            shouldFallBackToNativePdfViewer(message, {
              platform: Platform.OS,
              viewerReady: viewerReadyRef.current,
            })
          ) {
            fallBackToNative(message.stage, error, { fatal: message.fatal });
            return;
          }
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
    [canFallBackToNative, fallBackToNative, markError, markReady, reportViewerFailure],
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

  /**
   * iOS kills a backgrounded app's web content process routinely, so the first
   * termination remounts the viewer silently (Apple's documented recovery).
   * Only a second one soon after that reload is reported as a crash loop.
   */
  const handleRenderProcessGone = useCallback(
    (event: { nativeEvent?: object }) => {
      const now = Date.now();
      const lastReloadAt = lastTerminationReloadAtRef.current;
      if (lastReloadAt === null || now - lastReloadAt > TERMINATION_CRASH_LOOP_WINDOW_MS) {
        lastTerminationReloadAtRef.current = now;
        setReloadKey((key) => key + 1);
        return;
      }
      const didCrash = (event?.nativeEvent as { didCrash?: boolean } | undefined)?.didCrash;
      reportViewerFailure(
        'parent_pdf_viewer_render_process_gone',
        new Error('The PDF viewer process was terminated (likely out of memory).'),
        { stage: 'render_process_gone', didCrash, autoReloaded: true },
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
    lastTerminationReloadAtRef.current = null;
    setReloadKey((key) => key + 1);
  }, []);

  const handleShouldStartLoadWithRequest = useCallback(
    (request: { url: string }) => {
      if (!pdfJs) {
        return true;
      }
      return isAllowedPdfJsWebViewNavigation(request.url);
    },
    [pdfJs],
  );

  // On iOS an asset failure switches to the native viewer (effect above) instead of erroring.
  if (phase === 'error' || (pdfJs && assetsFailed && !canFallBackToNative)) {
    return (
      <View style={[styles.fallback, style]}>
        <Text style={styles.fallbackTitle}>This document could not be shown in the app.</Text>
        <Text style={styles.fallbackText}>You can open it in your browser, or try again.</Text>
        <View style={styles.fallbackActions}>
          <GToyButton
            label="Open document"
            icon="open-outline"
            accessibilityLabel={title ? `Open ${title}` : 'Open document'}
            onPress={() => void openExternally()}
          />
          <GOutlineButton label="Try again" icon="refresh" onPress={retry} />
        </View>
      </View>
    );
  }

  if (!source) {
    return (
      <View style={[styles.wrap, style]}>
        <ParentEmbeddedPdfLoadingPlaceholder title={title} />
      </View>
    );
  }

  return (
    <View style={[styles.wrap, style]}>
      <WebView
        key={`${reloadKey}:${viewerKind}`}
        ref={webViewRef}
        source={source}
        style={styles.webView}
        scrollEnabled={scrollEnabled}
        pointerEvents={pointerEvents}
        originWhitelist={['https://*', 'http://*', 'about:*', 'data:*']}
        mixedContentMode="always"
        setSupportMultipleWindows={false}
        allowsInlineMediaPlayback
        startInLoadingState={startInLoadingState}
        onMessage={pdfJs ? handleMessage : undefined}
        // `onLoad` fires only on success (`onLoadEnd` also fires after `onError`).
        onLoad={pdfJs ? undefined : markReady}
        onError={handleWebViewError}
        onHttpError={handleHttpError}
        onRenderProcessGone={handleRenderProcessGone}
        onContentProcessDidTerminate={handleRenderProcessGone}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
      />
      {phase === 'loading' || (pdfJs && !assetsReady) ? (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ParentEmbeddedPdfLoadingPlaceholder title={title} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: Garden.cream,
  },
  webView: {
    flex: 1,
    backgroundColor: Garden.cream,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 24,
    backgroundColor: Garden.cream,
  },
  fallbackTitle: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 16,
    lineHeight: 22,
    color: Garden.ink,
    textAlign: 'center',
  },
  fallbackText: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 14,
    lineHeight: 20,
    color: Garden.soft,
    textAlign: 'center',
  },
  fallbackActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 10,
  },
});
