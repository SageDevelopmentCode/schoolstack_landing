import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { GCard, GChip, GPressable } from '@/components/parent/garden/ui';
import { sessionCountLabel } from '@/components/teacher/my-hours/garden/adjust-validation';
import {
  addDays,
  formatHoursMinutes,
  formatLongWeekdayDate,
  formatShortWeekdayDate,
  startOfWeekMonday,
  toDateKey,
} from '@/lib/teacher/my-hours/format-duration';
import type { MyHoursDayLog } from '@/lib/teacher/my-hours/types';

/**
 * Week view: Monday to Sunday on notebook paper. Each row shows the day's
 * hours with a slim bar against the day's share of the weekly goal; the
 * whole row opens that day.
 */
export function WeekViewCard({
  entriesByDateKey,
  focusDate,
  referenceDate,
  dailyGoalMinutes,
  onDaySelect,
  index,
}: {
  entriesByDateKey: Record<string, MyHoursDayLog>;
  focusDate: Date;
  referenceDate: Date;
  /** Weekly goal ÷ working days; 0 hides the bars. */
  dailyGoalMinutes: number;
  onDaySelect: (date: Date) => void;
  index?: number;
}) {
  const accent = useGardenAccent();
  const weekStart = startOfWeekMonday(focusDate);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const referenceKey = toDateKey(referenceDate);
  const total = days.reduce((sum, day) => sum + (entriesByDateKey[toDateKey(day)]?.totalMinutes ?? 0), 0);
  const loggedDays = days.filter((day) => entriesByDateKey[toDateKey(day)]).length;

  return (
    <GCard
      index={index}
      title="Your week"
      action={<GChip tone={total > 0 ? 'success' : 'neutral'} label={total > 0 ? formatHoursMinutes(total) : 'Nothing yet'} />}
      testID="teacher-my-hours-week-panel">
      <Text style={styles.meta}>
        {loggedDays > 0 ? `${loggedDays} ${loggedDays === 1 ? 'day' : 'days'} logged · tap a day for its sessions` : 'Tap a day to see or add its hours.'}
      </Text>
      <View style={styles.paper}>
        {days.map((day, i) => {
          const dateKey = toDateKey(day);
          const log = entriesByDateKey[dateKey] ?? null;
          const isToday = dateKey === referenceKey;
          const isFuture = dateKey > referenceKey;
          const fill = dailyGoalMinutes > 0 && log ? Math.min(1, log.totalMinutes / dailyGoalMinutes) : 0;
          const summary = log ? `${formatHoursMinutes(log.totalMinutes)} · ${sessionCountLabel(log.sessionCount)}` : 'Not logged';
          return (
            <GPressable
              key={dateKey}
              accessibilityLabel={`View hours for ${formatLongWeekdayDate(day)}. ${summary}${isToday ? '. Today' : ''}`}
              haptic="select"
              pressedScale={0.985}
              onPress={() => onDaySelect(day)}
              style={[styles.row, i > 0 && styles.divider, isToday && { backgroundColor: accent.wash }]}>
              <View style={styles.rowMain}>
                <View style={styles.rowTitle}>
                  <Text style={[styles.day, isFuture && styles.dim]}>{formatShortWeekdayDate(day)}</Text>
                  {isToday ? <GChip label="Today" tone="info" /> : null}
                </View>
                <Text style={[styles.summary, log ? styles.summaryOn : null]}>{summary}</Text>
                {dailyGoalMinutes > 0 && !isFuture ? (
                  <View style={styles.track}>
                    <View
                      style={[
                        styles.fill,
                        { width: `${Math.round(fill * 100)}%`, backgroundColor: fill >= 1 ? Garden.forest : accent.clay },
                      ]}
                    />
                  </View>
                ) : null}
              </View>
              <Ionicons name="chevron-forward" size={18} color={Garden.ink60} />
            </GPressable>
          );
        })}
      </View>
    </GCard>
  );
}

const styles = StyleSheet.create({
  meta: { fontFamily: GardenFonts.bodySemi, fontSize: 13, color: Garden.soft, marginBottom: 10 },
  paper: {
    backgroundColor: Garden.notebook,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Garden.ink10,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 60,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  divider: { borderTopWidth: 1, borderTopColor: Garden.ink10 },
  rowMain: { flex: 1, minWidth: 0, gap: 4 },
  rowTitle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  day: { fontFamily: GardenFonts.bodyExtra, fontSize: 15, color: Garden.ink },
  dim: { color: Garden.soft },
  summary: { fontFamily: GardenFonts.bodySemi, fontSize: 13, color: Garden.soft, fontVariant: ['tabular-nums'] },
  summaryOn: { color: Garden.ink, fontFamily: GardenFonts.bodyBold },
  track: { height: 6, borderRadius: 999, backgroundColor: Garden.ink06, overflow: 'hidden', marginTop: 2 },
  fill: { height: '100%', borderRadius: 999 },
});
