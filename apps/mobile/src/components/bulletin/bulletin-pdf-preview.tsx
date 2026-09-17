import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';

import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { Radius } from '@/constants/theme';
import { buildEmbeddedPdfViewerUrl } from '@/lib/school-bulletin/bulletin-format';

type BulletinPdfPreviewProps = {
  downloadUrl: string;
  fileName?: string;
  height?: number;
  style?: ViewStyle;
  showBadge?: boolean;
  pointerEvents?: 'auto' | 'none' | 'box-none' | 'box-only';
};

export function BulletinPdfPreview({
  downloadUrl,
  fileName,
  height,
  style,
  showBadge = true,
  pointerEvents = 'none',
}: BulletinPdfPreviewProps) {
  const theme = useParentTheme();
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <View
        style={[
          styles.fallback,
          height ? { height } : styles.fallbackAspect,
          { borderColor: theme.line, backgroundColor: theme.white },
          style,
        ]}>
        <Ionicons name="document-text-outline" size={24} color={theme.info} />
        {fileName ? (
          <Text style={[styles.fallbackFileName, { color: theme.muted }]} numberOfLines={2}>
            {fileName}
          </Text>
        ) : (
          <Text style={[styles.fallbackLabel, { color: theme.muted }]}>PDF</Text>
        )}
      </View>
    );
  }

  return (
    <View
      pointerEvents={pointerEvents}
      style={[
        styles.container,
        height ? { height } : styles.containerAspect,
        { borderColor: theme.line, backgroundColor: theme.white },
        style,
      ]}>
      <WebView
        source={{ uri: buildEmbeddedPdfViewerUrl(downloadUrl) }}
        style={styles.webview}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        originWhitelist={['*']}
        onError={() => setFailed(true)}
        onHttpError={() => setFailed(true)}
      />
      {showBadge ? (
        <View style={[styles.badge, { backgroundColor: 'rgba(255,255,255,0.92)' }]}>
          <Text style={[styles.badgeText, { color: theme.muted }]}>PDF</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  containerAspect: {
    aspectRatio: 4 / 3,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  badge: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 10,
    fontWeight: '700',
  },
  fallback: {
    width: '100%',
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  fallbackAspect: {
    aspectRatio: 4 / 3,
  },
  fallbackFileName: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    textAlign: 'center',
  },
  fallbackLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 10,
    fontWeight: '700',
  },
});
