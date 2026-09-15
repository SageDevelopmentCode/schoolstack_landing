import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ScheduleMonthCalendarColors } from '@/components/school-admin/schedule/schedule-month-calendar';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { Radius, Spacing } from '@/constants/theme';
import { DAY_NAMES, dateKey, isToday } from '@/lib/school-events/calendar-utils';

type ParentCalendarWeekStripProps = {
  weekDates: Date[];
  selectedDate: string | null;
  today: string;
  eventDates: Set<string>;
  onSelectDate: (date: string) => void;
  colors: ScheduleMonthCalendarColors;
};

export function ParentCalendarWeekStrip({
  weekDates,
  selectedDate,
  today,
  eventDates,
  onSelectDate,
  colors,
}: ParentCalendarWeekStripProps) {
  const theme = useParentTheme();

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {weekDates.map((day) => {
          const key = dateKey(day);
          const selected = selectedDate === key;
          const todayDay = isToday(day, today);
          const hasEvents = eventDates.has(key);

          return (
            <Pressable
              key={key}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onSelectDate(key)}
              style={[
                styles.dayCell,
                selected && { backgroundColor: theme.primarySoft },
              ]}>
              <Text style={[styles.dayName, { color: theme.muted }]}>
                {DAY_NAMES[day.getDay()]}
              </Text>
              <View
                style={[
                  styles.dayNumberWrap,
                  todayDay && { backgroundColor: colors.accent },
                ]}>
                <Text
                  style={[
                    styles.dayNumber,
                    { color: todayDay ? '#FFFFFF' : theme.ink },
                  ]}>
                  {day.getDate()}
                </Text>
              </View>
              {hasEvents ? (
                <View style={[styles.eventDot, { backgroundColor: colors.accent }]} />
              ) : (
                <View style={styles.eventDotPlaceholder} />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
    borderRadius: Radius.md,
    paddingVertical: Spacing.two,
    gap: 4,
  },
  dayName: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  dayNumberWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumber: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '700',
  },
  eventDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  eventDotPlaceholder: {
    width: 5,
    height: 5,
  },
});
