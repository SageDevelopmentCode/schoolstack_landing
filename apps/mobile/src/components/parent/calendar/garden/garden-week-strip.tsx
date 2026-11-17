import { StyleSheet, Text, View } from 'react-native';

import { useCalendarTestId } from '@/components/parent/calendar/garden/calendar-portal';
import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { GPressable } from '@/components/parent/garden/ui';
import { dayA11yLabel, dayDotColors } from '@/lib/parent/parent-calendar-garden';
import { DAY_NAMES, dateKey } from '@/lib/school-events/calendar-utils';
import type { OrganizationEvent } from '@/lib/school-events/types';

/** Coloured dots for a day's events (decorative; counts are in the a11y label). */
export function DayDots({ colors, light = false }: { colors: string[]; light?: boolean }) {
  return (
    <View style={styles.dots} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {colors.length === 0 ? (
        <View style={styles.dotPlaceholder} />
      ) : (
        colors.map((color) => (
          <View
            key={color}
            style={[styles.dot, { backgroundColor: light ? Garden.white : color }]}
          />
        ))
      )}
    </View>
  );
}

/** Seven big day cells. Today: accent ring. Selected: accent fill. Same `onSelectDate` contract as Story. */
export function GardenWeekStrip({
  weekDates,
  selectedDate,
  today,
  eventsByDate,
  onSelectDate,
}: {
  weekDates: Date[];
  selectedDate: string | null;
  today: string;
  eventsByDate: Map<string, OrganizationEvent[]>;
  onSelectDate: (date: string) => void;
}) {
  const tid = useCalendarTestId();
  const accent = useGardenAccent();

  return (
    <View style={styles.row} testID={tid('week-strip')}>
      {weekDates.map((day) => {
        const key = dateKey(day);
        const selected = selectedDate === key;
        const isTodayCell = key === today;
        const dayEvents = eventsByDate.get(key);
        return (
          <GPressable
            key={key}
            accessibilityLabel={dayA11yLabel(day, dayEvents?.length ?? 0, today)}
            accessibilityState={{ selected }}
            haptic="select"
            hitSlop={2}
            onPress={() => onSelectDate(key)}
            style={[
              styles.cell,
              selected
                ? { backgroundColor: accent.clay, borderColor: Garden.ink }
                : isTodayCell
                  ? { backgroundColor: accent.wash, borderColor: accent.clay }
                  : { backgroundColor: Garden.white, borderColor: Garden.ink12 },
            ]}>
            <Text style={[styles.dayName, { color: selected ? 'rgba(255,255,255,0.85)' : Garden.soft }]}>
              {DAY_NAMES[day.getDay()]}
            </Text>
            <Text
              style={[
                styles.dayNumber,
                { color: selected ? Garden.white : isTodayCell ? accent.clayDeep : Garden.ink },
              ]}>
              {day.getDate()}
            </Text>
            <DayDots colors={dayDotColors(dayEvents)} light={selected} />
          </GPressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 5,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    minHeight: 72,
    paddingVertical: 9,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  dayName: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  dayNumber: {
    fontFamily: GardenFonts.display,
    fontSize: 20,
    lineHeight: 24,
  },
  dots: {
    flexDirection: 'row',
    gap: 3,
    height: 6,
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotPlaceholder: {
    width: 6,
    height: 6,
  },
});
