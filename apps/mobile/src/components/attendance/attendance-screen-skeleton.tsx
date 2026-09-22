import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AttendanceSkeletonBlock,
  AttendanceStudentRowSkeleton,
} from '@/components/attendance/attendance-skeleton-blocks';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Story, StoryCardPadding } from '@/constants/story-theme';
import { Radius, Spacing } from '@/constants/theme';

type AttendanceScreenSkeletonProps = {
  rowCount?: number;
  embedded?: boolean;
};

export function AttendanceScreenSkeleton({
  rowCount = 6,
  embedded = false,
}: AttendanceScreenSkeletonProps) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + Spacing.six },
      ]}
      scrollEnabled={false}>
      <View style={styles.headerBlock}>
        {!embedded ? (
          <>
            <AttendanceSkeletonBlock style={styles.title} />
            <AttendanceSkeletonBlock style={styles.subtitle} />
          </>
        ) : null}
        <View style={styles.dateCard}>
          <AttendanceSkeletonBlock style={styles.dateLabel} />
          <AttendanceSkeletonBlock style={styles.dateSubcopy} />
        </View>
        <AttendanceSkeletonBlock style={styles.search} />
        <View style={styles.pillRow}>
          {Array.from({ length: 4 }, (_, index) => (
            <AttendanceSkeletonBlock key={index} style={styles.pill} />
          ))}
        </View>
      </View>

      <View style={styles.list}>
        {Array.from({ length: rowCount }, (_, index) => (
          <AttendanceStudentRowSkeleton key={index} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Story.paper,
  },
  content: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    gap: Spacing.two,
  },
  headerBlock: {
    gap: Spacing.two,
    paddingBottom: Spacing.two,
  },
  title: {
    height: 30,
    width: '50%',
    borderRadius: Radius.sm,
  },
  subtitle: {
    height: 14,
    width: '80%',
    borderRadius: Radius.sm,
  },
  dateCard: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Story.line,
    backgroundColor: Story.white,
    padding: StoryCardPadding,
    alignItems: 'center',
    gap: Spacing.one,
  },
  dateLabel: {
    height: 14,
    width: 120,
    borderRadius: Radius.sm,
  },
  dateSubcopy: {
    height: 11,
    width: 160,
    borderRadius: Radius.sm,
  },
  search: {
    height: 44,
    width: '100%',
    borderRadius: Radius.lg,
  },
  pillRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  pill: {
    height: 32,
    width: 72,
    borderRadius: 9,
  },
  list: {
    gap: Spacing.two,
  },
});
