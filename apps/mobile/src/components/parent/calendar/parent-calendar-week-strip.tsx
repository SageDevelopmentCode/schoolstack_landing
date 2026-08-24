import { Pressable, StyleSheet, View } from 'react-native';

import type { ScheduleMonthCalendarColors } from '@/components/school-admin/schedule/schedule-month-calendar';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
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
  const theme = useAdminTheme();

  return (
    <View style={[styles.container, { borderColor: theme.border, backgroundColor: theme.surface }]}>
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
                selected && { backgroundColor: colors.accentLight },
              ]}>
              <ThemedText type="badge" style={{ color: theme.textTertiary, fontSize: 10 }}>
                {DAY_NAMES[day.getDay()]}
              </ThemedText>
              <View
                style={[
                  styles.dayNumberWrap,
                  todayDay && { backgroundColor: colors.accent },
                ]}>
                <ThemedText
                  type="smallBold"
                  style={{ color: todayDay ? '#FFFFFF' : theme.textPrimary }}>
                  {day.getDate()}
                </ThemedText>
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
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    padding: Spacing.two,
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
  dayNumberWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
