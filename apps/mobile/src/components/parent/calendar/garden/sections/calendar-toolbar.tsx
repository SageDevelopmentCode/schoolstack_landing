import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useCalendarTestId } from '@/components/parent/calendar/garden/calendar-portal';
import { GSegmented, type GSegmentedItem } from '@/components/parent/garden/segmented';
import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { GKicker, GPressable } from '@/components/parent/garden/ui';
import { periodKicker, periodUnit, type CalendarViewMode } from '@/lib/parent/parent-calendar-garden';

function viewItems(tid: (suffix: string) => string): GSegmentedItem<CalendarViewMode>[] {
  return [
    { id: 'day', label: 'Day', icon: 'today-outline', testID: tid('view-day') },
    { id: 'week', label: 'Week', icon: 'calendar-number-outline', testID: tid('view-week') },
    { id: 'month', label: 'Month', icon: 'grid-outline', testID: tid('view-month') },
  ];
}

/**
 * Calendar card header: ‹ › + the period (live region), Today / Back to today,
 * and the Day | Week | Month segmented control. Same callbacks as the Story toolbar.
 */
export function CalendarToolbar({
  viewMode,
  periodLabel,
  summary,
  isCurrentPeriod,
  onViewModeChange,
  onPrev,
  onNext,
  onToday,
}: {
  viewMode: CalendarViewMode;
  periodLabel: string;
  /** Read with the period by screen readers (the visual summary line was removed). */
  summary?: string;
  isCurrentPeriod: boolean;
  onViewModeChange: (mode: CalendarViewMode) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}) {
  const tid = useCalendarTestId();
  const accent = useGardenAccent();
  const unit = periodUnit(viewMode);
  const todayLabel = isCurrentPeriod ? 'Today' : 'Back to today';

  return (
    <View style={styles.container}>
      <GSegmented items={viewItems(tid)} activeId={viewMode} onChange={onViewModeChange} />

      <View style={styles.topRow}>
        <GPressable
          testID={tid('prev')}
          accessibilityLabel={`Previous ${unit}`}
          haptic="select"
          onPress={onPrev}
          style={styles.navButton}>
          <Ionicons name="chevron-back" size={20} color={Garden.ink} />
        </GPressable>

        <View style={styles.periodCopy}>
          <GKicker>{periodKicker(viewMode, isCurrentPeriod)}</GKicker>
          <Text
            accessibilityRole="header"
            accessibilityLabel={summary ? `${periodLabel}. ${summary}` : periodLabel}
            accessibilityLiveRegion="polite"
            style={styles.periodLabel}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}>
            {periodLabel}
          </Text>
          <GPressable
            testID={tid('today')}
            accessibilityLabel={isCurrentPeriod ? 'Go to today' : 'Back to today'}
            accessibilityHint={isCurrentPeriod ? undefined : `Jumps the calendar back to the current ${unit}`}
            haptic="select"
            hitSlop={8}
            onPress={onToday}
            style={[
              styles.todayButton,
              isCurrentPeriod
                ? { backgroundColor: Garden.white, borderColor: Garden.ink25 }
                : { backgroundColor: accent.wash, borderColor: accent.clay },
            ]}>
            <Ionicons
              name={isCurrentPeriod ? 'locate-outline' : 'arrow-undo'}
              size={14}
              color={isCurrentPeriod ? Garden.ink : accent.clayDeep}
            />
            <Text style={[styles.todayLabel, { color: isCurrentPeriod ? Garden.ink : accent.clayDeep }]}>
              {todayLabel}
            </Text>
          </GPressable>
        </View>

        <GPressable
          testID={tid('next')}
          accessibilityLabel={`Next ${unit}`}
          haptic="select"
          onPress={onNext}
          style={styles.navButton}>
          <Ionicons name="chevron-forward" size={20} color={Garden.ink} />
        </GPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: Garden.ink25,
    backgroundColor: Garden.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodCopy: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    gap: 2,
  },
  periodLabel: {
    fontFamily: GardenFonts.display,
    fontSize: 21,
    lineHeight: 25,
    letterSpacing: -0.5,
    color: Garden.ink,
    textAlign: 'center',
  },
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    minHeight: 32,
    marginTop: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  todayLabel: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 13,
  },
});
