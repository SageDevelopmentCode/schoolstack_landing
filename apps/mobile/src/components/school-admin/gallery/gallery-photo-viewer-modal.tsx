import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { formatGalleryDateLabel } from '@/lib/school-gallery/format-gallery-date';
import { shareGalleryPhoto } from '@/lib/school-gallery/share-gallery-photo';
import type { GalleryPhoto } from '@/lib/school-gallery/types';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

export type GalleryPhotoViewerState = {
  photos: GalleryPhoto[];
  index: number;
};

type GalleryPhotoViewerModalProps = {
  organizationId: string;
  viewerState: GalleryPhotoViewerState | null;
  visible: boolean;
  hasMore: boolean;
  onClose: () => void;
  onChangeIndex: (index: number) => void;
  onRequestMore?: () => void;
};

export function GalleryPhotoViewerModal({
  organizationId,
  viewerState,
  visible,
  hasMore,
  onClose,
  onChangeIndex,
  onRequestMore,
}: GalleryPhotoViewerModalProps) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<GalleryPhoto>>(null);
  const [sharing, setSharing] = useState(false);
  const { reportError } = useMobileErrorReporter(organizationId);

  const photos = viewerState?.photos ?? [];
  const activeIndex = Math.min(viewerState?.index ?? 0, Math.max(photos.length - 1, 0));
  const activePhoto = photos[activeIndex] ?? null;

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const next = viewableItems[0]?.index;
      if (typeof next === 'number' && next !== activeIndex) {
        onChangeIndex(next);
        if (hasMore && onRequestMore && next >= photos.length - 2) {
          void onRequestMore();
        }
      }
    },
    [activeIndex, hasMore, onChangeIndex, onRequestMore, photos.length],
  );

  const scrollToActiveIndex = useCallback(
    (index: number, animated = false) => {
      if (index <= 0 || photos.length === 0) return;
      listRef.current?.scrollToIndex({ index, animated });
    },
    [photos.length],
  );

  useEffect(() => {
    if (!visible || photos.length === 0) return;
    const index = Math.min(Math.max(activeIndex, 0), photos.length - 1);
    if (index <= 0) return;

    const frame = requestAnimationFrame(() => {
      scrollToActiveIndex(index, false);
    });
    return () => cancelAnimationFrame(frame);
  }, [activeIndex, photos.length, scrollToActiveIndex, visible]);

  const handleSharePhoto = useCallback(() => {
    if (!activePhoto || sharing) {
      return;
    }
    setSharing(true);
    void (async () => {
      try {
        await shareGalleryPhoto(activePhoto);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Could not share this photo.';
        Alert.alert('Could not share photo', message);
        reportError('gallery_photo_share', error, {
          error: message,
          entityType: 'gallery_photo',
          entityId: activePhoto.id,
        });
      } finally {
        setSharing(false);
      }
    })();
  }, [activePhoto, reportError, sharing]);

  if (!visible || !viewerState) {
    return null;
  }

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.topBar}>
          <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose}>
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.counter}>
            {photos.length > 0 ? `${activeIndex + 1} / ${photos.length}${hasMore ? '+' : ''}` : ''}
          </Text>
          {activePhoto?.imageUrl ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Share photo"
              accessibilityState={{ disabled: sharing }}
              disabled={sharing}
              onPress={handleSharePhoto}
              style={styles.shareButton}>
              {sharing ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Ionicons name="share-outline" size={26} color="#FFFFFF" />
              )}
            </Pressable>
          ) : (
            <View style={styles.shareButtonPlaceholder} />
          )}
        </View>

        <FlatList
          ref={listRef}
          data={photos}
          horizontal
          pagingEnabled
          getItemLayout={(_, index) => ({
            length: windowWidth,
            offset: windowWidth * index,
            index,
          })}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
          onScrollToIndexFailed={(info) => {
            listRef.current?.scrollToOffset({
              offset: windowWidth * info.index,
              animated: false,
            });
          }}
          renderItem={({ item }) => (
            <View style={[styles.slide, { width: windowWidth, height: windowHeight * 0.72 }]}>
              {item.imageUrl ? (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.image}
                  contentFit="contain"
                  transition={200}
                />
              ) : (
                <Ionicons name="image-outline" size={48} color="#94A3B8" />
              )}
            </View>
          )}
        />

        {activePhoto ? (
          <View style={styles.meta}>
            <Text style={styles.fileName} numberOfLines={2}>{activePhoto.fileName}</Text>
            <Text style={styles.metaLine}>{formatGalleryDateLabel(activePhoto.photoDate)}</Text>
            {activePhoto.uploadedByName ? (
              <Text style={styles.metaLine}>Uploaded by {activePhoto.uploadedByName}</Text>
            ) : null}
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.two,
  },
  counter: {
    flex: 1,
    fontFamily: StoryFonts.body,
    fontSize: 14,
    color: '#E2E8F0',
    textAlign: 'center',
  },
  shareButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButtonPlaceholder: {
    width: 28,
    height: 28,
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  meta: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    gap: 4,
  },
  fileName: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  metaLine: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    color: '#CBD5E1',
  },
});
