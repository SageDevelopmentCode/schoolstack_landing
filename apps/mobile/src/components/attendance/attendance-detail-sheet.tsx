import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import {
  ATTENDANCE_CHIP_TONE,
  AttendanceHistoryRow,
} from '@/components/attendance/attendance-garden-ui';
import type { AttendanceSave } from '@/components/attendance/use-attendance-save';
import { GInlineBanner } from '@/components/parent/garden/fields';
import { GSheet } from '@/components/parent/garden/sheet';
import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { GChip, GKicker, GPressable, GSkeleton } from '@/components/parent/garden/ui';
import { StudentPhoto } from '@/components/school-admin/student-photo';
import { useAttendance } from '@/contexts/attendance-context';
import { attendanceStatusLabel } from '@/lib/attendance/attendance-actions';
import { toDateKey } from '@/lib/attendance/attendance-date-utils';
import { formatAttendanceHistoryTime } from '@/lib/attendance/attendance-history-display';
import type {
  AttendanceAction,
  AttendanceHistoryEntry,
  AttendanceRosterStudent,
} from '@/lib/attendance/attendance-types';
import { formatEnrolledStudentName, formatStudentGrade } from '@/lib/teacher/teacher-home-utils';

type AttendanceDetailSheetProps = {
  visible: boolean;
  /** The live roster row (updates in place after a save). */
  student: AttendanceRosterStudent | null;
  onClose: () => void;
  onRecordPickup: () => void;
  save: AttendanceSave['save'];
};

function todayStatusDetail(student: AttendanceRosterStudent): string {
  if (student.attendanceStatus === 'present') {
    const time = formatAttendanceHistoryTime(student.presentAt);
    return time ? `Marked present at ${time}` : 'Marked present';
  }
  if (student.attendanceStatus === 'absent') {
    const time = formatAttendanceHistoryTime(student.absentAt);
    return time ? `Marked absent at ${time}` : 'Marked absent';
  }
  if (student.attendanceStatus === 'picked_up') {
    const time = formatAttendanceHistoryTime(student.pickedUpAt);
    const pickupName = student.pickedUpByName ? ` by ${student.pickedUpByName}` : '';
    return time ? `Picked up at ${time}${pickupName}` : `Picked up${pickupName}`;
  }
  return 'No attendance recorded yet for this day.';
}

type IoniconName = keyof typeof Ionicons.glyphMap;

function ActionButton({
  label,
  icon,
  onPress,
  disabled,
  busy,
  tone,
}: {
  label: string;
  icon: IoniconName;
  onPress: () => void;
  disabled: boolean;
  busy: boolean;
  tone: 'accent' | 'outline';
}) {
  const accent = useGardenAccent();
  const fg = tone === 'accent' ? Garden.white : Garden.ink;
  return (
    <GPressable
      accessibilityLabel={label}
      accessibilityState={{ disabled, busy }}
      disabled={disabled}
      haptic={tone === 'accent' ? 'press' : 'tap'}
      onPress={onPress}
      style={[
        styles.action,
        tone === 'accent'
          ? { backgroundColor: accent.clay, borderColor: accent.clay }
          : { backgroundColor: Garden.white, borderColor: Garden.ink25 },
        disabled && styles.actionDisabled,
      ]}>
      {busy ? <ActivityIndicator size="small" color={fg} /> : <Ionicons name={icon} size={17} color={fg} />}
      <Text style={[styles.actionLabel, { color: fg }]}>{label}</Text>
    </GPressable>
  );
}

/** Student attendance details: status for the day, Mark Present / Absent / Pickup, recent history. */
export function AttendanceDetailSheet({
  visible,
  student,
  onClose,
  onRecordPickup,
  save,
}: AttendanceDetailSheetProps) {
  const { organizationId, api, savingStudentId, activeDate } = useAttendance();
  const [history, setHistory] = useState<AttendanceHistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedLabel, setSavedLabel] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<AttendanceAction | null>(null);

  const studentId = student?.id ?? null;
  const statusKey = student ? `${student.attendanceStatus}-${student.presentAt}-${student.absentAt}` : null;

  // Reset the in-sheet status whenever a different student opens.
  const [prevStudentId, setPrevStudentId] = useState(studentId);
  if (prevStudentId !== studentId) {
    setPrevStudentId(studentId);
    setSaveError(null);
    setSavedLabel(null);
  }

  useEffect(() => {
    if (!visible || !studentId) return;

    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setHistoryLoading(true);
      setHistoryError(null);
    });

    void api
      .fetchHistory(organizationId, studentId, { limit: 5, offset: 0 })
      .then((response) => {
        if (!cancelled) setHistory(response.entries);
      })
      .catch((err) => {
        if (!cancelled) {
          setHistoryError(err instanceof Error ? err.message : 'Failed to load history.');
          setHistory([]);
        }
      })
      .finally(() => {
        if (!cancelled) setHistoryLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // statusKey: refetch after a save so the new record shows in history.
  }, [api, organizationId, studentId, statusKey, visible]);

  if (!student) return null;

  const saving = savingStudentId === student.id;
  const studentName = formatEnrolledStudentName(student);
  const gradeLabel = formatStudentGrade(student.grade) ?? 'Grade not listed';
  const canPickup = student.attendanceStatus === 'present';
  const isPickedUp = student.attendanceStatus === 'picked_up';
  const activeDateKey = toDateKey(activeDate);
  const dayLabel = activeDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const runSave = async (kind: AttendanceAction) => {
    setSaveError(null);
    setSavedLabel(null);
    setPendingAction(kind);
    const ok = await save(student, kind, { silent: true });
    setPendingAction(null);
    if (ok) {
      setSavedLabel(kind === 'present' ? 'Marked present' : 'Marked absent');
    } else {
      setSaveError("Their attendance didn't change. Check your connection, then try again.");
    }
  };

  return (
    <GSheet
      visible={visible}
      onClose={onClose}
      title={studentName}
      subtitle={gradeLabel}
      headerAside={
        savedLabel ? (
          <GChip label={savedLabel} tone="success" icon="checkmark" />
        ) : (
          <GChip
            label={attendanceStatusLabel(student.attendanceStatus)}
            tone={ATTENDANCE_CHIP_TONE[student.attendanceStatus]}
          />
        )
      }
      accessibilityLabel="Student attendance details">
      <View style={styles.dayCard}>
        <StudentPhoto name={studentName} photoUrl={student.profilePhotoUrl} size="lg" />
        <View style={styles.dayCopy}>
          <GKicker>{dayLabel}</GKicker>
          <Text style={styles.dayStatus}>{todayStatusDetail(student)}</Text>
        </View>
      </View>

      {saveError ? <GInlineBanner tone="error" title="Couldn't save" description={saveError} /> : null}

      <View style={styles.actions}>
        <ActionButton
          label="Mark Present"
          icon="checkmark-circle-outline"
          tone={student.attendanceStatus === 'present' || isPickedUp ? 'outline' : 'accent'}
          disabled={saving || isPickedUp}
          busy={saving && pendingAction === 'present'}
          onPress={() => void runSave('present')}
        />
        <ActionButton
          label="Absent"
          icon="close-circle-outline"
          tone="outline"
          disabled={saving || isPickedUp}
          busy={saving && pendingAction === 'absent'}
          onPress={() => void runSave('absent')}
        />
        <ActionButton
          label="Pickup"
          icon="log-out-outline"
          tone={canPickup ? 'accent' : 'outline'}
          disabled={saving || !canPickup || isPickedUp}
          busy={false}
          onPress={onRecordPickup}
        />
      </View>

      <View style={styles.history}>
        <Text style={styles.sectionTitle}>Recent history</Text>
        {historyLoading ? (
          Array.from({ length: 3 }, (_, index) => <GSkeleton key={index} style={styles.historySkeleton} />)
        ) : historyError ? (
          <GInlineBanner tone="warning" title="History didn't load" description={historyError} />
        ) : history.length === 0 ? (
          <Text style={styles.empty}>No attendance history yet.</Text>
        ) : (
          history.map((entry, index) => (
            <AttendanceHistoryRow
              key={`${entry.date}-${entry.status}`}
              entry={entry}
              divider={index > 0}
              highlightDate={activeDateKey}
            />
          ))
        )}
      </View>
    </GSheet>
  );
}

const styles = StyleSheet.create({
  dayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 18,
    backgroundColor: Garden.white,
    borderWidth: 1.5,
    borderColor: Garden.ink10,
    padding: 14,
  },
  dayCopy: { flex: 1, gap: 4 },
  dayStatus: { fontFamily: GardenFonts.bodyExtra, fontSize: 16, lineHeight: 21, color: Garden.ink },
  actions: { flexDirection: 'row', gap: 8 },
  action: {
    flex: 1,
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 8,
  },
  actionDisabled: { opacity: 0.45 },
  actionLabel: { fontFamily: GardenFonts.bodyExtra, fontSize: 13.5 },
  history: { gap: 4, paddingBottom: 12 },
  sectionTitle: {
    fontFamily: GardenFonts.display,
    fontSize: 18,
    letterSpacing: -0.3,
    color: Garden.ink,
    marginBottom: 4,
  },
  historySkeleton: { height: 52, borderRadius: 14, marginBottom: 6 },
  empty: { fontFamily: GardenFonts.bodySemi, fontSize: 14, color: Garden.soft },
});
