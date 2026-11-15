import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { GSegmented } from '@/components/parent/garden/segmented';
import { GStepList } from '@/components/parent/garden/steps';
import { CHIP_TONES, Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import {
  DateStamp,
  GCard,
  GChip,
  GDashedRule,
  GErrorCard,
  GHand,
  GKicker,
  GOutlineButton,
  GPressable,
  GSkeleton,
  gText,
} from '@/components/parent/garden/ui';
import { formatAttendanceHistoryDateLabel } from '@/lib/attendance/attendance-history-display';
import type { AttendanceHistoryEntry, AttendanceRecordStatus } from '@/lib/attendance/attendance-types';
import {
  attendanceDayTimeline,
  attendanceMetaLine,
  attendanceRelativeDayLabel,
  attendanceStatusLabel,
  attendanceStatusTone,
  attendanceWeekDayA11yLabel,
  type AttendanceFilter,
  type AttendanceMonthGroup,
  type AttendanceRecentWeeks,
  type AttendanceStatusCounts,
} from '@/lib/parent/parent-attendance-garden';
import { childFirstName } from '@/lib/parent/parent-children-utils';
import type { ParentAttendanceEligibleChild } from '@/lib/parent/parent-portal-api';

const STATUS_ICON: Record<AttendanceRecordStatus, keyof typeof Ionicons.glyphMap> = {
  present: 'checkmark',
  absent: 'close',
  picked_up: 'car-outline',
};

export function AttendanceStatusChip({ status }: { status: AttendanceRecordStatus }) {
  return (
    <GChip
      label={attendanceStatusLabel(status)}
      tone={attendanceStatusTone(status)}
      icon={STATUS_ICON[status]}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Child switcher                                                      */
/* ------------------------------------------------------------------ */

export function AttendanceChildSwitcher({
  learners,
  selectedApplicationId,
  onSelect,
}: {
  learners: ParentAttendanceEligibleChild[];
  selectedApplicationId: string;
  onSelect: (applicationId: string) => void;
}) {
  if (learners.length < 2) return null;
  return (
    <GSegmented
      scrollable={learners.length > 3}
      accessibilityLabel="Select learner"
      items={learners.map((child) => ({
        id: child.applicationId,
        label: childFirstName(child.studentName),
        icon: 'person-outline' as const,
        testID: `parent-attendance-child-${child.applicationId}`,
      }))}
      activeId={selectedApplicationId}
      onChange={onSelect}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Latest day                                                          */
/* ------------------------------------------------------------------ */

export function AttendanceLatestDayCard({
  entry,
  firstName,
  onOpen,
}: {
  entry: AttendanceHistoryEntry;
  firstName: string;
  onOpen: (entry: AttendanceHistoryEntry) => void;
}) {
  const relative = attendanceRelativeDayLabel(entry.date);
  const timeline = attendanceDayTimeline(entry);
  return (
    <GCard kicker="Latest day" title={relative} index={1} testID="parent-attendance-latest-day">
      <GPressable
        accessibilityLabel={`${firstName}'s latest day, ${relative}, ${attendanceStatusLabel(
          entry.status,
        )}. Open details`}
        pressedScale={0.99}
        onPress={() => onOpen(entry)}
        style={styles.latest}>
        <DateStamp date={entry.date} size="md" />
        <GDashedRule vertical color={Garden.ink25} style={{ maxHeight: 96 }} />
        <View style={styles.latestCopy}>
          <AttendanceStatusChip status={entry.status} />
          {timeline.map((step) => (
            <View key={step.key} style={styles.latestStep}>
              <Text style={gText.itemTitle}>{step.label}</Text>
              <Text style={gText.meta}>
                {[step.time, step.detail].filter(Boolean).join(' · ') || 'No time recorded'}
              </Text>
            </View>
          ))}
        </View>
        <Ionicons name="chevron-forward" size={18} color={Garden.ink60} />
      </GPressable>
    </GCard>
  );
}

/* ------------------------------------------------------------------ */
/* Recent weeks                                                        */
/* ------------------------------------------------------------------ */

export function AttendanceRecentWeeksCard({
  weeks,
  counts,
  onOpen,
}: {
  weeks: AttendanceRecentWeeks;
  counts: AttendanceStatusCounts;
  onOpen: (entry: AttendanceHistoryEntry) => void;
}) {
  const accent = useGardenAccent();
  return (
    <GCard kicker="Recent weeks" title={weeks.rangeLabel} index={2}>
      <View style={styles.legend} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {(['present', 'picked_up', 'absent'] as const).map((status) => (
          <View key={status} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: CHIP_TONES[attendanceStatusTone(status)].bg, borderColor: CHIP_TONES[attendanceStatusTone(status)].fg }]} />
            <Text style={styles.legendText}>
              {attendanceStatusLabel(status)} · {counts[status]}
            </Text>
          </View>
        ))}
      </View>
      <View style={styles.weekHeader} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {weeks.weekdays.map((weekday) => (
          <Text key={weekday} style={styles.weekdayLabel}>
            {weekday.slice(0, 2)}
          </Text>
        ))}
      </View>
      <View style={styles.weekRows}>
        {weeks.rows.map((row) => (
          <View key={row.weekStartKey} style={styles.weekRow} accessibilityLabel={row.label}>
            {row.days.map((day) => {
              const tone = day.entry ? CHIP_TONES[attendanceStatusTone(day.entry.status)] : null;
              const cell = (
                <View
                  style={[
                    styles.dayCell,
                    tone
                      ? { backgroundColor: tone.bg, borderColor: tone.fg }
                      : { backgroundColor: Garden.white, borderColor: Garden.ink10 },
                  ]}>
                  <Text style={[styles.dayNumber, { color: tone ? tone.fg : Garden.ink60 }]}>
                    {day.dayOfMonth}
                  </Text>
                  {day.entry ? (
                    <Ionicons name={STATUS_ICON[day.entry.status]} size={11} color={tone?.fg} />
                  ) : null}
                </View>
              );
              if (!day.entry) {
                return (
                  <View key={day.dateKey} accessible accessibilityLabel={attendanceWeekDayA11yLabel(day)} style={styles.dayWrap}>
                    {cell}
                  </View>
                );
              }
              const entry = day.entry;
              return (
                <GPressable
                  key={day.dateKey}
                  testID={`parent-attendance-week-day-${day.dateKey}`}
                  accessibilityLabel={attendanceWeekDayA11yLabel(day)}
                  pressedScale={0.92}
                  haptic="select"
                  onPress={() => onOpen(entry)}
                  style={styles.dayWrap}>
                  {cell}
                </GPressable>
              );
            })}
          </View>
        ))}
      </View>
      <Text style={[gText.meta, styles.weekFoot]}>
        <Text style={{ color: accent.clayDeep, fontFamily: GardenFonts.bodyExtra }}>
          {weeks.recordedDays}
        </Text>{' '}
        {weeks.recordedDays === 1 ? 'day' : 'days'} recorded · tap a day for details
      </Text>
    </GCard>
  );
}

/* ------------------------------------------------------------------ */
/* History                                                             */
/* ------------------------------------------------------------------ */

function HistoryRow({
  entry,
  first,
  onPress,
}: {
  entry: AttendanceHistoryEntry;
  first: boolean;
  onPress: (entry: AttendanceHistoryEntry) => void;
}) {
  const dateLabel = formatAttendanceHistoryDateLabel(entry.date);
  return (
    <GPressable
      testID={`parent-attendance-history-item-${entry.date}`}
      accessibilityLabel={`View attendance for ${dateLabel}`}
      pressedScale={0.99}
      onPress={() => onPress(entry)}
      style={[styles.row, !first && styles.rowRule]}>
      <View style={styles.rowCopy}>
        <Text style={gText.itemTitle} numberOfLines={1}>
          {attendanceRelativeDayLabel(entry.date)}
        </Text>
        <Text style={gText.meta} numberOfLines={1}>
          {attendanceMetaLine(entry)}
        </Text>
      </View>
      <AttendanceStatusChip status={entry.status} />
      <Ionicons name="chevron-forward" size={16} color={Garden.ink60} />
    </GPressable>
  );
}

function HistorySkeletonRows({ count }: { count: number }) {
  return (
    <View style={styles.notebook}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={[styles.row, i > 0 && styles.rowRule]}>
          <View style={styles.rowCopy}>
            <GSkeleton style={{ width: '45%', height: 14 }} />
            <GSkeleton style={{ width: '30%', height: 11 }} />
          </View>
          <GSkeleton style={{ width: 64, height: 22, borderRadius: 999 }} />
        </View>
      ))}
    </View>
  );
}

export function AttendanceHistoryCard({
  firstName,
  entriesLoaded,
  totalCount,
  counts,
  filter,
  onFilterChange,
  groups,
  showSkeleton,
  error,
  onRetry,
  hasMore,
  loadingMore,
  onLoadMore,
  onOpen,
}: {
  firstName: string;
  entriesLoaded: number;
  totalCount: number;
  counts: AttendanceStatusCounts;
  filter: AttendanceFilter;
  onFilterChange: (filter: AttendanceFilter) => void;
  groups: AttendanceMonthGroup[];
  showSkeleton: boolean;
  error: string | null;
  onRetry: () => void;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  onOpen: (entry: AttendanceHistoryEntry) => void;
}) {
  if (error) {
    return (
      <GErrorCard
        kicker="History"
        title={`We couldn't load ${firstName}'s history`}
        message={`${error} Check your connection, then try again.`}
        onRetry={onRetry}
      />
    );
  }

  const filterItems: { id: AttendanceFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'present', label: `Present · ${counts.present}` },
    { id: 'picked_up', label: `Picked up · ${counts.picked_up}` },
    { id: 'absent', label: `Absent · ${counts.absent}` },
  ];

  return (
    <GCard
      kicker="History"
      title={`${firstName}'s history`}
      index={3}
      testID="parent-attendance-history-panel"
      action={
        totalCount > 0 ? (
          <Text style={gText.meta} accessibilityLabel={`Showing ${entriesLoaded} of ${totalCount} days`}>
            {entriesLoaded} of {totalCount}
          </Text>
        ) : null
      }>
      {showSkeleton ? (
        <HistorySkeletonRows count={6} />
      ) : entriesLoaded === 0 ? (
        <View style={styles.empty}>
          <Text style={gText.body}>No attendance records yet.</Text>
          <GHand>Check-ins will show up here.</GHand>
        </View>
      ) : (
        <View style={styles.historyBody}>
          <GSegmented
            scrollable
            accessibilityLabel="Filter by status"
            items={filterItems}
            activeId={filter}
            onChange={onFilterChange}
          />
          {groups.length === 0 ? (
            <Text style={[gText.meta, styles.filterEmpty]}>
              No {filter === 'picked_up' ? 'pick-ups' : filter} days in what&apos;s loaded so far.
            </Text>
          ) : (
            groups.map((group) => (
              <View key={group.key} style={styles.group}>
                <GKicker>{group.label}</GKicker>
                <View style={styles.notebook}>
                  {group.entries.map((entry, i) => (
                    <HistoryRow key={entry.date} entry={entry} first={i === 0} onPress={onOpen} />
                  ))}
                </View>
              </View>
            ))
          )}
          {loadingMore ? <HistorySkeletonRows count={3} /> : null}
          {hasMore ? (
            <GOutlineButton
              testID="parent-attendance-load-more"
              label={loadingMore ? 'Loading…' : 'Load more'}
              icon={loadingMore ? undefined : 'chevron-down'}
              accessibilityHint="Loads older attendance days"
              onPress={() => {
                if (!loadingMore) onLoadMore();
              }}
              style={styles.loadMore}
            />
          ) : (
            <View style={styles.end}>
              <GDashedRule />
              <Text style={styles.endText}>That&apos;s everything for now</Text>
            </View>
          )}
        </View>
      )}
    </GCard>
  );
}

/* ------------------------------------------------------------------ */
/* Day timeline (sheet body)                                           */
/* ------------------------------------------------------------------ */

export function AttendanceDayTimeline({ entry }: { entry: AttendanceHistoryEntry }) {
  const steps = attendanceDayTimeline(entry);
  return (
    <GStepList
      accessibilityLabel="How the day went"
      steps={steps.map((step) => ({
        id: step.key,
        title: step.label,
        meta: [step.time, step.detail].filter(Boolean).join(' · ') || 'No time recorded',
        state: 'done' as const,
      }))}
    />
  );
}

const styles = StyleSheet.create({
  latest: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 88 },
  latestCopy: { flex: 1, gap: 6 },
  latestStep: { gap: 1 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 12, height: 12, borderRadius: 4, borderWidth: 1.5 },
  legendText: { fontFamily: GardenFonts.bodyBold, fontSize: 12.5, color: Garden.soft },
  weekHeader: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  weekdayLabel: {
    flex: 1,
    textAlign: 'center',
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 11,
    letterSpacing: 1,
    color: Garden.soft,
    textTransform: 'uppercase',
  },
  weekRows: { gap: 6 },
  weekRow: { flexDirection: 'row', gap: 6 },
  dayWrap: { flex: 1 },
  dayCell: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  dayNumber: { fontFamily: GardenFonts.bodyExtra, fontSize: 13 },
  weekFoot: { marginTop: 12 },
  historyBody: { gap: 14 },
  group: { gap: 8 },
  notebook: {
    backgroundColor: Garden.notebook,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Garden.ink10,
    overflow: 'hidden',
  },
  row: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  rowRule: { borderTopWidth: 1, borderTopColor: 'rgba(46,74,60,0.1)' },
  rowCopy: { flex: 1, gap: 3 },
  empty: { gap: 8 },
  filterEmpty: { paddingVertical: 8 },
  loadMore: { alignSelf: 'center' },
  end: { gap: 10, alignItems: 'center', paddingTop: 4 },
  endText: { fontFamily: GardenFonts.bodyBold, fontSize: 13, color: Garden.soft },
});
