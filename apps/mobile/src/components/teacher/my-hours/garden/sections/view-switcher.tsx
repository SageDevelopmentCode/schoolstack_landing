import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { GSegmented, type GSegmentedItem } from '@/components/parent/garden/segmented';
import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { GChip, GLink, GPressable } from '@/components/parent/garden/ui';
import type { MyHoursView } from '@/lib/teacher/my-hours/types';

const VIEW_ITEMS: GSegmentedItem<MyHoursView>[] = [
  { id: 'day', label: 'Day', icon: 'sunny-outline', testID: 'teacher-my-hours-view-day' },
  { id: 'week', label: 'Week', icon: 'calendar-outline', testID: 'teacher-my-hours-view-week' },
  { id: 'month', label: 'Month', icon: 'calendar-number-outline', testID: 'teacher-my-hours-view-month' },
  { id: 'adjust', label: 'Adjust', icon: 'pencil-outline', testID: 'teacher-my-hours-view-adjust' },
];

const PAGER_UNIT: Record<MyHoursView, string> = {
  day: 'day',
  week: 'week',
  month: 'month',
  adjust: 'week',
};

/** Day / Week / Month / Adjust, then a pager: ‹ label › with Today / Back to today. */
export function ViewSwitcher({
  view,
  onViewChange,
  navLabel,
  showingToday,
  onPrevious,
  onNext,
  onToday,
}: {
  view: MyHoursView;
  onViewChange: (view: MyHoursView) => void;
  navLabel: string;
  showingToday: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}) {
  const accent = useGardenAccent();
  const unit = PAGER_UNIT[view];
  return (
    <View style={styles.root}>
      <View testID="teacher-my-hours-view-nav">
        <GSegmented
          items={VIEW_ITEMS}
          activeId={view}
          onChange={onViewChange}
          accessibilityLabel="Hours view"
          compact
        />
      </View>
      <View style={styles.pager} testID="teacher-my-hours-date-nav">
        <GPressable
          accessibilityLabel="Previous date"
          accessibilityHint={`Shows the previous ${unit}`}
          haptic="select"
          onPress={onPrevious}
          style={styles.arrow}>
          <Ionicons name="chevron-back" size={20} color={accent.clayDeep} />
        </GPressable>
        <View style={styles.center} accessibilityLiveRegion="polite">
          <Text style={styles.label} numberOfLines={1}>
            {navLabel}
          </Text>
          {showingToday ? (
            <GChip
              label={view === 'day' ? 'Today' : view === 'month' ? 'This month' : 'This week'}
              tone="info"
              style={styles.centered}
            />
          ) : (
            <GLink
              label="Back to today"
              icon="return-down-back"
              onPress={onToday}
              accessibilityHint="Jumps to today"
              style={styles.centered}
            />
          )}
        </View>
        <GPressable
          accessibilityLabel="Next date"
          accessibilityHint={`Shows the next ${unit}`}
          haptic="select"
          onPress={onNext}
          style={styles.arrow}>
          <Ionicons name="chevron-forward" size={20} color={accent.clayDeep} />
        </GPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 12 },
  pager: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 22,
    backgroundColor: Garden.white,
    borderWidth: 1.5,
    borderColor: Garden.ink10,
  },
  arrow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Garden.paper,
    borderWidth: 1.5,
    borderColor: Garden.ink15,
  },
  center: { flex: 1, minWidth: 0, alignItems: 'center', gap: 4 },
  centered: { alignSelf: 'center' },
  label: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 16,
    color: Garden.ink,
    fontVariant: ['tabular-nums'],
  },
});
