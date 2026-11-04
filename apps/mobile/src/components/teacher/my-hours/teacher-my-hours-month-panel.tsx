import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StoryCard } from '@/components/story/story-card';
import { TeacherMyHoursDateNav } from '@/components/teacher/my-hours/teacher-my-hours-date-nav';
import {
  MY_HOURS_CALENDAR_LINE,
  MY_HOURS_LOGGED_BG,
} from '@/components/teacher/my-hours/teacher-my-hours-theme';
import { useParentTheme } from '@/contexts/parent-theme-context';
import {
  formatHoursMinutes,
  isSameDay,
  toDateKey,
} from '@/lib/teacher/my-hours/format-duration';
import {
  getMonthLogsForMonthDate,
  getMonthSummaryForMonthDate,
} from '@/lib/teacher/my-hours/my-hours-page-utils';
import type { MyHoursDayLog } from '@/lib/teacher/my-hours/types';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type TeacherMyHoursMonthPanelProps = {
  navLabel: string;
  onPreviousDate: () => void;
  onNextDate: () => void;
  entriesByDateKey: Record<string, MyHoursDayLog>;
  monthDate: Date;
  referenceDate: Date;
  onDaySelect: (date: Date) => void;
};

function buildMonthGrid(monthDate: Date): Array<Date | null> {
  const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const leading = monthStart.getDay();
  const grid: Array<Date | null> = [];
  for (let i = 0; i < leading; i++) {
    grid.push(null);
  }
  for (let day = 1; day <= 31; day++) {
    const d = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
    if (d.getMonth() !== monthDate.getMonth()) break;
    grid.push(d);
  }
  while (grid.length % 7 !== 0) {
    grid.push(null);
  }
  return grid;
}

export function TeacherMyHoursMonthPanel({
  navLabel,
  onPreviousDate,
  onNextDate,
  entriesByDateKey,
  monthDate,
  referenceDate,
  onDaySelect,
}: TeacherMyHoursMonthPanelProps) {
  const theme = useParentTheme();
  const summary = getMonthSummaryForMonthDate(entriesByDateKey, monthDate);
  const logs = getMonthLogsForMonthDate(entriesByDateKey, monthDate);
  const grid = buildMonthGrid(monthDate);
  const totalRows = grid.length / 7;

  return (
    <StoryCard compact style={styles.cardOuter} testID="teacher-my-hours-month-panel">
      <TeacherMyHoursDateNav
        label={navLabel}
        onPrevious={onPreviousDate}
        onNext={onNextDate}
        fullWidth
        embedded
      />
      <View style={styles.cardBody}>
      <View style={styles.summaryHeader}>
        <Text style={[styles.monthTitle, { color: theme.ink }]}>{summary.monthLabel}</Text>
        <Text style={[styles.monthMeta, { color: theme.muted }]}>
          {summary.loggedDays} days logged · {formatHoursMinutes(summary.totalMinutes)} total
        </Text>
      </View>

      <View style={[styles.gridWrap, { borderColor: MY_HOURS_CALENDAR_LINE }]}>
        <View style={[styles.weekdayRow, { borderColor: MY_HOURS_CALENDAR_LINE }]}>
          {WEEKDAY_LABELS.map((label) => (
            <Text key={label} style={[styles.weekdayLabel, { color: theme.muted }]}>
              {label}
            </Text>
          ))}
        </View>
        <View style={styles.grid}>
          {grid.map((day, index) => {
            if (!day) {
              const col = index % 7;
              const row = Math.floor(index / 7);
              return (
                <View
                  key={`empty-${index}`}
                  style={[
                    styles.cell,
                    col < 6 && styles.cellBorderRight,
                    row < totalRows - 1 && styles.cellBorderBottom,
                  ]}
                />
              );
            }

            const log = logs[toDateKey(day)];
            const isToday = isSameDay(day, referenceDate);
            const col = index % 7;
            const row = Math.floor(index / 7);

            return (
              <Pressable
                key={toDateKey(day)}
                accessibilityRole="button"
                accessibilityLabel={`View hours for ${day.toLocaleDateString('en-US')}`}
                onPress={() => onDaySelect(day)}
                style={({ pressed }) => [
                  styles.cell,
                  col < 6 && styles.cellBorderRight,
                  row < totalRows - 1 && styles.cellBorderBottom,
                  { backgroundColor: log ? MY_HOURS_LOGGED_BG : theme.white },
                  pressed && styles.pressed,
                ]}>
                <View
                  style={[
                    styles.dayBadge,
                    isToday && { backgroundColor: theme.primary },
                  ]}>
                  <Text
                    style={[
                      styles.dayNumber,
                      { color: isToday ? theme.white : theme.ink },
                    ]}>
                    {day.getDate()}
                  </Text>
                </View>
                {log ? (
                  <Text style={[styles.cellLog, { color: theme.primary }]}>
                    {log.sessionCount} / {formatHoursMinutes(log.totalMinutes)}
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.legend}>
        <LegendSwatch color={MY_HOURS_LOGGED_BG} label="Logged" border />
        <LegendSwatch color={theme.primary} label="Today" round />
        <LegendSwatch color={theme.white} label="Not logged" border />
      </View>
      </View>
    </StoryCard>
  );
}

function LegendSwatch({
  color,
  label,
  border,
  round,
}: {
  color: string;
  label: string;
  border?: boolean;
  round?: boolean;
}) {
  const theme = useParentTheme();
  return (
    <View style={styles.legendItem}>
      <View
        style={[
          styles.legendSwatch,
          round && styles.legendRound,
          {
            backgroundColor: color,
            borderColor: border ? MY_HOURS_CALENDAR_LINE : 'transparent',
            borderWidth: border ? 1 : 0,
          },
        ]}
      />
      <Text style={[styles.legendLabel, { color: theme.muted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cardOuter: {
    overflow: 'hidden',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  cardBody: {
    padding: StoryCardPadding,
    gap: Spacing.four,
  },
  summaryHeader: {
    gap: Spacing.one,
  },
  monthTitle: {
    fontFamily: StoryFonts.display,
    fontSize: 20,
    fontWeight: '600',
  },
  monthMeta: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
  },
  gridWrap: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  weekdayRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingVertical: Spacing.two,
  },
  weekdayLabel: {
    flex: 1,
    textAlign: 'center',
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 11,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    minHeight: 56,
    padding: 6,
    justifyContent: 'flex-start',
  },
  cellBorderRight: {
    borderRightWidth: 1,
    borderColor: MY_HOURS_CALENDAR_LINE,
  },
  cellBorderBottom: {
    borderBottomWidth: 1,
    borderColor: MY_HOURS_CALENDAR_LINE,
  },
  dayBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumber: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 13,
    fontWeight: '600',
  },
  cellLog: {
    marginTop: 4,
    fontFamily: StoryFonts.body,
    fontSize: 9,
    lineHeight: 12,
  },
  pressed: {
    opacity: 0.9,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.four,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  legendSwatch: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendRound: {
    borderRadius: 6,
  },
  legendLabel: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
  },
});
