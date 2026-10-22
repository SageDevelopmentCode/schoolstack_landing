import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { GalleryPhotoTile } from '@/components/school-admin/gallery/gallery-photo-tile';
import { galleryTileSize } from '@/lib/school-gallery/gallery-grid-layout';
import type { GalleryPhoto } from '@/lib/school-gallery/types';

type GalleryPhotoGridProps = {
  photos: GalleryPhoto[];
  selectionMode: boolean;
  selectedIds: Set<string>;
  onPressPhoto: (photo: GalleryPhoto) => void;
  onLongPressPhoto: (photo: GalleryPhoto) => void;
};

export function GalleryPhotoGrid({
  photos,
  selectionMode,
  selectedIds,
  onPressPhoto,
  onLongPressPhoto,
}: GalleryPhotoGridProps) {
  const { width: windowWidth } = useWindowDimensions();
  const tileSize = galleryTileSize(windowWidth);

  return (
    <View style={styles.grid}>
      {photos.map((photo) => (
        <GalleryPhotoTile
          key={photo.id}
          photo={photo}
          tileSize={tileSize}
          selectionMode={selectionMode}
          selected={selectedIds.has(photo.id)}
          onPress={() => onPressPhoto(photo)}
          onLongPress={() => onLongPressPhoto(photo)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
