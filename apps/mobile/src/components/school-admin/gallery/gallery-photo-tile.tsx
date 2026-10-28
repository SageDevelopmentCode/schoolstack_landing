import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SkeletonPulse } from '@/components/parent/messages/skeleton-pulse';
import { StoryFonts } from '@/constants/story-theme';
import { Radius } from '@/constants/theme';
import type { GalleryPhoto } from '@/lib/school-gallery/types';

type GalleryPhotoTileProps = {
  photo: GalleryPhoto;
  tileSize: number;
  selectionMode: boolean;
  selected: boolean;
  showUploaderBadge?: boolean;
  onPress: () => void;
  onLongPress: () => void;
};

export function GalleryPhotoTile({
  photo,
  tileSize,
  selectionMode,
  selected,
  showUploaderBadge = true,
  onPress,
  onLongPress,
}: GalleryPhotoTileProps) {
  const imageUrl = photo.imageUrl ?? null;
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageLoaded(false);
    setImageFailed(false);
  }, [imageUrl]);

  const showSkeleton = Boolean(imageUrl) && !imageLoaded && !imageFailed;
  const showImage = Boolean(imageUrl) && !imageFailed;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={photo.fileName}
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.tile,
        { width: tileSize, height: tileSize },
        pressed && styles.pressed,
      ]}>
      {showSkeleton ? (
        <SkeletonPulse
          style={StyleSheet.absoluteFill}
          backgroundColor="#E8ECEE"
        />
      ) : null}
      {showImage ? (
        <Image
          source={{ uri: imageUrl! }}
          style={styles.image}
          contentFit="cover"
          transition={200}
          recyclingKey={photo.id}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <View style={styles.placeholder}>
          <Ionicons name="image-outline" size={28} color="#94A3B8" />
        </View>
      )}
      {selectionMode ? (
        <View
          style={[
            styles.selectionBadge,
            selected ? styles.selectionBadgeSelected : styles.selectionBadgeIdle,
          ]}>
          {selected ? <Ionicons name="checkmark" size={14} color="#FFFFFF" /> : null}
        </View>
      ) : null}
      {!selectionMode && showUploaderBadge && photo.uploadedByName ? (
        <View style={styles.uploaderPill}>
          <Text style={styles.uploaderText} numberOfLines={1}>
            {photo.uploadedByName}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: 0,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
  },
  pressed: {
    opacity: 0.85,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  selectionBadgeIdle: {
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
  },
  selectionBadgeSelected: {
    borderColor: '#FFFFFF',
    backgroundColor: '#059669',
  },
  uploaderPill: {
    position: 'absolute',
    left: 4,
    right: 4,
    bottom: 4,
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  uploaderText: {
    fontFamily: StoryFonts.body,
    fontSize: 10,
    color: '#FFFFFF',
  },
});
