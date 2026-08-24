import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Radius, Spacing } from '@/constants/theme';
import { StaffStudentAssignPicker } from '@/components/school-admin/staff/staff-student-assign-picker';
import {
  assignStudentTeacher,
  fetchStaffAssignedStudents,
  type AdminEnrolledStudentSummary,
} from '@/lib/school-admin-api';
import { formatStaffApiError } from '@/lib/school-admin/staff-labels';
import {
  formatEnrolledStudentName,
  formatStudentGrade,
} from '@/lib/school-admin/enrolled-students';

type StaffAssignedStudentsSectionProps = {
  slug: string;
  staffMemberId: string;
  organizationId: string;
  staffMemberName: string;
  staffIsActive: boolean;
};

export function StaffAssignedStudentsSection({
  slug,
  staffMemberId,
  organizationId,
  staffMemberName,
  staffIsActive,
}: StaffAssignedStudentsSectionProps) {
  const theme = useAdminTheme();
  const router = useRouter();

  const [students, setStudents] = useState<AdminEnrolledStudentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [removingStudentId, setRemovingStudentId] = useState<string | null>(null);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchStaffAssignedStudents(slug, staffMemberId);
      setStudents(rows);
    } catch (loadError) {
      setError(formatStaffApiError(loadError, 'Failed to load assigned students.'));
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [slug, staffMemberId]);

  useEffect(() => {
    void loadStudents();
  }, [loadStudents]);

  const handleAssign = async (studentId: string) => {
    setAssigning(true);
    try {
      await assignStudentTeacher(slug, studentId, staffMemberId);
      await loadStudents();
    } catch (assignError) {
      Alert.alert('Error', formatStaffApiError(assignError, 'Failed to assign student.'));
    } finally {
      setAssigning(false);
    }
  };

  const confirmUnassign = (student: AdminEnrolledStudentSummary) => {
    Alert.alert(
      'Remove student',
      `Unassign ${formatEnrolledStudentName(student)} from ${staffMemberName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => void handleUnassign(student.id),
        },
      ],
    );
  };

  const handleUnassign = async (studentId: string) => {
    setRemovingStudentId(studentId);
    try {
      await assignStudentTeacher(slug, studentId, null);
      setStudents((current) => current.filter((row) => row.id !== studentId));
    } catch (unassignError) {
      Alert.alert('Error', formatStaffApiError(unassignError, 'Failed to unassign student.'));
    } finally {
      setRemovingStudentId(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <ThemedText type="small" style={{ color: theme.textTertiary }}>
          {loading ? 'Loading…' : `${students.length} assigned`}
        </ThemedText>
        {staffIsActive ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => setPickerOpen(true)}
            style={({ pressed }) => [styles.assignButton, pressed && { opacity: 0.7 }]}>
            <ThemedText type="smallBold" style={{ color: theme.accent }}>
              Assign student
            </ThemedText>
          </Pressable>
        ) : null}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={theme.accent} />
        </View>
      ) : error ? (
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {error}
        </ThemedText>
      ) : students.length === 0 ? (
        <ThemedText type="small" style={{ color: theme.textTertiary }}>
          No students assigned yet.
        </ThemedText>
      ) : (
        <View style={styles.list}>
          {students.map((student) => {
            const programLabel =
              student.programNames.length > 0 ? student.programNames.join(', ') : '—';
            const gradeLabel = formatStudentGrade(student.grade) ?? '—';
            const isRemoving = removingStudentId === student.id;

            return (
              <View
                key={student.id}
                style={[
                  styles.row,
                  { borderColor: theme.border, backgroundColor: theme.surface },
                ]}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push(`/school-admin/${slug}/students/${student.id}`)}
                  style={({ pressed }) => [styles.rowMain, pressed && { opacity: 0.7 }]}>
                  <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
                    {formatEnrolledStudentName(student)}
                  </ThemedText>
                  <ThemedText type="small" style={{ color: theme.textTertiary }}>
                    {gradeLabel} · {programLabel}
                  </ThemedText>
                </Pressable>
                {staffIsActive ? (
                  <Pressable
                    accessibilityRole="button"
                    disabled={isRemoving}
                    onPress={() => confirmUnassign(student)}
                    style={({ pressed }) => [styles.removeButton, pressed && { opacity: 0.7 }]}>
                    {isRemoving ? (
                      <ActivityIndicator color={theme.textSecondary} size="small" />
                    ) : (
                      <ThemedText type="small" style={{ color: theme.textSecondary }}>
                        Remove
                      </ThemedText>
                    )}
                  </Pressable>
                ) : null}
              </View>
            );
          })}
        </View>
      )}

      {!staffIsActive && students.length > 0 ? (
        <ThemedText type="small" style={{ color: theme.textTertiary }}>
          Assign and remove are disabled while this staff member is inactive.
        </ThemedText>
      ) : null}

      <StaffStudentAssignPicker
        visible={pickerOpen}
        staffMemberName={staffMemberName}
        organizationId={organizationId}
        assignedStudentIds={students.map((student) => student.id)}
        assigning={assigning}
        onClose={() => setPickerOpen(false)}
        onAssign={handleAssign}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  assignButton: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
  },
  centered: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
  },
  list: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  rowMain: {
    flex: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    gap: 2,
  },
  removeButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    minWidth: 72,
    alignItems: 'center',
  },
});
