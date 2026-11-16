import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { GPressable } from '@/components/parent/garden/ui';
import { MONTH_NAMES, WEEKDAY_LABELS } from '@/components/school-admin/schedule/schedule-constants';
import { buildMonthCalendarWeeks, monthDateKey } from '@/components/school-admin/schedule/schedule-month-calendar-utils';
import { haptic } from '@/lib/haptics';

const BOOKED = { fg: '#8A5A00', bg: '#FFF3C4', line: '#E2B33C' };

type DayState = 'selected' | 'disabled' | 'openBooked' | 'open' | 'bookedOnly' | 'closed';

function editableDayState(isSelected: boolean, isPast: boolean, hasSlots: boolean, isBooked: boolean): DayState {
  if (isSelected) return 'selected';
  if (isPast) return 'disabled';
  if (hasSlots && isBooked) return 'openBooked';
  if (hasSlots) return 'open';
  if (isBooked) return 'bookedOnly';
  return 'closed';
}

function dayLabel(key: string, state: DayState | 'dot', hasEvents: boolean, isBooked: boolean, hasSlots: boolean): string {
  const date = new Date(`${key}T12:00:00`);
  const spoken = date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  const parts = [spoken];
  if (hasSlots) parts.push('open');
  if (isBooked) parts.push('has a booking');
  if (hasEvents) parts.push('has events');
  if (state === 'disabled') parts.push('past');
  return parts.join(', ');
}

/**
 * Garden month grid for Schedule (same states as `ScheduleMonthCalendar`).
 * `editable`: availability mode (open = accent wash, booked = butter, open +
 * booked = stripe, closed = dashed, past disabled). Otherwise dot mode for
 * events and bookings.
 */
export function AdminScheduleMonthGrid({
  viewYear,
  viewMonth,
  selectedDate,
  onSelectDate,
  availableDates,
  bookedDates,
  eventDates,
  minDate,
  today,
  onPrevMonth,
  onNextMonth,
  onToday,
  editable = false,
  loading = false,
}: {
  viewYear: number;
  viewMonth: number;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  availableDates?: Set<string>;
  bookedDates?: Set<string>;
  eventDates?: Set<string>;
  minDate?: string;
  today?: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday?: () => void;
  editable?: boolean;
  loading?: boolean;
}) {
  const accent = useGardenAccent();
  const weeks = useMemo(() => buildMonthCalendarWeeks(viewYear, viewMonth), [viewMonth, viewYear]);
  const showingTodayMonth = today ? today.startsWith(`${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`) : true;

  return (
    <View style={[styles.card, loading && styles.loading]}>
      <View style={styles.header}>
        <GPressable accessibilityLabel="Previous month" haptic="select" onPress={onPrevMonth} style={styles.nav}>
          <Ionicons name="chevron-back" size={18} color={Garden.ink} />
        </GPressable>
        <View style={styles.monthWrap}>
          <Text style={styles.month} accessibilityRole="header">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </Text>
          {onToday && !showingTodayMonth ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Jump to today" hitSlop={8} onPress={onToday}>
              <Text style={[styles.today, { color: accent.clayDeep }]}>Today</Text>
            </Pressable>
          ) : null}
        </View>
        <GPressable accessibilityLabel="Next month" haptic="select" onPress={onNextMonth} style={styles.nav}>
          <Ionicons name="chevron-forward" size={18} color={Garden.ink} />
        </GPressable>
      </View>

      <View style={styles.weekRow}>
        {WEEKDAY_LABELS.map((label) => (
          <Text key={label} style={styles.weekday}>
            {label}
          </Text>
        ))}
      </View>

      {weeks.map((week, weekIndex) => (
        <View key={`week-${weekIndex}`} style={styles.weekRow}>
          {week.map((day, dayIndex) => {
            if (day == null) return <View key={`pad-${weekIndex}-${dayIndex}`} style={styles.cell} pointerEvents="none" />;
            const key = monthDateKey(viewYear, viewMonth, day);
            const isPast = minDate ? key < minDate : false;
            const isSelected = selectedDate === key;
            const hasSlots = availableDates?.has(key) ?? false;
            const isBooked = bookedDates?.has(key) ?? false;
            const hasEvents = eventDates?.has(key) ?? false;
            const isToday = today === key;

            if (editable) {
              const state = editableDayState(isSelected, isPast, hasSlots, isBooked);
              const look =
                state === 'selected'
                  ? { bg: accent.clay, border: accent.clay, fg: Garden.white, dashed: false }
                  : state === 'open' || state === 'openBooked'
                    ? { bg: accent.peach, border: accent.clay, fg: accent.clayDeep, dashed: false }
                    : state === 'bookedOnly'
                      ? { bg: BOOKED.bg, border: BOOKED.line, fg: BOOKED.fg, dashed: false }
                      : state === 'closed'
                        ? { bg: Garden.white, border: Garden.ink15, fg: Garden.soft, dashed: true }
                        : { bg: 'transparent', border: 'transparent', fg: Garden.ink60, dashed: false };
              return (
                <Pressable
                  key={key}
                  accessibilityRole="button"
                  accessibilityLabel={dayLabel(key, state, hasEvents, isBooked, hasSlots)}
                  accessibilityState={{ selected: isSelected, disabled: isPast }}
                  disabled={isPast}
                  onPress={() => {
                    haptic.select();
                    onSelectDate(key);
                  }}
                  style={({ pressed }) => [
                    styles.cell,
                    styles.day,
                    {
                      backgroundColor: look.bg,
                      borderColor: look.border,
                      borderStyle: look.dashed ? 'dashed' : 'solid',
                      opacity: isPast ? 0.35 : 1,
                      transform: [{ scale: pressed ? 0.94 : 1 }],
                    },
                  ]}>
                  <Text style={[styles.dayText, { color: look.fg }, isToday && styles.todayText]}>{day}</Text>
                  {state === 'openBooked' ? <View style={[styles.stripe, { backgroundColor: BOOKED.line }]} /> : null}
                </Pressable>
              );
            }

            const bg = isSelected ? accent.peach : isBooked ? BOOKED.bg : hasSlots ? accent.peach : 'transparent';
            return (
              <Pressable
                key={key}
                accessibilityRole="button"
                accessibilityLabel={dayLabel(key, isPast ? 'disabled' : 'dot', hasEvents, isBooked, hasSlots)}
                accessibilityState={{ selected: isSelected, disabled: isPast }}
                disabled={isPast}
                onPress={() => {
                  haptic.select();
                  onSelectDate(key);
                }}
                style={({ pressed }) => [
                  styles.cell,
                  styles.day,
                  {
                    backgroundColor: bg,
                    borderColor: isSelected ? accent.clay : isToday ? Garden.ink25 : 'transparent',
                    opacity: isPast ? 0.35 : 1,
                    transform: [{ scale: pressed ? 0.94 : 1 }],
                  },
                ]}>
                <Text style={[styles.dayText, { color: isSelected ? accent.clayDeep : Garden.ink }, isToday && styles.todayText]}>{day}</Text>
                <View style={styles.dots}>
                  {hasEvents ? <View style={[styles.dot, { backgroundColor: accent.clay }]} /> : null}
                  {isBooked ? <View style={[styles.dot, { backgroundColor: BOOKED.line }]} /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

/** Legend for the availability grid (copy from the Story legend). */
export function AdminScheduleLegend({ openLabel }: { openLabel: string }) {
  const accent = useGardenAccent();
  return (
    <View style={styles.legend} accessibilityRole="summary">
      <LegendItem swatch={<View style={[styles.swatch, styles.swatchClosed]} />} label="Not open" />
      <LegendItem swatch={<View style={[styles.swatch, { backgroundColor: accent.peach, borderColor: accent.clay }]} />} label={openLabel} />
      <LegendItem swatch={<View style={[styles.swatch, { backgroundColor: BOOKED.bg, borderColor: BOOKED.line }]} />} label="Has booking" />
    </View>
  );
}

function LegendItem({ swatch, label }: { swatch: React.ReactNode; label: string }) {
  return (
    <View style={styles.legendItem}>
      {swatch}
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: Garden.ink12,
    backgroundColor: Garden.white,
    padding: 12,
    gap: 4,
  },
  loading: { opacity: 0.6 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  nav: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: Garden.ink12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Garden.paper,
  },
  monthWrap: { alignItems: 'center', gap: 2 },
  month: { fontFamily: GardenFonts.display, fontSize: 19, color: Garden.ink },
  today: { fontFamily: GardenFonts.bodyExtra, fontSize: 12.5 },
  weekRow: { flexDirection: 'row' },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontFamily: GardenFonts.bodyBold,
    fontSize: 11.5,
    color: Garden.soft,
    paddingVertical: 4,
  },
  cell: { flex: 1, aspectRatio: 1, margin: 2 },
  day: { borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  dayText: { fontFamily: GardenFonts.bodyExtra, fontSize: 14, fontVariant: ['tabular-nums'] },
  todayText: { textDecorationLine: 'underline' },
  stripe: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 4 },
  dots: { flexDirection: 'row', gap: 3, height: 5, marginTop: 2 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendLabel: { fontFamily: GardenFonts.bodyBold, fontSize: 12.5, color: Garden.soft },
  swatch: { width: 16, height: 16, borderRadius: 5, borderWidth: 1.5 },
  swatchClosed: { borderStyle: 'dashed', borderColor: Garden.ink25, backgroundColor: Garden.white },
});
