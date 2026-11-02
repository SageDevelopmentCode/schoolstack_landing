import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import { useParentTheme } from '@/contexts/parent-theme-context';
import { getParentNewsletterDocumentWebViewSource } from '@/lib/parent/parent-portal-api';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';
import { StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';

type ParentNewsletterDetailScreenProps = {
  organizationId: string;
  editionId: string;
};

export function ParentNewsletterDetailScreen({
  organizationId,
  editionId,
}: ParentNewsletterDetailScreenProps) {
  const theme = useParentTheme();
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
      const source = await getParentNewsletterDocumentWebViewSource(organizationId, editionId);
      setWebSource(source);
    } catch (err) {
      reportError('parent_newsletter_detail_load', err);
      setLoadError('This newsletter could not be loaded.');
    } finally {
      setIsLoading(false);
    }
  }, [editionId, organizationId, reportError]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: '#F8F8F3' }]} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}>
          <Ionicons name="chevron-back" size={22} color={theme.primary} />
          <Text style={[styles.backLabel, { color: theme.primary }]}>Back</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : loadError || !webSource ? (
        <View style={styles.notFound}>
          <Text style={[styles.notFoundCopy, { color: theme.muted }]}>
            {loadError ?? 'This edition may have been removed or is no longer available.'}
          </Text>
        </View>
      ) : (
        <WebView
          originWhitelist={['*']}
          source={{ uri: webSource.uri, headers: webSource.headers }}
          style={styles.webview}
          setSupportMultipleWindows={false}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.webviewLoading}>
              <ActivityIndicator color={theme.primary} />
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.one,
    paddingBottom: Spacing.two,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    alignSelf: 'flex-start',
  },
  backLabel: {
    fontFamily: StoryFonts.body,
    fontSize: 15,
    fontWeight: '600',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFound: {
    flex: 1,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.six,
  },
  notFoundCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  webview: {
    flex: 1,
    backgroundColor: '#F8F8F3',
  },
  webviewLoading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F8F3',
  },
});
