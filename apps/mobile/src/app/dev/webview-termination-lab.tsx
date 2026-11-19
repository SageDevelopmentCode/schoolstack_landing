// THROWAWAY: manual check for WebView process-termination recovery. Delete after use.
import { Redirect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { ParentNewsletterDetailGardenScreen } from '@/components/parent/newsletters/garden/parent-newsletter-detail-garden-screen';
import type { ParentNewsletterDetailController } from '@/components/parent/newsletters/garden/use-parent-newsletter-detail-controller';
import { ParentEmbeddedPdfWebView } from '@/components/parent/shared/parent-embedded-pdf-webview';
import { useWebViewTerminationRecovery } from '@/hooks/use-webview-termination-recovery';
import type { MobileErrorReporter } from '@/lib/use-mobile-error-reporter';

const SITE = process.env.EXPO_PUBLIC_SITE_URL ?? 'http://127.0.0.1:3000';
const PDF_URL = `${SITE}/images/demo/riveroakacademy/ColorbyNumberMultiplicationandDivisionRainforestThemeWorkheetsFree-1.pdf`;

export default function WebViewTerminationLab() {
  const [mode, setMode] = useState<'newsletter' | 'pdf'>('newsletter');
  const [webViewKey, setWebViewKey] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reports, setReports] = useState<string[]>([]);
  const { shouldReloadAfterTermination, resetTerminationRecovery } =
    useWebViewTerminationRecovery();

  const reportError: MobileErrorReporter = useCallback((operation, _err, options) => {
    const line = `${operation} ${JSON.stringify(options?.metadata ?? {})}`;
    console.log('[lab report]', line);
    setReports((r) => [...r, line]);
  }, []);

  // Mirrors the controller's handleProcessTerminated (covered by its jest test).
  const handleProcessTerminated = useCallback(
    (event?: { nativeEvent?: { didCrash?: boolean } }) => {
      if (shouldReloadAfterTermination()) {
        console.log('[lab] silent reload');
        setWebViewKey((k) => k + 1);
        return;
      }
      reportError('parent_newsletter_detail_render_process_gone', new Error('terminated'), {
        metadata: { autoReloaded: true, platform: Platform.OS, didCrash: event?.nativeEvent?.didCrash },
      });
      setLoadError('This newsletter could not be loaded.');
    },
    [reportError, shouldReloadAfterTermination],
  );

  if (!__DEV__) return <Redirect href="/" />;

  const controller = {
    editionId: 'lab-edition',
    webSource: { uri: `${SITE}/`, headers: {} },
    isLoading: false,
    loadError,
    setLoadError,
    reportError,
    retry: () => {
      resetTerminationRecovery();
      setLoadError(null);
      setWebViewKey((k) => k + 1);
    },
    handleHttpError: () => {},
    webViewKey,
    handleProcessTerminated,
    onBack: () => {},
  } as unknown as ParentNewsletterDetailController;

  return (
    <View style={styles.root} testID="webview-termination-lab">
      <View style={styles.bar}>
        {(['newsletter', 'pdf'] as const).map((m) => (
          <Pressable key={m} onPress={() => setMode(m)} style={[styles.tab, mode === m && styles.tabOn]}>
            <Text>{m}</Text>
          </Pressable>
        ))}
        <Text testID="lab-status">
          key={webViewKey} reports={reports.length}
        </Text>
      </View>
      <View style={styles.body}>
        {mode === 'newsletter' ? (
          <ParentNewsletterDetailGardenScreen controller={controller} />
        ) : (
          <ParentEmbeddedPdfWebView url={PDF_URL} style={{ flex: 1 }} />
        )}
      </View>
      <Text style={styles.log} numberOfLines={3}>
        {reports.at(-1) ?? 'no reports'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingTop: 60, backgroundColor: '#fff' },
  bar: { flexDirection: 'row', gap: 8, alignItems: 'center', padding: 8 },
  tab: { paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderRadius: 8 },
  tabOn: { backgroundColor: '#ddd' },
  body: { flex: 1 },
  log: { padding: 8, fontSize: 11, backgroundColor: '#ffe', minHeight: 50 },
});
