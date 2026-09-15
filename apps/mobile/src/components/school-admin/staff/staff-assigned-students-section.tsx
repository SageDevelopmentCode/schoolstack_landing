import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { StaffAssignedStudentsSkeleton } from '@/components/school-admin/staff/staff-assigned-students-skeleton';
import { StaffStudentAssignPicker } from '@/components/school-admin/staff/staff-student-assign-picker';
import { StudentPhoto } from '@/components/school-admin/student-photo';
import { StudentProfileSheet } from '@/components/school-admin/students/student-profile-sheet';
import { StoryCard } from '@/components/story/story-card';
import { StoryTextLink } from '@/components/story/story-text-link';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import {
  assignStudentsToStaffApi,
  fetchStaffAssignedStudents,
  unassignStudentFromStaffApi,
  type AdminEnrolledStudentSummary,
} from '@/lib/school-admin-api';
import { formatStaffApiError } from '@/lib/school-admin/staff-labels';
import {
  formatEnrolledStudentName,
  formatStudentGrade,
} from '@/lib/school-admin/enrolled-students';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

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
  const theme = useParentTheme();
  const { reportError } = useMobileErrorReporter(organizationId);

  const [students, setStudents] = useState<AdminEnrolledStudentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [removingStudentId, setRemovingStudentId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchStaffAssignedStudents(slug, staffMemberId);
      setStudents(rows);
    } catch (loadError) {
      reportError('school_admin_staff_students_load', loadError, {
        entityType: 'staff_member',
        entityId: staffMemberId,
      });
      setError(formatStaffApiError(loadError, 'Failed to load assigned students.'));
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [reportError, slug, staffMemberId]);

  useEffect(() => {
    void loadStudents();
  }, [loadStudents]);

  const handleAssign = async (studentIds: string[]) => {
    setAssigning(true);
    try {
      await assignStudentsToStaffApi(slug, staffMemberId, studentIds);
      await loadStudents();
    } catch (assignError) {
      reportError('school_admin_staff_students_assign', assignError, {
        entityType: 'staff_member',
        entityId: staffMemberId,
        metadata: { studentIds },
      });
      Alert.alert('Error', formatStaffApiError(assignError, 'Failed to assign students.'));
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
      await unassignStudentFromStaffApi(slug, staffMemberId, studentId);
      setStudents((current) => current.filter((row) => row.id !== studentId));
    } catch (unassignError) {
      reportError('school_admin_staff_students_unassign', unassignError, {
        entityType: 'staff_member',
        entityId: staffMemberId,
        metadata: { studentId },
      });
      Alert.alert('Error', formatStaffApiError(unassignError, 'Failed to unassign student.'));
    } finally {
      setRemovingStudentId(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.countLabel, { color: theme.muted }]}>
          {loading ? 'Loading…' : `${students.length} assigned`}
        </Text>
        {staffIsActive ? (
          <StoryTextLink label="Assign student" onPress={() => setPickerOpen(true)} />
        ) : null}
      </View>

      {loading ? (
        <StaffAssignedStudentsSkeleton />
      ) : error ? (
        <Text style={[styles.emptyCopy, { color: theme.muted }]}>{error}</Text>
      ) : students.length === 0 ? (
        <Text style={[styles.emptyCopy, { color: theme.muted }]}>No students assigned yet.</Text>
      ) : (
        <View style={styles.list}>
          {students.map((student) => {
            const studentName = formatEnrolledStudentName(student);
            const programLabel =
              student.programNames.length > 0 ? student.programNames.join(', ') : '—';
            const gradeLabel = formatStudentGrade(student.grade) ?? '—';
            const isRemoving = removingStudentId === student.id;

            return (
              <StoryCard key={student.id} compact style={styles.row}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={studentName}
                  onPress={() => setSelectedStudentId(student.id)}
                  style={({ pressed }) => [styles.rowMain, pressed && { opacity: 0.7 }]}>
                  <StudentPhoto
                    name={studentName}
                    photoUrl={student.profilePhotoUrl}
                    size="row"
                    showHealthIndicator={student.hasStandingHealthItems}
                  />
                  <View style={styles.rowCopy}>
                    <Text style={[styles.studentName, { color: theme.ink }]}>{studentName}</Text>
                    <Text style={[styles.studentMeta, { color: theme.muted }]}>
                      {gradeLabel} · {programLabel}
                    </Text>
                  </View>
                </Pressable>
                {staffIsActive ? (
                  <Pressable
                    accessibilityRole="button"
                    disabled={isRemoving}
                    onPress={() => confirmUnassign(student)}
                    style={({ pressed }) => [styles.removeButton, pressed && { opacity: 0.7 }]}>
                    {isRemoving ? (
                      <ActivityIndicator color={theme.muted} size="small" />
                    ) : (
                      <Text style={[styles.removeLabel, { color: theme.muted }]}>Remove</Text>
                    )}
                  </Pressable>
                ) : null}
              </StoryCard>
            );
          })}
        </View>
      )}

      {!staffIsActive && students.length > 0 ? (
        <Text style={[styles.emptyCopy, { color: theme.muted }]}>
          Assign and remove are disabled while this staff member is inactive.
        </Text>
      ) : null}

      <StaffStudentAssignPicker
        visible={pickerOpen}
        staffMemberName={staffMemberName}
        staffMemberId={staffMemberId}
        organizationId={organizationId}
        assignedStudentIds={students.map((student) => student.id)}
        saving={assigning}
        onClose={() => setPickerOpen(false)}
        onSave={handleAssign}
      />

      <StudentProfileSheet
        visible={selectedStudentId != null}
        studentId={selectedStudentId}
        organizationId={organizationId}
        slug={slug}
        onClose={() => setSelectedStudentId(null)}
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
  countLabel: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  emptyCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  list: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: StoryCardPadding,
    gap: Spacing.two,
  },
  rowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  rowCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  studentName: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    lineHeight: 20,
  },
  studentMeta: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  removeButton: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    minWidth: 72,
    alignItems: 'center',
  },
  removeLabel: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
  },
});
