import { StyleSheet, View } from 'react-native';

import { SkeletonPulse } from '@/components/parent/messages/skeleton-pulse';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Radius, Spacing } from '@/constants/theme';

export function ParentCalendarSkeleton() {
  const theme = useAdminTheme();
  const pulse = theme.border;

  return (
    <View style={styles.container}>
      <View style={styles.periodRow}>
        <SkeletonPulse style={styles.navButton} backgroundColor={pulse} />
        <SkeletonPulse style={styles.periodBar} backgroundColor={pulse} />
        <SkeletonPulse style={styles.navButton} backgroundColor={pulse} />
      </View>

      <View style={styles.toggleRow}>
        <View style={styles.toggleSegments}>
          <SkeletonPulse style={styles.toggleSegment} backgroundColor={pulse} />
          <SkeletonPulse style={styles.toggleSegment} backgroundColor={pulse} />
        </View>
        <SkeletonPulse style={styles.todayPill} backgroundColor={pulse} />
      </View>

      <View style={[styles.weekStripCard, { borderColor: theme.border }]}>
        <View style={styles.weekStripRow}>
          {Array.from({ length: 7 }, (_, index) => (
            <SkeletonPulse key={index} style={styles.weekDayCell} backgroundColor={pulse} />
          ))}
        </View>
      </View>

      <SkeletonPulse style={styles.sectionTitle} backgroundColor={pulse} />
      {Array.from({ length: 3 }, (_, index) => (
        <SkeletonPulse key={index} style={styles.eventRow} backgroundColor={pulse} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    gap: Spacing.three,
  },
  periodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
  },
  periodBar: {
    height: 16,
    flex: 1,
    borderRadius: Radius.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  toggleSegments: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  toggleSegment: {
    height: 36,
    width: 72,
    borderRadius: Radius.md,
  },
  todayPill: {
    height: 36,
    width: 72,
    borderRadius: Radius.pill,
  },
  weekStripCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    padding: Spacing.two,
  },
  weekStripRow: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  weekDayCell: {
    flex: 1,
    height: 72,
    borderRadius: Radius.md,
  },
  sectionTitle: {
    height: 16,
    width: 100,
    borderRadius: Radius.sm,
    marginTop: Spacing.two,
  },
  eventRow: {
    height: 64,
    borderRadius: Radius.lg,
  },
});
