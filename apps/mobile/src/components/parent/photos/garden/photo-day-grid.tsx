import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { memo, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import { GChip, GPressable, GSkeleton } from '@/components/parent/garden/ui';
import { photoCountLabel } from '@/components/parent/photos/garden/photo-permissions-ui';
import { reportMobileMediaLoadFailure } from '@/lib/mobile-global-error-reporting';
import { formatGalleryDateLabel } from '@/lib/school-gallery/format-gallery-date';
import type { GalleryPhotoDateGroup } from '@/lib/school-gallery/group-gallery-photos';
import type { GalleryPhoto } from '@/lib/school-gallery/types';

export const PHOTO_GRID_COLUMNS = 3;
export const PHOTO_GRID_GAP = 6;

/** Tile edge for a grid that is `contentWidth` wide. */
export function photoTileSize(contentWidth: number): number {
  return Math.floor((contentWidth - PHOTO_GRID_GAP * (PHOTO_GRID_COLUMNS - 1)) / PHOTO_GRID_COLUMNS);
}

/** "Today", "Yesterday", or the full gallery date ("Friday, November 14, 2026"). */
export function photoDayLabel(photoDate: string, now = new Date()): string {
  const parsed = new Date(`${photoDate}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return photoDate;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  const days = Math.round((today.getTime() - parsed.getTime()) / 86_400_000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return formatGalleryDateLabel(photoDate);
}

/**
 * One day of the school gallery: a date row with a count chip, then a
 * 3-column grid of rounded tiles. The newest day gets a "Latest" chip.
 */
export const PhotoDayGrid = memo(function PhotoDayGrid({
  group,
  latest,
  showCount = true,
  tileSize,
  onOpenPhoto,
  onLongPressPhoto,
  tileBadge,
  tileHint,
  tileTestIDPrefix = 'parent-photo-tile',
}: {
  group: GalleryPhotoDateGroup;
  latest: boolean;
  /** Off when there is only one day (the gallery heading already shows the count). */
  showCount?: boolean;
  tileSize: number;
  onOpenPhoto: (photo: GalleryPhoto) => void;
  /** Defaults to opening the photo (parent). */
  onLongPressPhoto?: (photo: GalleryPhoto) => void;
  /** Small label on the tile (e.g. "You" / the uploader). */
  tileBadge?: (photo: GalleryPhoto) => { label: string; mine?: boolean } | null;
  tileHint?: (photo: GalleryPhoto) => string;
  tileTestIDPrefix?: string;
}) {
  const dayLabel = photoDayLabel(group.photoDate);
  const fullDate = formatGalleryDateLabel(group.photoDate);
  const count = group.photos.length;

  return (
    <View style={styles.day}>
      <View style={styles.dayHead}>
        <Text accessibilityRole="header" style={styles.dayLabel} numberOfLines={1}>
          {dayLabel}
        </Text>
        {latest ? <GChip tone="success" icon="sparkles" label="Latest" /> : null}
        {showCount ? (
          <GChip tone="neutral" label={photoCountLabel(count)} style={styles.countChip} />
        ) : null}
      </View>
      <View style={styles.grid}>
        {group.photos.map((photo, index) => {
          const badge = tileBadge?.(photo) ?? null;
          const by = badge ? `, uploaded by ${badge.mine ? 'you' : badge.label}` : '';
          return (
            <PhotoTile
              key={photo.id}
              photo={photo}
              size={tileSize}
              accessibilityLabel={`Photo ${index + 1} of ${count} from ${fullDate}${by}`}
              accessibilityHint={tileHint?.(photo)}
              badge={badge}
              testID={`${tileTestIDPrefix}-${photo.id}`}
              onOpen={onOpenPhoto}
              onLongPress={onLongPressPhoto}
            />
          );
        })}
      </View>
    </View>
  );
});

const PhotoTile = memo(function PhotoTile({
  photo,
  size,
  accessibilityLabel,
  accessibilityHint = 'Opens the photo full screen, where you can swipe and share',
  badge,
  testID,
  onOpen,
  onLongPress,
}: {
  photo: GalleryPhoto;
  size: number;
  accessibilityLabel: string;
  accessibilityHint?: string;
  badge: { label: string; mine?: boolean } | null;
  testID: string;
  onOpen: (photo: GalleryPhoto) => void;
  onLongPress?: (photo: GalleryPhoto) => void;
}) {
  const imageUrl = photo.imageUrl ?? null;
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [imageUrl]);

  const showImage = Boolean(imageUrl) && !failed;

  return (
    <GPressable
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      pressedScale={0.96}
      onPress={() => onOpen(photo)}
      onLongPress={() => (onLongPress ?? onOpen)(photo)}
      style={[styles.tile, { width: size, height: size }]}>
      {showImage && !loaded ? <GSkeleton style={[StyleSheet.absoluteFill, styles.tileSkeleton]} /> : null}
      {showImage ? (
        <Image
          source={{ uri: imageUrl! }}
          style={styles.image}
          contentFit="cover"
          transition={220}
          recyclingKey={photo.id}
          onLoad={() => setLoaded(true)}
          onError={() => {
            setFailed(true);
            reportMobileMediaLoadFailure('gallery_photo', imageUrl);
          }}
        />
      ) : (
        <View style={styles.placeholder}>
          <Ionicons name="image-outline" size={24} color={Garden.ink60} />
          <Text style={styles.placeholderText}>Can&apos;t show</Text>
        </View>
      )}
      {badge ? (
        <View
          style={[styles.badge, badge.mine && styles.badgeMine]}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants">
          <Text style={[styles.badgeText, badge.mine && styles.badgeTextMine]} numberOfLines={1}>
            {badge.label}
          </Text>
        </View>
      ) : null}
    </GPressable>
  );
});

/** Grid of pulsing tiles shaped like the real thing. */
export function PhotoGridSkeleton({ tileSize, tiles }: { tileSize: number; tiles: number }) {
  return (
    <View style={styles.grid} accessibilityLabel="Loading photos" accessible>
      {Array.from({ length: tiles }).map((_, index) => (
        <GSkeleton key={index} style={[styles.tileSkeleton, { width: tileSize, height: tileSize }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  day: { gap: 10 },
  dayHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dayLabel: {
    flexShrink: 1,
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 16,
    lineHeight: 21,
    color: Garden.ink,
  },
  countChip: { marginLeft: 'auto' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: PHOTO_GRID_GAP },
  tile: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: Garden.ink06,
    borderWidth: 1,
    borderColor: Garden.ink10,
  },
  tileSkeleton: { borderRadius: 14 },
  image: { width: '100%', height: '100%' },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  badge: {
    position: 'absolute',
    left: 5,
    bottom: 5,
    maxWidth: '86%',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: 'rgba(20,16,12,0.62)',
  },
  badgeMine: { backgroundColor: Garden.butter, borderWidth: 1, borderColor: Garden.ink25 },
  badgeText: { fontFamily: GardenFonts.bodyBold, fontSize: 10.5, color: Garden.white },
  badgeTextMine: { color: Garden.ink, fontFamily: GardenFonts.bodyExtra },
  placeholderText: { fontFamily: GardenFonts.bodyBold, fontSize: 11, color: Garden.soft },
});
