import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AttendanceActionRow } from '@/components/attendance/attendance-action-button';
import { AttendanceHistoryListItem } from '@/components/attendance/attendance-history-list-item';
import { AttendanceHistoryRowSkeleton } from '@/components/attendance/attendance-skeleton-blocks';
import { StudentPhoto } from '@/components/school-admin/student-photo';
import { StoryBottomSheet } from '@/components/story/story-bottom-sheet';
import { StoryChip } from '@/components/story/story-chip';
import { useAttendance } from '@/contexts/attendance-context';
import {
  attendanceStatusLabel,
  attendanceStatusTone,
} from '@/lib/attendance/attendance-actions';
import type { AttendanceHistoryEntry, AttendanceRosterStudent } from '@/lib/attendance/attendance-types';
import { formatAttendanceHistoryTime } from '@/lib/attendance/attendance-history-display';
import {
  formatEnrolledStudentName,
  formatStudentGrade,
} from '@/lib/teacher/teacher-home-utils';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type AttendanceDetailSheetProps = {
  visible: boolean;
  student: AttendanceRosterStudent | null;
  onClose: () => void;
  onRecordPickup: () => void;
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
  const activeDateKey = `${activeDate.getFullYear()}-${String(activeDate.getMonth() + 1).padStart(2, '0')}-${String(activeDate.getDate()).padStart(2, '0')}`;

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

        <AttendanceActionRow
          saving={saving}
          canPickup={canPickup}
          isPickedUp={isPickedUp}
          onMarkPresent={() => void saveAction(student, 'present')}
          onMarkAbsent={() => void saveAction(student, 'absent')}
          onRecordPickup={onRecordPickup}
        />

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.ink }]}>Recent history</Text>
          {historyLoading ? (
            <View>
              {Array.from({ length: 3 }, (_, index) => (
                <AttendanceHistoryRowSkeleton key={index} />
              ))}
            </View>
          ) : historyError ? (
            <Text style={[styles.sectionBody, { color: theme.alert }]}>{historyError}</Text>
          ) : history.length === 0 ? (
            <Text style={[styles.sectionBody, { color: theme.muted }]}>No attendance history yet.</Text>
          ) : (
            history.map((entry) => (
              <AttendanceHistoryListItem
                key={`${entry.date}-${entry.status}`}
                entry={entry}
                highlightDate={activeDateKey}
              />
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
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
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
});
