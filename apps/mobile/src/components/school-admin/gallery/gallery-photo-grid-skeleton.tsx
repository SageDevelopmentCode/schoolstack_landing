import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { SkeletonPulse } from '@/components/parent/messages/skeleton-pulse';
import { Story } from '@/constants/story-theme';
import { galleryTileSize } from '@/lib/school-gallery/gallery-grid-layout';

type GalleryPhotoGridSkeletonProps = {
  tileCount?: number;
};

export function GalleryPhotoGridSkeleton({ tileCount = 12 }: GalleryPhotoGridSkeletonProps) {
  const { width: windowWidth } = useWindowDimensions();
  const tileSize = galleryTileSize(windowWidth);

  return (
    <View
      style={styles.grid}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading photos"
      testID="gallery-photo-grid-skeleton">
      {Array.from({ length: tileCount }, (_, index) => (
        <SkeletonPulse
          key={index}
          style={{ width: tileSize, height: tileSize }}
          backgroundColor={Story.line}
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
