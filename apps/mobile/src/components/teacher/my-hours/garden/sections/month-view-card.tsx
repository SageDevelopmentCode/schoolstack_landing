import { StyleSheet, Text, View } from 'react-native';

import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { GCard, GChip, GPressable } from '@/components/parent/garden/ui';
import { sessionCountLabel } from '@/components/teacher/my-hours/garden/adjust-validation';
import { buildMonthGrid, WEEKDAY_INITIALS, WEEKDAY_NAMES } from '@/components/teacher/my-hours/garden/month-grid';
import { formatHoursMinutes, formatLongWeekdayDate, toDateKey } from '@/lib/teacher/my-hours/format-duration';
import {
  getMonthLogsForMonthDate,
  getMonthSummaryForMonthDate,
} from '@/lib/teacher/my-hours/my-hours-page-utils';
import type { MyHoursDayLog } from '@/lib/teacher/my-hours/types';

/** Compact hours for a calendar cell: "7h", "6.5h", "45m". */
function cellHours(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = minutes / 60;
  return Number.isInteger(hours) ? `${hours}h` : `${hours.toFixed(1)}h`;
}

/**
 * Month view: a Sunday-first calendar. Logged days are mint with their hours,
 * today has an accent ring, and every day opens its Day view.
 */
export function MonthViewCard({
  entriesByDateKey,
  monthDate,
  referenceDate,
  onDaySelect,
  index,
}: {
  entriesByDateKey: Record<string, MyHoursDayLog>;
  monthDate: Date;
  referenceDate: Date;
  onDaySelect: (date: Date) => void;
  index?: number;
}) {
  const accent = useGardenAccent();
  const summary = getMonthSummaryForMonthDate(entriesByDateKey, monthDate);
  const logs = getMonthLogsForMonthDate(entriesByDateKey, monthDate);
  const grid = buildMonthGrid(monthDate);
  const referenceKey = toDateKey(referenceDate);

  return (
    <GCard index={index} title="Your month" testID="teacher-my-hours-month-panel">
      <View style={styles.chips}>
        <GChip
          tone={summary.loggedDays > 0 ? 'success' : 'neutral'}
          icon="calendar-outline"
          label={`${summary.loggedDays} ${summary.loggedDays === 1 ? 'day' : 'days'} logged`}
        />
        <GChip tone="neutral" icon="time-outline" label={`${formatHoursMinutes(summary.totalMinutes)} total`} />
      </View>

      <View style={styles.weekHead} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {WEEKDAY_INITIALS.map((label, i) => (
          <Text key={WEEKDAY_NAMES[i]} style={styles.weekLabel}>
            {label}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {grid.map((day, i) => {
          if (!day) return <View key={`blank-${i}`} style={styles.cell} />;
          const dateKey = toDateKey(day);
          const log = logs[dateKey];
          const isToday = dateKey === referenceKey;
          const isFuture = dateKey > referenceKey;
          return (
            <View key={dateKey} style={styles.cell}>
              <GPressable
                accessibilityLabel={`View hours for ${formatLongWeekdayDate(day)}${
                  log ? `. ${formatHoursMinutes(log.totalMinutes)}, ${sessionCountLabel(log.sessionCount)}` : '. Not logged'
                }${isToday ? '. Today' : ''}`}
                haptic="select"
                pressedScale={0.92}
                onPress={() => onDaySelect(day)}
                style={[
                  styles.dayButton,
                  log ? styles.logged : null,
                  isToday ? { borderColor: accent.clay, borderWidth: 2 } : null,
                ]}>
                <Text style={[styles.dayNum, isFuture && styles.future, isToday && { color: accent.clayDeep }]}>
                  {day.getDate()}
                </Text>
                {log ? <Text style={styles.dayHours}>{cellHours(log.totalMinutes)}</Text> : null}
              </GPressable>
            </View>
          );
        })}
      </View>

      <View style={styles.legend} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Legend swatch={[styles.swatch, styles.logged]} label="Logged" />
        <Legend swatch={[styles.swatch, { borderColor: accent.clay, borderWidth: 2 }]} label="Today" />
        <Legend swatch={[styles.swatch, styles.swatchOff]} label="Not logged" />
      </View>
    </GCard>
  );
}

function Legend({ swatch, label }: { swatch: object[]; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={swatch} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  weekHead: { flexDirection: 'row', marginBottom: 4 },
  weekLabel: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 11,
    letterSpacing: 1,
    color: Garden.soft,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, padding: 2 },
  dayButton: {
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Garden.white,
    borderWidth: 1,
    borderColor: Garden.ink10,
    gap: 1,
  },
  logged: { backgroundColor: Garden.mint, borderColor: 'rgba(46,74,60,0.25)' },
  dayNum: { fontFamily: GardenFonts.bodyExtra, fontSize: 14, color: Garden.ink, fontVariant: ['tabular-nums'] },
  future: { color: Garden.ink60 },
  dayHours: { fontFamily: GardenFonts.bodyBold, fontSize: 10.5, color: Garden.forest, fontVariant: ['tabular-nums'] },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch: { width: 14, height: 14, borderRadius: 4, borderWidth: 1, borderColor: Garden.ink15 },
  swatchOff: { backgroundColor: Garden.white },
  legendLabel: { fontFamily: GardenFonts.bodySemi, fontSize: 12.5, color: Garden.soft },
});
