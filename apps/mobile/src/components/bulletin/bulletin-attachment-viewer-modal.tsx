import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useCallback, useRef } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ViewToken,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import { canPreviewBulletinAttachment, isBulletinImageAttachment } from '@/lib/school-bulletin/attachment-preview';
import type { BulletinAttachment } from '@/lib/school-bulletin/types';

export type BulletinAttachmentViewerState = {
  attachments: BulletinAttachment[];
  index: number;
};

type BulletinAttachmentViewerModalProps = {
  viewerState: BulletinAttachmentViewerState | null;
  visible: boolean;
  onClose: () => void;
  onChangeIndex: (index: number) => void;
};

export function BulletinAttachmentViewerModal({
  viewerState,
  visible,
  onClose,
  onChangeIndex,
}: BulletinAttachmentViewerModalProps) {
  const { width: windowWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<BulletinAttachment>>(null);
  const activeIndexRef = useRef(viewerState?.index ?? 0);

  const previewableAttachments =
    viewerState?.attachments.filter(
      (attachment) =>
        attachment.downloadUrl &&
        canPreviewBulletinAttachment(attachment.mimeType) &&
        isBulletinImageAttachment(attachment.mimeType),
    ) ?? [];

  const activeIndex = Math.min(
    viewerState?.index ?? 0,
    Math.max(previewableAttachments.length - 1, 0),
  );
  activeIndexRef.current = activeIndex;

  const activeAttachment = previewableAttachments[activeIndex] ?? null;
  const showCarousel = previewableAttachments.length > 1;

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const index = viewableItems[0]?.index;
      if (index != null && index !== activeIndexRef.current) {
        onChangeIndex(index);
      }
    },
    [onChangeIndex],
  );

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 60 }).current;

  const goToPrevious = () => {
    const next = Math.max(0, activeIndex - 1);
    listRef.current?.scrollToIndex({ index: next, animated: true });
    onChangeIndex(next);
  };

  const goToNext = () => {
    const next = Math.min(previewableAttachments.length - 1, activeIndex + 1);
    listRef.current?.scrollToIndex({ index: next, animated: true });
    onChangeIndex(next);
  };

  if (!visible || !activeAttachment?.downloadUrl) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close attachment viewer"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.content} pointerEvents="box-none">
          <View
            style={[
              styles.header,
              {
                paddingTop: insets.top + Spacing.two,
                zIndex: 10,
                elevation: 10,
              },
            ]}
            pointerEvents="box-none">
            <View style={styles.headerRow}>
              <Text style={styles.fileName} numberOfLines={1}>
                {activeAttachment.fileName}
              </Text>
              <View style={styles.headerActions}>
                {showCarousel ? (
                  <Text style={styles.counter}>
                    {activeIndex + 1} / {previewableAttachments.length}
                  </Text>
                ) : null}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Close attachment viewer"
                  onPress={onClose}
                  hitSlop={12}
                  style={({ pressed }) => [styles.closeButton, pressed && { opacity: 0.7 }]}>
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </Pressable>
              </View>
            </View>
          </View>

          <View style={styles.imageArea} pointerEvents="box-none">
            {showCarousel && activeIndex > 0 ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Previous attachment"
                onPress={goToPrevious}
                style={styles.navButtonLeft}>
                <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
              </Pressable>
            ) : null}

            <View style={styles.carouselWrapper} onStartShouldSetResponder={() => true}>
              <FlatList
                ref={listRef}
                data={previewableAttachments}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                initialScrollIndex={activeIndex}
                getItemLayout={(_, index) => ({
                  length: windowWidth,
                  offset: windowWidth * index,
                  index,
                })}
                keyExtractor={(item) => item.id}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                renderItem={({ item }) => (
                  <View style={[styles.slide, { width: windowWidth }]}>
                    <Image
                      source={{ uri: item.downloadUrl }}
                      style={styles.image}
                      contentFit="contain"
                      accessibilityLabel={item.fileName}
                    />
                  </View>
                )}
              />
            </View>

            {showCarousel && activeIndex < previewableAttachments.length - 1 ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Next attachment"
                onPress={goToNext}
                style={styles.navButtonRight}>
                <Ionicons name="chevron-forward" size={28} color="#FFFFFF" />
              </Pressable>
            ) : null}
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
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flexShrink: 0,
  },
  fileName: {
    flex: 1,
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  counter: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  imageArea: {
    flex: 1,
    justifyContent: 'center',
  },
  carouselWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.two,
  },
  image: {
    width: '100%',
    height: '100%',
    maxHeight: '90%',
  },
  navButtonLeft: {
    position: 'absolute',
    left: 8,
    top: '50%',
    zIndex: 12,
    elevation: 12,
    padding: 8,
  },
  navButtonRight: {
    position: 'absolute',
    right: 8,
    top: '50%',
    zIndex: 12,
    elevation: 12,
    padding: 8,
  },
});
