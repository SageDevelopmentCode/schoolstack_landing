import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { StudentPhoto } from '@/components/school-admin/student-photo';
import { StoryBottomSheet } from '@/components/story/story-bottom-sheet';
import { StoryButton } from '@/components/story/story-button';
import { StoryChip } from '@/components/story/story-chip';
import { useAttendance } from '@/contexts/attendance-context';
import {
  attendanceStatusLabel,
  attendanceStatusTone,
} from '@/lib/attendance/attendance-actions';
import type { AttendanceHistoryEntry, AttendanceRosterStudent } from '@/lib/attendance/attendance-types';
import {
  formatEnrolledStudentName,
  formatStudentGrade,
} from '@/lib/teacher/teacher-home-utils';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
type AttendanceDetailSheetProps = {
  visible: boolean;
  student: AttendanceRosterStudent | null;
  onClose: () => void;
  onRecordPickup: () => void;
};

function formatHistoryTime(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function todayStatusDetail(student: AttendanceRosterStudent): string {
  if (student.attendanceStatus === 'present') {
    const time = formatHistoryTime(student.presentAt);
    return time ? `Marked present at ${time}` : 'Marked present';
  }
  if (student.attendanceStatus === 'absent') {
    const time = formatHistoryTime(student.absentAt);
    return time ? `Marked absent at ${time}` : 'Marked absent';
  }
  if (student.attendanceStatus === 'picked_up') {
    const time = formatHistoryTime(student.pickedUpAt);
    const pickupName = student.pickedUpByName ? ` by ${student.pickedUpByName}` : '';
    return time ? `Picked up at ${time}${pickupName}` : `Picked up${pickupName}`;
  }
  return 'No attendance recorded yet for this day.';
}

function historyEntryLabel(entry: AttendanceHistoryEntry): string {
  const date = new Date(`${entry.date}T12:00:00`);
  const dateLabel = date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  if (entry.status === 'present') {
    const time = formatHistoryTime(entry.presentAt);
    return time ? `${dateLabel} · Present at ${time}` : `${dateLabel} · Present`;
  }
  if (entry.status === 'absent') {
    const time = formatHistoryTime(entry.absentAt);
    return time ? `${dateLabel} · Absent at ${time}` : `${dateLabel} · Absent`;
  }
  const time = formatHistoryTime(entry.pickedUpAt);
  const pickupName = entry.pickedUpByName ? ` by ${entry.pickedUpByName}` : '';
  return time ? `${dateLabel} · Picked up at ${time}${pickupName}` : `${dateLabel} · Picked up${pickupName}`;
}

export function AttendanceDetailSheet({
  visible,
  student,
  onClose,
  onRecordPickup,
}: AttendanceDetailSheetProps) {
  const theme = useParentTheme();
  const { organizationId, api, savingStudentId, saveAction, activeDate } = useAttendance();
  const [history, setHistory] = useState<AttendanceHistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible || !student) return;

    let cancelled = false;
    setHistoryLoading(true);
    setHistoryError(null);

    void api
      .fetchHistory(organizationId, student.id, { limit: 5, offset: 0 })
      .then((response) => {
        if (!cancelled) {
          setHistory(response.entries);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setHistoryError(err instanceof Error ? err.message : 'Failed to load history.');
          setHistory([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setHistoryLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [api, organizationId, student, visible]);

  if (!student) return null;

  const saving = savingStudentId === student.id;
  const studentName = formatEnrolledStudentName(student);
  const gradeLabel = formatStudentGrade(student.grade) ?? 'Grade not listed';
  const canPickup = student.attendanceStatus === 'present';
  const isPickedUp = student.attendanceStatus === 'picked_up';

  return (
    <StoryBottomSheet visible={visible} onClose={onClose} accessibilityLabel="Student attendance details">
      <View style={styles.content}>
        <View style={styles.header}>
          <StudentPhoto name={studentName} photoUrl={student.profilePhotoUrl} size="lg" />
          <View style={styles.headerCopy}>
            <Text style={[styles.name, { color: theme.ink }]}>{studentName}</Text>
            <Text style={[styles.meta, { color: theme.muted }]}>{gradeLabel}</Text>
            <StoryChip
              tone={attendanceStatusTone(student.attendanceStatus)}
              label={attendanceStatusLabel(student.attendanceStatus)}
              uppercase={false}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.ink }]}>
            {activeDate.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
          <Text style={[styles.sectionBody, { color: theme.muted }]}>{todayStatusDetail(student)}</Text>
        </View>

        <View style={styles.actions}>
          <StoryButton
            label="Mark Present"
            variant="soft"
            disabled={saving || isPickedUp}
            onPress={() => void saveAction(student, 'present')}
          />
          <StoryButton
            label="Mark Absent"
            variant="outline"
            disabled={saving || isPickedUp}
            onPress={() => void saveAction(student, 'absent')}
          />
          <StoryButton
            label="Record Pickup"
            variant="primary"
            disabled={saving || !canPickup}
            onPress={onRecordPickup}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.ink }]}>Recent history</Text>
          {historyLoading ? (
            <ActivityIndicator color={theme.primary} />
          ) : historyError ? (
            <Text style={[styles.sectionBody, { color: theme.alert }]}>{historyError}</Text>
          ) : history.length === 0 ? (
            <Text style={[styles.sectionBody, { color: theme.muted }]}>No attendance history yet.</Text>
          ) : (
            history.map((entry) => (
              <Text key={`${entry.date}-${entry.status}`} style={[styles.historyLine, { color: theme.muted }]}>
                {historyEntryLabel(entry)}
              </Text>
            ))
          )}
        </View>
      </View>
    </StoryBottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.four,
    paddingBottom: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    gap: Spacing.three,
    alignItems: 'flex-start',
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 18,
    fontWeight: '700',
  },
  meta: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
  },
  section: {
    gap: Spacing.two,
  },
  sectionTitle: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '700',
  },
  sectionBody: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 20,
  },
  actions: {
    gap: Spacing.two,
  },
  historyLine: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 18,
  },
});
