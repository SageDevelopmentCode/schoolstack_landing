import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ViewToken,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import { GPressable } from '@/components/parent/garden/ui';
import { haptic } from '@/lib/haptics';
import { formatGalleryDateLabel } from '@/lib/school-gallery/format-gallery-date';
import { shareGalleryPhoto } from '@/lib/school-gallery/share-gallery-photo';
import type { GalleryPhoto } from '@/lib/school-gallery/types';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

const VIEWER_BG = '#15110D';

type ShareState =
  | { kind: 'idle' }
  | { kind: 'preparing' }
  | { kind: 'ready' }
  | { kind: 'error'; message: string };

/**
 * Parent full-screen photo viewer (Garden): swipe between photos, share or
 * save through the system share sheet. Same behaviour as the shared gallery
 * viewer; status shows inside the viewer because it is a native modal.
 */
export function ParentPhotoViewer({
  organizationId,
  photos,
  index,
  visible,
  hasMore,
  onClose,
  onChangeIndex,
  onRequestMore,
  testIDPrefix = 'parent-photo-viewer',
  onPhotoOptions,
}: {
  organizationId: string;
  photos: GalleryPhoto[];
  index: number;
  visible: boolean;
  hasMore: boolean;
  onClose: () => void;
  onChangeIndex: (index: number) => void;
  onRequestMore: () => void;
  /** Teacher portal: its own testIDs. */
  testIDPrefix?: string;
  /** Shows an options button for this photo (e.g. edit date / delete your own upload). */
  onPhotoOptions?: ((photo: GalleryPhoto) => void) | null;
}) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<GalleryPhoto>>(null);
  const { reportError } = useMobileErrorReporter(organizationId);
  const [share, setShare] = useState<ShareState>({ kind: 'idle' });
  const readyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeIndex = Math.min(Math.max(index, 0), Math.max(photos.length - 1, 0));
  const activePhoto = photos[activeIndex] ?? null;

  useEffect(
    () => () => {
      if (readyTimer.current) clearTimeout(readyTimer.current);
    },
    [],
  );

  // A new photo clears the last share result.
  useEffect(() => {
    setShare((current) => (current.kind === 'preparing' ? current : { kind: 'idle' }));
  }, [activePhoto?.id]);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const next = viewableItems[0]?.index;
      if (typeof next === 'number' && next !== activeIndex) {
        haptic.select();
        onChangeIndex(next);
        if (hasMore && next >= photos.length - 2) onRequestMore();
      }
    },
    [activeIndex, hasMore, onChangeIndex, onRequestMore, photos.length],
  );

  // Jump to the tapped photo when the viewer opens.
  useEffect(() => {
    if (!visible || activeIndex <= 0 || photos.length === 0) return;
    const frame = requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({ index: activeIndex, animated: false });
    });
    return () => cancelAnimationFrame(frame);
    // Only when opening: later index changes come from swiping.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const handleShare = useCallback(() => {
    if (!activePhoto || share.kind === 'preparing') return;
    setShare({ kind: 'preparing' });
    void (async () => {
      try {
        const result = await shareGalleryPhoto(activePhoto);
        if (result.outcome === 'shared') {
          haptic.success();
          setShare({ kind: 'ready' });
          if (readyTimer.current) clearTimeout(readyTimer.current);
          readyTimer.current = setTimeout(() => setShare({ kind: 'idle' }), 2400);
        } else {
          setShare({ kind: 'idle' });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Could not share this photo.';
        haptic.error();
        setShare({ kind: 'error', message });
        reportError('gallery_photo_share', error, {
          error: message,
          entityType: 'gallery_photo',
          entityId: activePhoto.id,
        });
      }
    })();
  }, [activePhoto, reportError, share.kind]);

  if (!visible || photos.length === 0) return null;

  const counter = `${activeIndex + 1} of ${photos.length}${hasMore ? '+' : ''}`;
  const preparing = share.kind === 'preparing';

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View
        testID={testIDPrefix}
        style={[styles.root, { paddingTop: insets.top + 6, paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.topBar}>
          <GPressable
            testID={`${testIDPrefix}-close`}
            accessibilityLabel="Close photo"
            onPress={onClose}
            style={styles.roundButton}>
            <Ionicons name="close" size={24} color={Garden.white} />
          </GPressable>
          <View style={styles.counter} accessible accessibilityLabel={`Photo ${counter}`}>
            <Text style={styles.counterText}>{counter}</Text>
          </View>
          <View style={styles.rightButtons}>
          {activePhoto && onPhotoOptions ? (
            <GPressable
              testID={`${testIDPrefix}-options`}
              accessibilityLabel="Photo options"
              accessibilityHint="Change the date or delete this photo"
              onPress={() => onPhotoOptions(activePhoto)}
              style={styles.roundButton}>
              <Ionicons name="ellipsis-horizontal" size={22} color={Garden.white} />
            </GPressable>
          ) : null}
          {activePhoto?.imageUrl ? (
            <GPressable
              testID={`${testIDPrefix}-share`}
              accessibilityLabel="Share or save photo"
              accessibilityHint="Opens the share sheet, where you can save it to Photos"
              accessibilityState={{ disabled: preparing, busy: preparing }}
              disabled={preparing}
              haptic="press"
              onPress={handleShare}
              style={styles.roundButton}>
              {preparing ? (
                <ActivityIndicator color={Garden.white} size="small" />
              ) : (
                <Ionicons name="share-outline" size={22} color={Garden.white} />
              )}
            </GPressable>
          ) : (
            <View style={styles.roundButtonSpacer} />
          )}
          </View>
        </View>

        <FlatList
          ref={listRef}
          data={photos}
          horizontal
          pagingEnabled
          style={styles.list}
          getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
          onScrollToIndexFailed={(info) => {
            listRef.current?.scrollToOffset({ offset: width * info.index, animated: false });
          }}
          renderItem={({ item }) => (
            <View style={[styles.slide, { width, height: height * 0.66 }]}>
              {item.imageUrl ? (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.image}
                  contentFit="contain"
                  transition={200}
                  accessibilityLabel={`Photo from ${formatGalleryDateLabel(item.photoDate)}`}
                />
              ) : (
                <View style={styles.missing}>
                  <Ionicons name="image-outline" size={40} color="rgba(255,255,255,0.5)" />
                  <Text style={styles.missingText}>This photo isn&apos;t available right now.</Text>
                </View>
              )}
            </View>
          )}
        />

        <View style={styles.bottom}>
          {share.kind === 'preparing' ? (
            <StatusPill icon="cloud-download-outline" label="Preparing photo…" />
          ) : share.kind === 'ready' ? (
            <StatusPill icon="checkmark-circle" label="Shared" tone="success" />
          ) : share.kind === 'error' ? (
            <Animated.View entering={FadeIn.duration(200)} style={styles.errorBox} accessibilityRole="alert">
              <Ionicons name="alert-circle" size={18} color={Garden.peach} />
              <View style={styles.errorCopy}>
                <Text style={styles.errorTitle}>Couldn&apos;t share this photo</Text>
                <Text style={styles.errorBody}>{share.message} Check your connection, then try again.</Text>
              </View>
              <GPressable
                accessibilityLabel="Try sharing again"
                haptic="press"
                onPress={handleShare}
                style={styles.retryButton}>
                <Text style={styles.retryText}>Try again</Text>
              </GPressable>
            </Animated.View>
          ) : null}

          {activePhoto ? (
            <View style={styles.meta}>
              <Text style={styles.date}>{formatGalleryDateLabel(activePhoto.photoDate)}</Text>
              <Text style={styles.metaLine} numberOfLines={1}>
                {activePhoto.fileName}
              </Text>
              {activePhoto.uploadedByName ? (
                <Text style={styles.metaLine}>Uploaded by {activePhoto.uploadedByName}</Text>
              ) : null}
            </View>
          ) : null}
          {photos.length > 1 ? (
            <Text style={styles.hint} accessibilityElementsHidden importantForAccessibility="no">
              Swipe for more photos
            </Text>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

function StatusPill({
  icon,
  label,
  tone = 'neutral',
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  tone?: 'neutral' | 'success';
}) {
  return (
    <Animated.View
      entering={FadeIn.duration(180)}
      exiting={FadeOut.duration(180)}
      accessibilityLiveRegion="polite"
      style={[styles.pill, tone === 'success' && { backgroundColor: Garden.mint }]}>
      <Ionicons name={icon} size={15} color={tone === 'success' ? Garden.forest : Garden.white} />
      <Text style={[styles.pillText, tone === 'success' && { color: Garden.forest }]}>{label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: VIEWER_BG },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  roundButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  roundButtonSpacer: { width: 44, height: 44 },
  rightButtons: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  counter: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  counterText: { fontFamily: GardenFonts.bodyExtra, fontSize: 13, color: Garden.white },
  list: { flexGrow: 0 },
  slide: { alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: '100%' },
  missing: { alignItems: 'center', gap: 8, paddingHorizontal: 32 },
  missingText: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  bottom: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: 20, gap: 12 },
  meta: { gap: 3 },
  date: {
    fontFamily: GardenFonts.display,
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: -0.5,
    color: Garden.white,
  },
  metaLine: { fontFamily: GardenFonts.bodySemi, fontSize: 13, color: 'rgba(255,255,255,0.72)' },
  hint: { fontFamily: GardenFonts.bodyBold, fontSize: 12, color: 'rgba(255,255,255,0.45)' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  pillText: { fontFamily: GardenFonts.bodyExtra, fontSize: 13, color: Garden.white },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(248,221,207,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(248,221,207,0.35)',
  },
  errorCopy: { flex: 1, minWidth: 0, gap: 2 },
  errorTitle: { fontFamily: GardenFonts.bodyExtra, fontSize: 14, color: Garden.white },
  errorBody: { fontFamily: GardenFonts.bodySemi, fontSize: 12.5, lineHeight: 17, color: 'rgba(255,255,255,0.8)' },
  retryButton: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Garden.white,
  },
  retryText: { fontFamily: GardenFonts.bodyExtra, fontSize: 13, color: Garden.ink },
});
