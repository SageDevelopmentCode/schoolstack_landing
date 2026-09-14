import { StyleSheet, View } from 'react-native';

import { Story } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Radius, Spacing } from '@/constants/theme';

function SkeletonBlock({ width, height }: { width: number | `${number}%`; height: number }) {
  return (
    <View
      style={{
        width,
        height,
        borderRadius: Radius.sm,
        backgroundColor: Story.line,
        opacity: 0.65,
      }}
    />
  );
}

export function ScheduleScreenSkeleton() {
  return (
    <View style={styles.container}>
      <SkeletonBlock width="34%" height={12} />
      <SkeletonBlock width="52%" height={32} />
      <SkeletonBlock width="78%" height={14} />
      <View style={styles.pillTrack}>
        {[1, 2, 3, 4, 5].map((item) => (
          <SkeletonBlock key={item} width={72} height={32} />
        ))}
      </View>
      <View style={styles.metricGrid}>
        <SkeletonBlock width="48%" height={96} />
        <SkeletonBlock width="48%" height={96} />
        <SkeletonBlock width="48%" height={96} />
      </View>
      <SkeletonBlock width="100%" height={220} />
      <SkeletonBlock width="100%" height={160} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.two,
    gap: Spacing.three,
  },
  pillTrack: {
    flexDirection: 'row',
    gap: Spacing.two,
    backgroundColor: '#EAF2EB',
    borderRadius: 12,
    padding: 4,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
});
