import { StyleSheet, View } from 'react-native';

import { AttendanceSkeletonBlock } from '@/components/attendance/attendance-skeleton-blocks';
import { Story } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type ParentAttendanceSkeletonProps = {
  rowCount?: number;
  rowsOnly?: boolean;
};

function CompactHistoryRowSkeleton() {
  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        <AttendanceSkeletonBlock style={styles.dateBar} />
        <AttendanceSkeletonBlock style={styles.metaBar} />
      </View>
      <AttendanceSkeletonBlock style={styles.chip} />
    </View>
  );
}

function HistoryRowsSkeleton({ rowCount }: { rowCount: number }) {
  return (
    <View style={styles.rows}>
      {Array.from({ length: rowCount }, (_, index) => (
        <CompactHistoryRowSkeleton key={index} />
      ))}
    </View>
  );
}

function PillStripSkeleton() {
  return (
    <View style={styles.pillStrip}>
      <AttendanceSkeletonBlock style={styles.pill} />
      <AttendanceSkeletonBlock style={styles.pill} />
    </View>
  );
}

export function ParentAttendanceSkeleton({
  rowCount = 9,
  rowsOnly = false,
}: ParentAttendanceSkeletonProps) {
  if (rowsOnly) {
    return (
      <View testID="parent-attendance-history-loading">
        <HistoryRowsSkeleton rowCount={rowCount} />
      </View>
    );
  }

  return (
    <View style={styles.container} testID="parent-attendance-skeleton">
      <View style={styles.headerBlock}>
        <AttendanceSkeletonBlock style={styles.kicker} />
        <AttendanceSkeletonBlock style={styles.title} />
        <AttendanceSkeletonBlock style={styles.subtitle} />
        <PillStripSkeleton />
      </View>
      <AttendanceSkeletonBlock style={styles.panelTitle} />
      <HistoryRowsSkeleton rowCount={rowCount} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Story.paper,
    gap: Spacing.four,
    paddingTop: Spacing.two,
  },
  headerBlock: {
    gap: Spacing.two,
  },
  kicker: {
    width: 88,
    height: 12,
    borderRadius: 6,
  },
  title: {
    width: 180,
    height: 28,
    borderRadius: 8,
  },
  subtitle: {
    width: 260,
    height: 14,
    borderRadius: 6,
  },
  pillStrip: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  pill: {
    flex: 1,
    height: 36,
    borderRadius: 999,
  },
  panelTitle: {
    width: 120,
    height: 16,
    borderRadius: 6,
  },
  rows: {
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Story.line,
  },
  copy: {
    flex: 1,
    gap: 6,
  },
  dateBar: {
    width: 96,
    height: 12,
    borderRadius: 6,
  },
  metaBar: {
    width: 128,
    height: 10,
    borderRadius: 6,
  },
  chip: {
    width: 64,
    height: 20,
    borderRadius: 999,
  },
});
