import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { StudentPhoto } from '@/components/school-admin/student-photo';
import { Garden, GardenFonts, useGardenAccent, type GChipTone } from '@/components/parent/garden/tokens';
import { GChip, GPressable, GProgress, GSkeleton } from '@/components/parent/garden/ui';
import {
  attendanceActionIcon,
  attendanceActionLabel,
  attendancePrimaryActionType,
  attendanceStatusLabel,
  formatDashboardAttendanceSubcopy,
  type AttendanceActionType,
} from '@/lib/attendance/attendance-actions';
import { formatAttendanceDateLabel, isToday, shiftDate } from '@/lib/attendance/attendance-date-utils';
import {
  buildAttendanceHistorySummary,
  formatAttendanceHistoryTime,
  resolveAttendanceHistoryActor,
} from '@/lib/attendance/attendance-history-display';
import type {
  AttendanceHistoryEntry,
  AttendanceRosterStatus,
  AttendanceRosterStudent,
  AttendanceRosterSummary,
} from '@/lib/attendance/attendance-types';
import { haptic } from '@/lib/haptics';
import { formatEnrolledStudentName } from '@/lib/teacher/teacher-home-utils';

export type AttendanceStatusFilter = 'all' | AttendanceRosterStatus;

export const ATTENDANCE_CHIP_TONE: Record<AttendanceRosterStatus, GChipTone> = {
  present: 'success',
  absent: 'alert',
  picked_up: 'info',
  not_marked: 'neutral',
};

/* ------------------------------------------------------------------ */
/* Date stepper                                                        */
/* ------------------------------------------------------------------ */

/** Prev / next day, Today chip, progress + "N left to mark", Jump to today. */
export function AttendanceDateStepper({
  activeDate,
  summary,
  loading = false,
  error = null,
  onDateChange,
}: {
  activeDate: Date;
  summary: AttendanceRosterSummary | null;
  loading?: boolean;
  error?: string | null;
  onDateChange: (date: Date) => void;
}) {
  const accent = useGardenAccent();
  const viewingToday = isToday(activeDate);
  const subcopy = loading
    ? 'Loading roster…'
    : summary
      ? formatDashboardAttendanceSubcopy(summary)
      : (error ?? 'Summary unavailable');
  const total = summary?.totalStudents ?? 0;
  const marked = summary ? total - summary.notMarkedCount : 0;
  const left = summary?.notMarkedCount ?? 0;

  const change = (date: Date) => {
    haptic.select();
    onDateChange(date);
  };

  return (
    <View style={styles.stepper}>
      <View style={styles.stepperRow}>
        <GPressable
          accessibilityLabel="Previous day"
          haptic="none"
          onPress={() => change(shiftDate(activeDate, -1))}
          style={styles.stepButton}>
          <Ionicons name="chevron-back" size={20} color={Garden.ink} />
        </GPressable>
        <View style={styles.stepperCenter} accessible accessibilityLiveRegion="polite">
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>{formatAttendanceDateLabel(activeDate)}</Text>
            {viewingToday ? <GChip label="Today" tone="success" /> : null}
          </View>
          <Text style={styles.subcopy} numberOfLines={2}>
            {subcopy}
          </Text>
        </View>
        <GPressable
          accessibilityLabel="Next day"
          haptic="none"
          onPress={() => change(shiftDate(activeDate, 1))}
          style={styles.stepButton}>
          <Ionicons name="chevron-forward" size={20} color={Garden.ink} />
        </GPressable>
      </View>

      {summary && total > 0 && !loading ? (
        <View style={styles.progressRow}>
          <GProgress
            value={marked / total}
            done={left === 0}
            label={`${marked} of ${total} students marked`}
            style={styles.progress}
          />
          <Text style={[styles.leftLabel, left === 0 && { color: Garden.forest }]}>
            {left === 0 ? 'All marked' : `${left} left to mark`}
          </Text>
        </View>
      ) : null}

      {!viewingToday ? (
        <GPressable
          accessibilityLabel="Jump to today"
          haptic="none"
          onPress={() => change(new Date())}
          style={styles.jumpToday}>
          <Ionicons name="today-outline" size={15} color={accent.clayDeep} />
          <Text style={[styles.jumpTodayText, { color: accent.clayDeep }]}>Jump to today</Text>
        </GPressable>
      ) : null}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Search + filters                                                    */
/* ------------------------------------------------------------------ */

export function AttendanceSearchField({
  value,
  onChangeText,
}: {
  value: string;
  onChangeText: (text: string) => void;
}) {
  return (
    <View style={styles.search}>
      <Ionicons name="search" size={17} color={Garden.soft} />
      <TextInput
        accessibilityLabel="Search students"
        placeholder="Search students"
        placeholderTextColor={Garden.soft}
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
        autoCorrect={false}
        style={styles.searchInput}
      />
      {value ? (
        <GPressable
          accessibilityLabel="Clear search"
          haptic="select"
          hitSlop={10}
          onPress={() => onChangeText('')}
          style={styles.clear}>
          <Ionicons name="close-circle" size={18} color={Garden.ink60} />
        </GPressable>
      ) : null}
    </View>
  );
}

const FILTERS: { key: AttendanceStatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'not_marked', label: 'Not marked' },
  { key: 'present', label: 'Present' },
  { key: 'absent', label: 'Absent' },
  { key: 'picked_up', label: 'Picked up' },
];

function filterCount(key: AttendanceStatusFilter, summary: AttendanceRosterSummary | null) {
  if (!summary) return undefined;
  switch (key) {
    case 'all':
      return summary.totalStudents;
    case 'present':
      return summary.presentCount;
    case 'absent':
      return summary.absentCount;
    case 'not_marked':
      return summary.notMarkedCount;
    case 'picked_up':
      return summary.pickedUpCount;
  }
}

/** Radio filter chips "Label · N"; zero counts hidden (except All and the active one). */
export function AttendanceFilterChips({
  activeFilter,
  summary,
  onChange,
  disabled = false,
}: {
  activeFilter: AttendanceStatusFilter;
  summary: AttendanceRosterSummary | null;
  onChange: (filter: AttendanceStatusFilter) => void;
  disabled?: boolean;
}) {
  const accent = useGardenAccent();
  const visible = FILTERS.filter((filter) => {
    const count = filterCount(filter.key, summary);
    return filter.key === 'all' || filter.key === activeFilter || count == null || count > 0;
  });

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityRole="radiogroup"
      contentContainerStyle={styles.chips}>
      {visible.map((filter) => {
        const active = activeFilter === filter.key;
        const count = filterCount(filter.key, summary);
        const label = count != null ? `${filter.label} · ${count}` : filter.label;
        return (
          <GPressable
            key={filter.key}
            accessibilityRole="radio"
            accessibilityLabel={label}
            accessibilityState={{ selected: active, disabled }}
            disabled={disabled}
            haptic="select"
            onPress={() => onChange(filter.key)}
            style={[
              styles.filterChip,
              active
                ? { backgroundColor: accent.clay, borderColor: accent.clay }
                : { backgroundColor: Garden.white, borderColor: Garden.ink15 },
              disabled && styles.disabled,
            ]}>
            <Text style={[styles.filterLabel, { color: active ? Garden.white : Garden.ink }]}>{label}</Text>
          </GPressable>
        );
      })}
    </ScrollView>
  );
}

/* ------------------------------------------------------------------ */
/* Student row                                                         */
/* ------------------------------------------------------------------ */

function compactActionLabel(action: AttendanceActionType): string {
  switch (action) {
    case 'mark_present':
    case 'mark_present_again':
      return attendanceActionLabel(action);
    case 'record_pickup':
      return 'Pickup';
    case 'picked_up':
      return 'Picked up';
    case 'mark_absent':
      return 'Absent';
  }
}

export function attendanceStatusMeta(student: AttendanceRosterStudent): string | null {
  if (student.attendanceStatus === 'present') {
    const time = formatAttendanceHistoryTime(student.presentAt);
    return time ? `In at ${time}` : null;
  }
  if (student.attendanceStatus === 'absent') {
    const time = formatAttendanceHistoryTime(student.absentAt);
    return time ? `Marked at ${time}` : null;
  }
  if (student.attendanceStatus === 'picked_up') {
    const time = formatAttendanceHistoryTime(student.pickedUpAt);
    const by = student.pickedUpByName ? ` by ${student.pickedUpByName}` : '';
    return time ? `Out at ${time}${by}` : by.trim() || null;
  }
  return student.classroomNames[0] ?? null;
}

/** One roster row: avatar + name + status (opens details), and one per-row action. */
export function AttendanceStudentRow({
  student,
  saving = false,
  flash = false,
  onOpenDetails,
  onMarkPresent,
  onRecordPickup,
}: {
  student: AttendanceRosterStudent;
  saving?: boolean;
  flash?: boolean;
  onOpenDetails: () => void;
  onMarkPresent: () => void;
  onRecordPickup: () => void;
}) {
  const accent = useGardenAccent();
  const studentName = formatEnrolledStudentName(student);
  const firstName = student.firstName.trim() || studentName;
  const actionType = attendancePrimaryActionType(student.attendanceStatus);
  const isPickedUp = student.attendanceStatus === 'picked_up';
  const isPresent = student.attendanceStatus === 'present';
  const disabled = isPickedUp || saving;
  const actionLabel = compactActionLabel(actionType);
  const meta = attendanceStatusMeta(student);

  return (
    <View
      testID={`attendance-row-${student.id}`}
      style={[styles.rowCard, flash && { backgroundColor: Garden.mint, borderColor: 'rgba(46,74,60,0.25)' }]}>
      <GPressable
        accessibilityLabel={`${firstName} attendance details`}
        pressedScale={0.98}
        onPress={onOpenDetails}
        style={styles.rowMain}>
        <StudentPhoto name={studentName} photoUrl={student.profilePhotoUrl} size="row" />
        <View style={styles.rowCopy}>
          <Text style={styles.rowName} numberOfLines={1}>
            {firstName}
          </Text>
          <View style={styles.rowMetaLine}>
            <GChip
              label={attendanceStatusLabel(student.attendanceStatus)}
              tone={ATTENDANCE_CHIP_TONE[student.attendanceStatus]}
            />
            {meta ? (
              <Text style={styles.rowMeta} numberOfLines={1}>
                {meta}
              </Text>
            ) : null}
          </View>
        </View>
      </GPressable>

      <GPressable
        accessibilityLabel={actionLabel}
        accessibilityState={{ disabled, busy: saving }}
        disabled={disabled}
        haptic={isPresent ? 'tap' : 'press'}
        onPress={() => (isPresent ? onRecordPickup() : onMarkPresent())}
        style={[
          styles.action,
          isPickedUp
            ? { backgroundColor: Garden.ink06, borderColor: 'transparent' }
            : isPresent
              ? { backgroundColor: Garden.white, borderColor: Garden.ink25 }
              : { backgroundColor: accent.clay, borderColor: accent.clay },
        ]}>
        {saving ? (
          <ActivityIndicator size="small" color={isPresent ? Garden.ink : Garden.white} />
        ) : (
          <>
            <Ionicons
              name={attendanceActionIcon(actionType)}
              size={15}
              color={isPickedUp ? Garden.ink60 : isPresent ? Garden.ink : Garden.white}
            />
            <Text
              style={[
                styles.actionLabel,
                { color: isPickedUp ? Garden.ink60 : isPresent ? Garden.ink : Garden.white },
              ]}
              numberOfLines={1}>
              {actionLabel}
            </Text>
          </>
        )}
      </GPressable>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* History row                                                         */
/* ------------------------------------------------------------------ */

export function AttendanceHistoryRow({
  entry,
  highlightDate,
  divider = false,
}: {
  entry: AttendanceHistoryEntry;
  highlightDate?: string | null;
  divider?: boolean;
}) {
  const accent = useGardenAccent();
  const actor = resolveAttendanceHistoryActor(entry);
  const summary = buildAttendanceHistorySummary(entry);
  const highlighted = highlightDate != null && entry.date === highlightDate;
  return (
    <View
      style={[
        styles.historyRow,
        divider && !highlighted && styles.historyDivider,
        highlighted && { backgroundColor: accent.wash, borderColor: accent.clay },
      ]}>
      <StudentPhoto name={actor.name} photoUrl={actor.photoUrl} size="sm" />
      <View style={styles.rowCopy}>
        <Text style={styles.historyPrimary} numberOfLines={1}>
          {summary.primary}
        </Text>
        <Text style={styles.rowMeta} numberOfLines={1}>
          {summary.secondary}
        </Text>
      </View>
      <GChip label={attendanceStatusLabel(entry.status)} tone={ATTENDANCE_CHIP_TONE[entry.status]} />
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Skeletons                                                           */
/* ------------------------------------------------------------------ */

export function AttendanceRowSkeleton() {
  return (
    <View style={styles.rowCard}>
      <View style={styles.rowMain}>
        <GSkeleton style={styles.skAvatar} />
        <View style={styles.rowCopy}>
          <GSkeleton style={styles.skName} />
          <GSkeleton style={styles.skChip} />
        </View>
      </View>
      <GSkeleton style={styles.skAction} />
    </View>
  );
}

export function AttendanceRosterSkeleton({ embedded = false }: { embedded?: boolean }) {
  return (
    <View style={styles.skWrap} accessibilityLabel="Loading attendance">
      {!embedded ? (
        <>
          <GSkeleton style={styles.skTitle} />
          <GSkeleton style={styles.skSubtitle} />
        </>
      ) : null}
      <GSkeleton style={styles.skStepper} />
      <GSkeleton style={styles.skSearch} />
      <View style={styles.chips}>
        <GSkeleton style={styles.skFilter} />
        <GSkeleton style={styles.skFilter} />
        <GSkeleton style={styles.skFilter} />
      </View>
      {Array.from({ length: 5 }, (_, i) => (
        <AttendanceRowSkeleton key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  stepper: {
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Garden.ink12,
    backgroundColor: Garden.white,
    padding: 12,
    gap: 10,
  },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: Garden.ink12,
    backgroundColor: Garden.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperCenter: { flex: 1, alignItems: 'center', gap: 2 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateLabel: { fontFamily: GardenFonts.display, fontSize: 19, letterSpacing: -0.4, color: Garden.ink },
  subcopy: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 13,
    lineHeight: 18,
    color: Garden.soft,
    textAlign: 'center',
  },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 4 },
  progress: { flex: 1 },
  leftLabel: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 12.5,
    color: Garden.ink65,
    fontVariant: ['tabular-nums'],
  },
  jumpToday: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 6,
    minHeight: 36,
    paddingHorizontal: 12,
  },
  jumpTodayText: { fontFamily: GardenFonts.bodyExtra, fontSize: 14 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 48,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: Garden.ink12,
    backgroundColor: Garden.white,
    paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    fontFamily: GardenFonts.bodySemi,
    fontSize: 16,
    color: Garden.ink,
    paddingVertical: 10,
  },
  clear: { padding: 4 },
  chips: { flexDirection: 'row', gap: 8, paddingRight: 8 },
  filterChip: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  filterLabel: { fontFamily: GardenFonts.bodyExtra, fontSize: 14, fontVariant: ['tabular-nums'] },
  disabled: { opacity: 0.5 },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Garden.ink10,
    backgroundColor: Garden.white,
    paddingVertical: 10,
    paddingLeft: 10,
    paddingRight: 10,
  },
  rowMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48 },
  rowCopy: { flex: 1, minWidth: 0, gap: 4 },
  rowName: { fontFamily: GardenFonts.bodyExtra, fontSize: 16, color: Garden.ink },
  rowMetaLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowMeta: { flexShrink: 1, fontFamily: GardenFonts.bodySemi, fontSize: 12.5, color: Garden.soft },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    minHeight: 44,
    minWidth: 92,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  actionLabel: { fontFamily: GardenFonts.bodyExtra, fontSize: 13.5 },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  historyDivider: { borderTopColor: Garden.ink06, borderRadius: 0 },
  historyPrimary: { fontFamily: GardenFonts.bodyExtra, fontSize: 14, color: Garden.ink },
  skWrap: { paddingHorizontal: 16, paddingTop: 12, gap: 10 },
  skTitle: { width: '55%', height: 30, borderRadius: 10 },
  skSubtitle: { width: '75%', height: 16, borderRadius: 8 },
  skStepper: { height: 104, borderRadius: 20 },
  skSearch: { height: 48, borderRadius: 24 },
  skFilter: { width: 84, height: 40, borderRadius: 20 },
  skAvatar: { width: 44, height: 44, borderRadius: 22 },
  skName: { width: '50%', height: 16, borderRadius: 8 },
  skChip: { width: 80, height: 18, borderRadius: 9 },
  skAction: { width: 92, height: 44, borderRadius: 22 },
});
