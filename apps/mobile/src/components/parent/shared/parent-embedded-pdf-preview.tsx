import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import { GPressable } from '@/components/parent/garden/ui';
import { ParentEmbeddedPdfViewerModal } from '@/components/parent/shared/parent-embedded-pdf-viewer-modal';
import { ParentEmbeddedPdfWebView } from '@/components/parent/shared/parent-embedded-pdf-webview';

type ParentEmbeddedPdfPreviewProps = {
  url: string;
  title: string;
  minHeight?: number;
  /** Included in operational error reports (for example `curriculum` + its id). */
  reportEntityType?: string;
  reportEntityId?: string;
};

export function ParentEmbeddedPdfPreview({
  url,
  title,
  minHeight = 360,
  reportEntityType,
  reportEntityId,
}: ParentEmbeddedPdfPreviewProps) {
  const [expanded, setExpanded] = useState(false);
  const trimmedTitle = title?.trim();

  return (
    <>
      <GPressable
        accessibilityLabel={trimmedTitle ? `Expand ${trimmedTitle}` : 'Expand document'}
        onPress={() => setExpanded(true)}
        pressedScale={0.995}
        style={[styles.container, { minHeight }]}>
        {expanded ? (
          <View style={[styles.webView, styles.inlinePlaceholder, { minHeight }]} />
        ) : (
          <ParentEmbeddedPdfWebView
            url={url}
            style={[styles.webView, { minHeight }]}
            scrollEnabled={false}
            pointerEvents="none"
            firstPageOnly
            title={trimmedTitle}
            reportEntityType={reportEntityType}
            reportEntityId={reportEntityId}
          />
        )}
        <View style={styles.expandHint} pointerEvents="none">
          <Ionicons name="expand-outline" size={16} color={Garden.white} />
          <Text style={styles.expandHintText}>Tap to expand</Text>
        </View>
      </GPressable>

      <ParentEmbeddedPdfViewerModal
        visible={expanded}
        url={url}
        title={title}
        onClose={() => setExpanded(false)}
        reportEntityType={reportEntityType}
        reportEntityId={reportEntityId}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: Garden.cream,
  },
  webView: {
    flex: 1,
    backgroundColor: Garden.cream,
  },
  inlinePlaceholder: {
    backgroundColor: Garden.ink06,
  },
  expandHint: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Garden.ink,
    borderRadius: 999,
    paddingHorizontal: 16,
  },
  expandHintText: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 14,
    color: Garden.white,
  },
});
