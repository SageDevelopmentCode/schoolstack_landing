import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { WebView, type WebViewProps } from 'react-native-webview';
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';

import { StoryButton } from '@/components/story/story-button';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import {
  getMobilePdfExternalOpenUrl,
  getMobilePdfWebViewSource,
  usesAndroidPdfJsHtml,
} from '@/lib/pdf/mobile-pdf-webview-source';

const LOAD_TIMEOUT_MS = 45_000;

type ParentEmbeddedPdfWebViewProps = {
  url: string;
  style?: StyleProp<ViewStyle>;
  scrollEnabled?: boolean;
  pointerEvents?: WebViewProps['pointerEvents'];
  startInLoadingState?: boolean;
};

export function ParentEmbeddedPdfWebView({
  url,
  style,
  scrollEnabled = true,
  pointerEvents,
  startInLoadingState = false,
}: ParentEmbeddedPdfWebViewProps) {
  const source = useMemo(() => getMobilePdfWebViewSource(url), [url]);
  const androidPdfJs = usesAndroidPdfJsHtml(url);
  const [phase, setPhase] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    setPhase('loading');
  }, [url]);

  useEffect(() => {
    if (phase !== 'loading') return;
    const timer = setTimeout(() => setPhase('error'), LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [phase, url]);

  const markReady = useCallback(() => {
    setPhase('ready');
  }, []);

  const markError = useCallback(() => {
    setPhase('error');
  }, []);

  const handleMessage = useCallback(
    (event: { nativeEvent: { data: string } }) => {
      const data = event.nativeEvent.data;
      if (data === 'pdf-loaded') {
        markReady();
      } else if (data === 'pdf-error') {
        markError();
      }
    },
    [markError, markReady],
  );

  const openExternally = useCallback(async () => {
    const openUrl = getMobilePdfExternalOpenUrl(url);
    if (openUrl.startsWith('data:')) {
      await Linking.openURL(openUrl);
      return;
    }
    await openBrowserAsync(openUrl, {
      presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
    });
  }, [url]);

  const handleShouldStartLoadWithRequest = useCallback(
    (request: { url: string }) => {
      if (Platform.OS !== 'android' || !androidPdfJs) {
        return true;
      }
      const allowed =
        request.url === 'about:blank' ||
        request.url.startsWith('https://localhost') ||
        request.url.includes('cdnjs.cloudflare.com');
      return allowed;
    },
    [androidPdfJs],
  );

  if (phase === 'error') {
    return (
      <View style={[styles.fallback, style]}>
        <Text style={styles.fallbackText}>This document could not be shown in the app.</Text>
        <StoryButton label="Open document" previewSafe onPress={() => void openExternally()} />
      </View>
    );
  }

  return (
    <View style={[styles.wrap, style]}>
      <WebView
        source={source}
        style={styles.webView}
        scrollEnabled={scrollEnabled}
        pointerEvents={pointerEvents}
        originWhitelist={['*']}
        mixedContentMode="always"
        setSupportMultipleWindows={false}
        allowsInlineMediaPlayback
        startInLoadingState={startInLoadingState}
        onMessage={androidPdfJs ? handleMessage : undefined}
        onLoadEnd={androidPdfJs ? undefined : markReady}
        onError={markError}
        onHttpError={markError}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
      />
      {phase === 'loading' ? (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator color="#64748B" />
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
