import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { ParentEmbeddedPdfViewerModal } from '@/components/parent/shared/parent-embedded-pdf-viewer-modal';
import { StoryFonts } from '@/constants/story-theme';
import { Radius, Spacing } from '@/constants/theme';

type ParentEmbeddedPdfPreviewProps = {
  url: string;
  title: string;
  minHeight?: number;
};

export function ParentEmbeddedPdfPreview({
  url,
  title,
  minHeight = 360,
}: ParentEmbeddedPdfPreviewProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Expand document"
        onPress={() => setExpanded(true)}
        style={[styles.container, { minHeight }]}>
        <WebView
          source={{ uri: url }}
          style={[styles.webView, { minHeight }]}
          scrollEnabled={false}
          pointerEvents="none"
        />
        <View style={styles.expandHint} pointerEvents="none">
          <Ionicons name="expand-outline" size={16} color="#FFFFFF" />
          <Text style={styles.expandHintText}>Tap to expand</Text>
        </View>
      </Pressable>

      <ParentEmbeddedPdfViewerModal
        visible={expanded}
        url={url}
        title={title}
        onClose={() => setExpanded(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
  },
  webView: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  expandHint: {
    position: 'absolute',
    right: Spacing.three,
    bottom: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  expandHintText: {
    fontFamily: StoryFonts.bodyMedium,
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});
