import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type ParentEmbeddedPdfViewerModalProps = {
  visible: boolean;
  url: string;
  title: string;
  onClose: () => void;
};

export function ParentEmbeddedPdfViewerModal({
  visible,
  url,
  title,
  onClose,
}: ParentEmbeddedPdfViewerModalProps) {
  const insets = useSafeAreaInsets();

  if (!visible || !url) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close document viewer"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.content} pointerEvents="box-none">
          <View
            style={[
              styles.header,
              {
                paddingTop: insets.top + Spacing.two,
              },
            ]}
            pointerEvents="box-none">
            <View style={styles.headerRow}>
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close document viewer"
                onPress={onClose}
                hitSlop={12}
                style={({ pressed }) => [styles.closeButton, pressed && { opacity: 0.7 }]}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>

          <View style={[styles.webViewArea, { paddingBottom: insets.bottom }]}>
            <WebView
              source={{ uri: url }}
              style={styles.webView}
              allowsInlineMediaPlayback
              startInLoadingState
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.two,
    zIndex: 10,
    elevation: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  title: {
    flex: 1,
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  webViewArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  webView: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});
