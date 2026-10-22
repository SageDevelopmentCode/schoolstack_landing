import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { GalleryPhotoGridSkeleton } from '@/components/school-admin/gallery/gallery-photo-grid-skeleton';
import { SkeletonPulse } from '@/components/parent/messages/skeleton-pulse';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Story } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

export function PhotosListSkeleton() {
  const { width: windowWidth } = useWindowDimensions();
  const toolbarButtonWidth = Math.min(140, (windowWidth - SCREEN_HORIZONTAL_PADDING * 2 - Spacing.two) / 2);

  return (
    <View style={styles.container} testID="photos-list-skeleton">
      <View style={styles.toolbar}>
        <SkeletonPulse
          style={[styles.toolbarButton, { width: toolbarButtonWidth }]}
          backgroundColor={Story.line}
        />
        <SkeletonPulse
          style={[styles.toolbarButton, { width: toolbarButtonWidth }]}
          backgroundColor={Story.line}
        />
      </View>
      <GalleryPhotoGridSkeleton tileCount={12} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Spacing.two,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    marginBottom: Spacing.three,
  },
  toolbarButton: {
    height: 40,
    borderRadius: 12,
  },
});
