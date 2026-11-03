import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StoryCard } from '@/components/story/story-card';
import { StoryChip } from '@/components/story/story-chip';
import { MY_HOURS_CALENDAR_LINE } from '@/components/teacher/my-hours/teacher-my-hours-theme';
import { useParentTheme } from '@/contexts/parent-theme-context';
import {
  addDays,
  formatHoursMinutes,
  formatShortWeekdayDate,
  isSameDay,
  startOfWeekMonday,
} from '@/lib/teacher/my-hours/format-duration';
import { getDayLogForDateKey } from '@/lib/teacher/my-hours/my-hours-page-utils';
import type { MyHoursDayLog } from '@/lib/teacher/my-hours/types';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type TeacherMyHoursWeekPanelProps = {
  entriesByDateKey: Record<string, MyHoursDayLog>;
  focusDate: Date;
  referenceDate: Date;
  onDaySelect: (date: Date) => void;
};

export function TeacherMyHoursWeekPanel({
  entriesByDateKey,
  focusDate,
  referenceDate,
  onDaySelect,
}: TeacherMyHoursWeekPanelProps) {
  const theme = useParentTheme();
  const weekStart = startOfWeekMonday(focusDate);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <StoryCard compact style={styles.card} testID="teacher-my-hours-week-panel">
      <View style={[styles.header, { borderColor: MY_HOURS_CALENDAR_LINE }]}>
        <Text style={[styles.headerTitle, { color: theme.ink }]}>
          Week of {formatShortWeekdayDate(weekStart)}
        </Text>
      </View>
      {days.map((day, index) => {
        const log = getDayLogForDateKey(entriesByDateKey, day);
        const isToday = isSameDay(day, referenceDate);
        const isLast = index === days.length - 1;
        return (
          <Pressable
            key={formatShortWeekdayDate(day)}
            accessibilityRole="button"
            onPress={() => onDaySelect(day)}
            style={({ pressed }) => [
              styles.row,
              !isLast && { borderBottomWidth: 1, borderColor: MY_HOURS_CALENDAR_LINE },
              pressed && styles.pressed,
            ]}>
            <View style={styles.rowLeft}>
              <Text style={[styles.rowLabel, { color: theme.ink }]}>
                {formatShortWeekdayDate(day)}
              </Text>
              {isToday ? <StoryChip label="Today" tone="info" uppercase={false} /> : null}
            </View>
            {log ? (
              <Text style={[styles.rowValue, { color: theme.primary }]}>
                {formatHoursMinutes(log.totalMinutes)} · {log.sessionCount}{' '}
                {log.sessionCount === 1 ? 'session' : 'sessions'}
              </Text>
            ) : (
              <Text style={[styles.rowMuted, { color: theme.muted }]}>Not logged</Text>
            )}
          </Pressable>
        );
      })}
    </StoryCard>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  header: {
    borderBottomWidth: 1,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.four,
  },
  headerTitle: {
    fontFamily: StoryFonts.display,
    fontSize: 18,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.four,
  },
  rowLeft: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.two,
    flex: 1,
    minWidth: 0,
  },
  rowLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 15,
    fontWeight: '600',
  },
  rowValue: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 13,
    fontWeight: '600',
    flexShrink: 0,
  },
  rowMuted: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    flexShrink: 0,
  },
  pressed: {
    opacity: 0.85,
  },
});
