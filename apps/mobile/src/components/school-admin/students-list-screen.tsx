import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { StudentListItem } from '@/components/school-admin/student-list-item';
import { ADMIN_LIST_HORIZONTAL_PADDING, AdminListSeparator } from '@/components/school-admin/admin-list-layout';
import { StudentsListSkeleton } from '@/components/school-admin/students-list-skeleton';
import { StudentTeacherAssignPicker } from '@/components/school-admin/student-teacher-assign-picker';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import {
  assignStudentTeacher,
  formatEnrolledStudentName,
  formatStudentGrade,
  listOrgEnrolledStudents,
  listOrgStaffMembers,
  type AdminEnrolledStudentSummary,
  type OrgStaffMemberRecord,
} from '@/lib/school-admin/enrolled-students';
import { getSupabaseClient } from '@/lib/supabase';

type StudentsListScreenProps = {
  organizationId: string;
  slug: string;
};

function matchesSearch(student: AdminEnrolledStudentSummary, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  const haystack = [
    formatEnrolledStudentName(student),
    student.grade ?? '',
    formatStudentGrade(student.grade) ?? '',
    student.familyName ?? '',
    student.assignedTeacherName ?? '',
    student.primaryContactName ?? '',
    student.primaryContactEmail ?? '',
    student.programNames.join(' '),
  ]
    .join(' ')
    .toLowerCase();

  return haystack.includes(normalized);
}

function ListSeparator() {
  return <AdminListSeparator />;
}

export function StudentsListScreen({ organizationId, slug }: StudentsListScreenProps) {
  const theme = useAdminTheme();
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseClient(), []);

  const [students, setStudents] = useState<AdminEnrolledStudentSummary[]>([]);
  const [staffMembers, setStaffMembers] = useState<OrgStaffMemberRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [staffError, setStaffError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [assigningStudentId, setAssigningStudentId] = useState<string | null>(null);
  const [pickerStudent, setPickerStudent] = useState<AdminEnrolledStudentSummary | null>(null);

  const activeStaff = useMemo(
    () => staffMembers.filter((member) => member.employmentStatus === 'active'),
    [staffMembers],
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setStaffError(null);
    try {
      const nextStudents = await listOrgEnrolledStudents(supabase, organizationId);
      setStudents(nextStudents);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load students.');
      setStudents([]);
    } finally {
      setLoading(false);
    }

    try {
      const nextStaff = await listOrgStaffMembers(supabase, organizationId);
      setStaffMembers(nextStaff);
    } catch (loadError) {
      setStaffMembers([]);
      setStaffError(
        loadError instanceof Error ? loadError.message : 'Failed to load staff for teacher assignment.',
      );
    }
  }, [organizationId, supabase]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredStudents = useMemo(
    () => students.filter((student) => matchesSearch(student, searchQuery)),
    [searchQuery, students],
  );

  const handlePressStudent = (student: AdminEnrolledStudentSummary) => {
    router.push(`/school-admin/${slug}/students/${student.id}`);
  };

  const handleAssignTeacher = async (studentId: string, staffMemberId: string | null) => {
    setAssigningStudentId(studentId);
    try {
      const result = await assignStudentTeacher(supabase, {
        organizationId,
        studentId,
        staffMemberId,
      });
      setStudents((current) =>
        current.map((student) =>
          student.id === studentId
            ? {
                ...student,
                assignedTeacherId: result.assignedTeacherId,
                assignedTeacherName: result.assignedTeacherName,
              }
            : student,
        ),
      );
    } catch (assignError) {
      setError(assignError instanceof Error ? assignError.message : 'Failed to assign teacher.');
    } finally {
      setAssigningStudentId(null);
    }
  };

  const listHeader = useMemo(
    () => (
      <View style={styles.listHeader}>
        <View
          style={[
            styles.searchField,
            {
              backgroundColor: theme.input,
              borderColor: theme.inputBorder,
            },
          ]}>
          <Ionicons name="search" size={18} color={theme.textTertiary} />
          <TextInput
            accessibilityLabel="Search students"
            placeholder="Search students"
            placeholderTextColor={theme.textTertiary}
            style={[styles.searchInput, { color: theme.textPrimary }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {error ? (
          <ThemedText type="small" style={{ color: theme.error }}>
            {error}
          </ThemedText>
        ) : null}

        {staffError ? (
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {staffError}
          </ThemedText>
        ) : null}
      </View>
    ),
    [error, searchQuery, staffError, theme],
  );

  if (loading) {
    return <StudentsListSkeleton />;
  }

  if (error && students.length === 0) {
    return (
      <View style={styles.container}>
        {listHeader}
        <View style={styles.centered}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {error}
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredStudents}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={ListSeparator}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: 'center' }}>
              {students.length === 0
                ? 'No enrolled students yet.'
                : 'No students match your search.'}
            </ThemedText>
            {students.length === 0 ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => router.replace(`/school-admin/${slug}/admissions/submissions`)}
                style={({ pressed }) => [styles.emptyLink, pressed && { opacity: 0.7 }]}>
                <ThemedText type="smallBold" style={{ color: theme.accent }}>
                  Go to Admissions
                </ThemedText>
              </Pressable>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <StudentListItem
            student={item}
            onPress={handlePressStudent}
            onPressTeacher={setPickerStudent}
          />
        )}
      />

      <StudentTeacherAssignPicker
        visible={pickerStudent !== null}
        studentName={pickerStudent ? formatEnrolledStudentName(pickerStudent) : ''}
        assignedTeacherId={pickerStudent?.assignedTeacherId ?? null}
        activeStaff={activeStaff}
        assigning={pickerStudent ? assigningStudentId === pickerStudent.id : false}
        onClose={() => setPickerStudent(null)}
        onAssign={async (staffMemberId) => {
          if (!pickerStudent) return;
          await handleAssignTeacher(pickerStudent.id, staffMemberId);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  listHeader: {
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
    gap: Spacing.two,
  },
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: Fonts.body,
    padding: 0,
  },
  listContent: {
    paddingHorizontal: ADMIN_LIST_HORIZONTAL_PADDING,
    paddingBottom: Spacing.four,
    flexGrow: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.five,
    gap: Spacing.two,
  },
  emptyLink: {
    marginTop: Spacing.one,
  },
});
