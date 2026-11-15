import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { DayDots } from '@/components/parent/calendar/garden/garden-week-strip';
import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { GPressable } from '@/components/parent/garden/ui';
import { dayA11yLabel, dayDotColors, monthGridDates } from '@/lib/parent/parent-calendar-garden';
import { DAY_NAMES, dateKey } from '@/lib/school-events/calendar-utils';
import type { OrganizationEvent } from '@/lib/school-events/types';

/**
 * Garden month grid (parent only; admin keeps `ScheduleMonthCalendar`). Same
 * `onSelectDate` contract. Days outside the month are muted but still tappable.
 */
export function GardenMonthGrid({
  year,
  month,
  selectedDate,
  today,
  eventsByDate,
  onSelectDate,
}: {
  year: number;
  month: number;
  selectedDate: string | null;
  today: string;
  eventsByDate: Map<string, OrganizationEvent[]>;
  onSelectDate: (date: string) => void;
}) {
  const accent = useGardenAccent();
  const cells = useMemo(() => monthGridDates(year, month), [month, year]);
  const weeks = useMemo(() => {
    const rows: Date[][] = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    return rows;
  }, [cells]);

  return (
    <View testID="parent-calendar-month-grid">
      <View style={styles.weekdays} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {DAY_NAMES.map((name) => (
          <Text key={name} style={styles.weekday}>
            {name.slice(0, 2)}
          </Text>
        ))}
      </View>
      <View style={styles.rows}>
        {weeks.map((week) => (
          <View key={dateKey(week[0])} style={styles.row}>
            {week.map((day) => {
              const key = dateKey(day);
              const inMonth = day.getMonth() === month;
              const selected = selectedDate === key;
              const isTodayCell = key === today;
              const dayEvents = eventsByDate.get(key);
              return (
                <GPressable
                  key={key}
                  accessibilityLabel={dayA11yLabel(day, dayEvents?.length ?? 0, today)}
                  accessibilityState={{ selected }}
                  haptic="select"
                  hitSlop={0}
                  pressedScale={0.92}
                  onPress={() => onSelectDate(key)}
                  style={[
                    styles.cell,
                    selected
                      ? { backgroundColor: accent.clay, borderColor: Garden.ink }
                      : isTodayCell
                        ? { backgroundColor: accent.wash, borderColor: accent.clay }
                        : { borderColor: 'transparent' },
                  ]}>
                  <Text
                    style={[
                      styles.dayNumber,
                      {
                        color: selected
                          ? Garden.white
                          : isTodayCell
                            ? accent.clayDeep
                            : inMonth
                              ? Garden.ink
                              : Garden.ink25,
                      },
                    ]}>
                    {day.getDate()}
                  </Text>
                  <DayDots colors={inMonth ? dayDotColors(dayEvents) : []} light={selected} />
                </GPressable>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  weekdays: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: Garden.soft,
  },
  rows: {
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 4,
  },
  cell: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  dayNumber: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 15,
    lineHeight: 19,
  },
});
