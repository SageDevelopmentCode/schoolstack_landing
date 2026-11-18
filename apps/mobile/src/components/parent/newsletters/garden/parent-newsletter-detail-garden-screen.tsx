import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import { Garden } from '@/components/parent/garden/tokens';
import { GErrorCard, GLink, GSkeleton } from '@/components/parent/garden/ui';
import type { ParentNewsletterDetailController } from '@/components/parent/newsletters/garden/use-parent-newsletter-detail-controller';

/** Paper page placeholder shaped like a newsletter: masthead, hero, columns of copy. */
function NewsletterPageSkeleton() {
  return (
    <View
      style={styles.skeletonWrap}
      accessibilityLabel="Loading newsletter"
      accessibilityState={{ busy: true }}>
      <View style={styles.page}>
        <GSkeleton style={{ width: '35%', height: 11, alignSelf: 'center' }} />
        <GSkeleton style={{ width: '70%', height: 24, alignSelf: 'center' }} />
        <GSkeleton style={{ width: '100%', height: 1.5 }} />
        <GSkeleton style={{ width: '100%', height: 150, borderRadius: 14 }} />
        <GSkeleton style={{ width: '55%', height: 16 }} />
        {Array.from({ length: 4 }).map((_, i) => (
          <GSkeleton key={`a${i}`} style={{ width: i === 3 ? '60%' : '100%', height: 11 }} />
        ))}
        <View style={styles.columns}>
          {Array.from({ length: 2 }).map((_, c) => (
            <View key={c} style={styles.column}>
              <GSkeleton style={{ width: '70%', height: 14 }} />
              {Array.from({ length: 4 }).map((__, i) => (
                <GSkeleton key={i} style={{ width: i === 3 ? '50%' : '100%', height: 10 }} />
              ))}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

/**
 * Parent newsletter edition in Garden: a cream top bar with a back link, then
 * the edition WebView on a paper page skeleton, or an error card with Try again.
 */
export function ParentNewsletterDetailGardenScreen({
  controller,
}: {
  controller: ParentNewsletterDetailController;
}) {
  const { editionId, webSource, isLoading, loadError, setLoadError, reportError } = controller;

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: Garden.cream }]}
      // The parent shell already insets the top and pads above the tab bar (skill §3.11).
      edges={[]}
      testID="parent-newsletter-detail-screen">
      <StatusBar style="dark" />
      <View style={styles.topBar}>
        <GLink
          label="Newsletters"
          icon="chevron-back"
          accessibilityLabel="Back"
          onPress={controller.onBack}
          style={styles.back}
          reverse
        />
      </View>

      {isLoading ? (
        <NewsletterPageSkeleton />
      ) : loadError || !webSource ? (
        <View style={styles.errorWrap}>
          <GErrorCard
            title="We couldn't open this edition"
            message={loadError ?? 'This edition may have been removed or is no longer available.'}
            onRetry={controller.retry}
          />
        </View>
      ) : (
        <WebView
          key={controller.webViewKey}
          originWhitelist={['*']}
          source={{ uri: webSource.uri, headers: webSource.headers }}
          style={styles.webview}
          setSupportMultipleWindows={false}
          startInLoadingState
          onError={(event) => {
            reportError(
              'parent_newsletter_detail_webview_error',
              new Error(event.nativeEvent.description?.trim() || 'Newsletter WebView failed to load.'),
              {
                entityType: 'newsletter_edition',
                entityId: editionId,
                metadata: { code: event.nativeEvent.code, domain: event.nativeEvent.domain },
              },
            );
            setLoadError('This newsletter could not be loaded.');
          }}
          onHttpError={(event) => {
            // Reports via reportError unless it's a first 401 (refresh + reload).
            controller.handleHttpError(event.nativeEvent.statusCode);
          }}
          onLoadEnd={controller.handleWebViewLoadEnd}
          // The OS can kill the content process (often while backgrounded);
          // the controller remounts silently and only reports repeat failures.
          onRenderProcessGone={(event) => {
            controller.handleProcessTerminated('android_gone', event.nativeEvent?.didCrash);
          }}
          onContentProcessDidTerminate={() => {
            controller.handleProcessTerminated('ios_terminate');
          }}
          renderLoading={() => (
            <View style={styles.webviewLoading}>
              <NewsletterPageSkeleton />
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  topBar: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  back: { alignSelf: 'flex-start', minHeight: 36 },
  errorWrap: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  webview: { flex: 1, backgroundColor: Garden.cream },
  webviewLoading: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: Garden.cream },
  skeletonWrap: { flex: 1, paddingHorizontal: 16, paddingTop: 4 },
  page: {
    backgroundColor: Garden.paper,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Garden.ink10,
    padding: 20,
    gap: 12,
  },
  columns: { flexDirection: 'row', gap: 16, marginTop: 4 },
  column: { flex: 1, gap: 8 },
});
