import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { MONTH_NAMES, WEEKDAY_LABELS } from '@/components/school-admin/schedule/schedule-constants';
import {
  buildMonthCalendarWeeks,
  monthDateKey,
} from '@/components/school-admin/schedule/schedule-month-calendar-utils';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Radius, Spacing } from '@/constants/theme';

export type ScheduleMonthCalendarColors = {
  accent: string;
  accentLight: string;
  text: string;
  textFaint: string;
  textSecondary?: string;
  border?: string;
  bg?: string;
  warning: string;
  warningBg: string;
};

type EditableDayState =
  | 'selected'
  | 'disabled'
  | 'openBooked'
  | 'open'
  | 'bookedOnly'
  | 'closed';

function getEditableDayState({
  isSelected,
  isPast,
  hasSlots,
  isBooked,
}: {
  isSelected: boolean;
  isPast: boolean;
  hasSlots: boolean;
  isBooked: boolean;
}): EditableDayState {
  if (isSelected) return 'selected';
  if (isPast) return 'disabled';
  if (hasSlots && isBooked) return 'openBooked';
  if (hasSlots) return 'open';
  if (isBooked) return 'bookedOnly';
  return 'closed';
}

type ScheduleMonthCalendarProps = {
  viewYear: number;
  viewMonth: number;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  availableDates?: Set<string>;
  bookedDates?: Set<string>;
  eventDates?: Set<string>;
  minDate?: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  colors?: ScheduleMonthCalendarColors;
  /** Admin availability mode: closed days are dashed and tappable */
  editable?: boolean;
};

export function ScheduleMonthCalendar({
  viewYear,
  viewMonth,
  selectedDate,
  onSelectDate,
  availableDates,
  bookedDates,
  eventDates,
  minDate,
  onPrevMonth,
  onNextMonth,
  colors: colorsProp,
  editable = false,
}: ScheduleMonthCalendarProps) {
  const theme = useAdminTheme();
  const colors = colorsProp ?? {
    accent: theme.accent,
    accentLight: theme.accentLight,
    text: theme.textPrimary,
    textFaint: theme.textTertiary,
    textSecondary: theme.textSecondary,
    border: theme.border,
    bg: theme.bg,
    warning: theme.warning,
    warningBg: theme.warningBg,
  };

  const weeks = useMemo(
    () => buildMonthCalendarWeeks(viewYear, viewMonth),
    [viewMonth, viewYear],
  );

  return (
    <View style={[styles.container, { borderColor: theme.border, backgroundColor: theme.surface }]}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Previous month" onPress={onPrevMonth} style={styles.navButton}>
          <Ionicons name="chevron-back" size={18} color={theme.textSecondary} />
        </Pressable>
        <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
          {MONTH_NAMES[viewMonth]} {viewYear}
        </ThemedText>
        <Pressable accessibilityRole="button" accessibilityLabel="Next month" onPress={onNextMonth} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.weekdayRow}>
        {WEEKDAY_LABELS.map((label) => (
          <View key={label} style={styles.weekdayCell}>
            <ThemedText type="small" style={{ color: theme.textTertiary }}>
              {label}
            </ThemedText>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {weeks.map((week, weekIndex) => (
          <View key={`week-${weekIndex}`} style={styles.weekRow}>
            {week.map((day, dayIndex) => {
              if (day == null) {
                return <View key={`pad-${weekIndex}-${dayIndex}`} style={styles.padCell} pointerEvents="none" />;
              }

              const key = monthDateKey(viewYear, viewMonth, day);
              const isPast = minDate ? key < minDate : false;
              const isSelected = selectedDate === key;
              const hasSlots = availableDates?.has(key) ?? false;
              const isBooked = bookedDates?.has(key) ?? false;
              const hasEvents = eventDates?.has(key) ?? false;

              if (editable) {
                const state = getEditableDayState({
                  isSelected,
                  isPast,
                  hasSlots,
                  isBooked,
                });

                let backgroundColor = 'transparent';
                let borderColor = 'transparent';
                let borderWidth = 1.5;
                let borderStyle: 'solid' | 'dashed' = 'solid';
                let textColor = colors.text;

                switch (state) {
                  case 'selected':
                    backgroundColor = colors.accent;
                    borderColor = colors.accent;
                    textColor = '#FFFFFF';
                    break;
                  case 'open':
                    backgroundColor = colors.accentLight;
                    borderColor = colors.accent;
                    borderWidth = 2;
                    textColor = colors.accent;
                    break;
                  case 'openBooked':
                    backgroundColor = colors.accentLight;
                    borderColor = colors.accent;
                    borderWidth = 2;
                    textColor = colors.accent;
                    break;
                  case 'bookedOnly':
                    backgroundColor = colors.warningBg;
                    borderColor = colors.warning;
                    borderWidth = 2;
                    textColor = colors.warning;
                    break;
                  case 'closed':
                    backgroundColor = colors.bg ?? theme.bg;
                    borderColor = colors.border ?? theme.border;
                    borderStyle = 'dashed';
                    textColor = colors.textSecondary ?? colors.textFaint;
                    break;
                  case 'disabled':
                  default:
                    textColor = colors.textFaint;
                    break;
                }

                return (
                  <Pressable
                    key={key}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected, disabled: isPast }}
                    disabled={isPast}
                    onPress={() => onSelectDate(key)}
                    style={[
                      styles.dayCell,
                      {
                        backgroundColor,
                        borderColor,
                        borderWidth,
                        borderStyle,
                        opacity: isPast ? 0.35 : 1,
                      },
                    ]}>
                    <ThemedText type="smallBold" style={{ color: textColor }}>
                      {day}
                    </ThemedText>
                    {state === 'openBooked' ? (
                      <View
                        style={[
                          styles.bookedStripe,
                          { backgroundColor: colors.warning },
                        ]}
                      />
                    ) : null}
                  </Pressable>
                );
              }

              let backgroundColor = 'transparent';
              if (isSelected) backgroundColor = colors.accentLight;
              else if (isBooked) backgroundColor = colors.warningBg;
              else if (hasSlots) backgroundColor = colors.accentLight;

              return (
                <Pressable
                  key={key}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected, disabled: isPast }}
                  disabled={isPast}
                  onPress={() => onSelectDate(key)}
                  style={[
                    styles.dayCell,
                    {
                      backgroundColor,
                      borderColor: isSelected ? colors.accent : 'transparent',
                      opacity: isPast ? 0.35 : 1,
                    },
                  ]}>
                  <ThemedText
                    type="smallBold"
                    style={{ color: isSelected ? colors.accent : colors.text }}>
                    {day}
                  </ThemedText>
                  <View style={styles.dotRow}>
                    {hasEvents ? <View style={[styles.dot, { backgroundColor: colors.accent }]} /> : null}
                    {isBooked ? <View style={[styles.dot, { backgroundColor: colors.warning }]} /> : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
  },
  navButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: Spacing.one,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.one,
  },
  grid: {
    gap: Spacing.one,
  },
  weekRow: {
    flexDirection: 'row',
  },
  padCell: {
    flex: 1,
    aspectRatio: 1,
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    paddingVertical: Spacing.one,
    overflow: 'hidden',
  },
  dotRow: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 2,
    minHeight: 6,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  bookedStripe: {
    position: 'absolute',
    left: 6,
    right: 6,
    bottom: 4,
    height: 3,
    borderRadius: 2,
  },
});
