import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { StoryDetailSection } from '@/components/school-admin/admissions/story-detail-section';
import { ClassroomDetailSkeleton } from '@/components/school-admin/classrooms/classroom-detail-skeleton';
import { ClassroomFormSheet } from '@/components/school-admin/classrooms/classroom-form-sheet';
import { ClassroomStaffAssignPicker } from '@/components/school-admin/classrooms/classroom-staff-assign-picker';
import { ClassroomStudentAssignPicker } from '@/components/school-admin/classrooms/classroom-student-assign-picker';
import { StudentPhoto } from '@/components/school-admin/student-photo';
import { StudentProfileSheet } from '@/components/school-admin/students/student-profile-sheet';
import { StoryButton } from '@/components/story/story-button';
import { StoryChip } from '@/components/story/story-chip';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StoryErrorBanner } from '@/components/story/story-error-banner';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { useParentTheme } from '@/contexts/parent-theme-context';
import type { ClassroomDetail, ClassroomSummary, ProgramOption } from '@/lib/school-admin/classrooms';
import {
  assignStaffToClassroomApi,
  assignStudentsToClassroomApi,
  deleteClassroomApi,
  fetchClassroomDetailApi,
  fetchClassroomStudentsApi,
  fetchClassrooms,
  fetchStaffMembers,
  removeStaffFromClassroomApi,
  removeStudentFromClassroomApi,
  type StaffMemberRecord,
} from '@/lib/school-admin-api';
import {
  formatEnrolledStudentName,
  formatStudentGrade,
  listOrgEnrolledStudents,
  type AdminEnrolledStudentSummary,
} from '@/lib/school-admin/enrolled-students';
import { Story, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';
import { getSupabaseClient } from '@/lib/supabase';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

type ClassroomDetailScreenProps = {
  slug: string;
  organizationId: string;
  classroomId: string;
};

export function ClassroomDetailScreen({
  slug,
  organizationId,
  classroomId,
}: ClassroomDetailScreenProps) {
  const theme = useParentTheme();
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseClient(), []);
  const { reportError } = useMobileErrorReporter(organizationId);

  const [summary, setSummary] = useState<ClassroomSummary | null>(null);
  const [detail, setDetail] = useState<ClassroomDetail | null>(null);
  const [roster, setRoster] = useState<AdminEnrolledStudentSummary[]>([]);
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMemberRecord[]>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<AdminEnrolledStudentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [staffPickerOpen, setStaffPickerOpen] = useState(false);
  const [studentPickerOpen, setStudentPickerOpen] = useState(false);
  const [assigningStaff, setAssigningStaff] = useState(false);
  const [assigningStudents, setAssigningStudents] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [classroomsPayload, detailPayload, rosterPayload, staffPayload] = await Promise.all([
        fetchClassrooms(slug),
        fetchClassroomDetailApi(slug, classroomId),
        fetchClassroomStudentsApi(slug, classroomId),
        fetchStaffMembers(slug),
      ]);
      const classroomSummary =
        classroomsPayload.classrooms.find((entry) => entry.id === classroomId) ?? detailPayload;
      setSummary(classroomSummary);
      setPrograms(classroomsPayload.programs);
      setDetail(detailPayload);
      setRoster(rosterPayload);
      setStaffMembers(staffPayload);
    } catch (loadError) {
      reportError('school_admin_classroom_load', loadError, {
        entityType: 'classroom',
        entityId: classroomId,
      });
      setError(loadError instanceof Error ? loadError.message : 'Failed to load classroom.');
    } finally {
      setLoading(false);
    }
  }, [classroomId, reportError, slug]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const ensureEnrolledStudentsLoaded = useCallback(async () => {
    if (enrolledStudents.length > 0) return;
    const students = await listOrgEnrolledStudents(supabase, organizationId);
    setEnrolledStudents(students);
  }, [enrolledStudents.length, organizationId, supabase]);

  const handleAssignStaff = async (staffMemberId: string, role: 'lead' | 'assistant') => {
    setAssigningStaff(true);
    try {
      await assignStaffToClassroomApi(slug, classroomId, staffMemberId, role);
      await loadData();
    } catch (assignError) {
      reportError('school_admin_classroom_staff_assign', assignError, {
        entityType: 'classroom',
        entityId: classroomId,
        metadata: { staffMemberId, role },
      });
      Alert.alert(
        'Assign failed',
        assignError instanceof Error ? assignError.message : 'Failed to assign staff.',
      );
    } finally {
      setAssigningStaff(false);
    }
  };

  const handleAssignStudents = async (studentIds: string[]) => {
    setAssigningStudents(true);
    try {
      await assignStudentsToClassroomApi(slug, classroomId, studentIds);
      await loadData();
    } catch (assignError) {
      reportError('school_admin_classroom_students_assign', assignError, {
        entityType: 'classroom',
        entityId: classroomId,
        metadata: { studentIds },
      });
      Alert.alert(
        'Assign failed',
        assignError instanceof Error ? assignError.message : 'Failed to assign students.',
      );
    } finally {
      setAssigningStudents(false);
    }
  };

  const handleRemoveStaff = (staffMemberId: string, name: string) => {
    Alert.alert('Remove staff', `Remove ${name} from this classroom?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await removeStaffFromClassroomApi(slug, classroomId, staffMemberId);
              await loadData();
            } catch (removeError) {
              reportError('school_admin_classroom_staff_remove', removeError, {
                entityType: 'classroom',
                entityId: classroomId,
                metadata: { staffMemberId },
              });
              Alert.alert(
                'Remove failed',
                removeError instanceof Error ? removeError.message : 'Failed to remove staff.',
              );
            }
          })();
        },
      },
    ]);
  };

  const handleRemoveStudent = (studentId: string, name: string) => {
    Alert.alert('Remove student', `Remove ${name} from this classroom?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await removeStudentFromClassroomApi(slug, classroomId, studentId);
              await loadData();
            } catch (removeError) {
              reportError('school_admin_classroom_student_remove', removeError, {
                entityType: 'classroom',
                entityId: classroomId,
                metadata: { studentId },
              });
              Alert.alert(
                'Remove failed',
                removeError instanceof Error ? removeError.message : 'Failed to remove student.',
              );
            }
          })();
        },
      },
    ]);
  };

  const handleDelete = () => {
    Alert.alert('Delete classroom', 'This will remove the classroom and unassign its roster.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            setDeleting(true);
            try {
              await deleteClassroomApi(slug, classroomId);
              router.back();
            } catch (deleteError) {
              reportError('school_admin_classroom_delete', deleteError, {
                entityType: 'classroom',
                entityId: classroomId,
              });
              Alert.alert(
                'Delete failed',
                deleteError instanceof Error ? deleteError.message : 'Failed to delete classroom.',
              );
            } finally {
              setDeleting(false);
            }
          })();
        },
      },
    ]);
  };

  if (loading) {
    return <ClassroomDetailSkeleton />;
  }

  if (error || !summary || !detail) {
    return (
      <View style={styles.centered}>
        <StoryErrorBanner message={error ?? 'Classroom not found.'} />
      </View>
    );
  }

  const assignedStaffIds = detail.staff.map((entry) => entry.staffMemberId);
  const assignedStudentIds = roster.map((student) => student.id);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}>
          <Ionicons name="chevron-back" size={20} color={theme.primary} />
          <Text style={[styles.backLabel, { color: theme.primary }]}>Classrooms</Text>
        </Pressable>

        <View style={styles.hero}>
          <StorySectionKicker>Classroom</StorySectionKicker>
          <View style={styles.titleRow}>
            <StoryDisplayHeading size="section">{summary.name}</StoryDisplayHeading>
            <StoryChip tone="success" label={summary.status} />
          </View>
          <Text style={[styles.subtitle, { color: theme.muted }]}>
            {summary.programName ?? 'All programs'} · {summary.studentCount} students ·{' '}
            {summary.staffCount} staff
          </Text>
        </View>

        <View style={styles.actions}>
          <StoryButton label="Edit classroom" variant="soft" onPress={() => setEditOpen(true)} />
          <StoryButton
            label={deleting ? 'Deleting…' : 'Delete classroom'}
            variant="outline"
            onPress={handleDelete}
          />
        </View>

        <StoryDetailSection title="Staff" description="Lead teachers and assistants for this classroom.">
          {detail.staff.length === 0 ? (
            <Text style={[styles.emptyCopy, { color: theme.muted }]}>No staff assigned yet.</Text>
          ) : (
            detail.staff.map((member) => (
              <View key={member.id} style={[styles.row, { borderColor: theme.line }]}>
                <View style={styles.rowCopy}>
                  <Text style={[styles.rowTitle, { color: theme.ink }]}>{member.name}</Text>
                  <Text style={[styles.rowMeta, { color: theme.muted }]}>
                    {member.role === 'lead' ? 'Lead teacher' : 'Assistant'}
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => handleRemoveStaff(member.staffMemberId, member.name)}>
                  <Text style={styles.removeLabel}>Remove</Text>
                </Pressable>
              </View>
            ))
          )}
          <StoryButton
            label="Assign staff →"
            variant="soft"
            onPress={() => setStaffPickerOpen(true)}
          />
        </StoryDetailSection>

        <StoryDetailSection title="Student roster" description="Enrolled learners assigned to this classroom.">
          {roster.length === 0 ? (
            <Text style={[styles.emptyCopy, { color: theme.muted }]}>No students assigned yet.</Text>
          ) : (
            roster.map((student) => {
              const name = formatEnrolledStudentName(student);
              return (
                <View key={student.id} style={[styles.row, { borderColor: theme.line }]}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={name}
                    onPress={() => setSelectedStudentId(student.id)}
                    style={({ pressed }) => [styles.rowMain, pressed && { opacity: 0.7 }]}>
                    <StudentPhoto name={name} photoUrl={student.profilePhotoUrl} size="sm" />
                    <View style={styles.rowCopy}>
                      <Text style={[styles.rowTitle, { color: theme.ink }]}>{name}</Text>
                      <Text style={[styles.rowMeta, { color: theme.muted }]}>
                        {[formatStudentGrade(student.grade), student.programNames[0]]
                          .filter(Boolean)
                          .join(' · ')}
                      </Text>
                    </View>
                  </Pressable>
                  <Pressable accessibilityRole="button" onPress={() => handleRemoveStudent(student.id, name)}>
                    <Text style={styles.removeLabel}>Remove</Text>
                  </Pressable>
                </View>
              );
            })
          )}
          <StoryButton
            label="Add students →"
            variant="soft"
            onPress={() => {
              void ensureEnrolledStudentsLoaded();
              setStudentPickerOpen(true);
            }}
          />
        </StoryDetailSection>
      </ScrollView>

      <ClassroomFormSheet
        visible={editOpen}
        slug={slug}
        programs={programs}
        classroom={summary}
        onClose={() => setEditOpen(false)}
        onSaved={() => void loadData()}
      />

      <ClassroomStaffAssignPicker
        visible={staffPickerOpen}
        classroomName={summary.name}
        staffMembers={staffMembers}
        assignedStaffIds={assignedStaffIds}
        saving={assigningStaff}
        onClose={() => setStaffPickerOpen(false)}
        onSave={handleAssignStaff}
      />

      <ClassroomStudentAssignPicker
        visible={studentPickerOpen}
        classroomName={summary.name}
        classroomProgramName={summary.programName}
        students={enrolledStudents}
        assignedStudentIds={assignedStudentIds}
        saving={assigningStudents}
        onClose={() => setStudentPickerOpen(false)}
        onSave={handleAssignStudents}
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
  container: { flex: 1, backgroundColor: Story.paper },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
    backgroundColor: Story.paper,
  },
  scrollContent: { paddingHorizontal: SCREEN_HORIZONTAL_PADDING, paddingTop: Spacing.four, gap: Spacing.four, paddingBottom: Spacing.six },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 2, alignSelf: 'flex-start' },
  backLabel: { fontFamily: StoryFonts.bodySemiBold, fontSize: 14 },
  hero: { gap: Spacing.one },
  titleRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: Spacing.two },
  subtitle: { fontFamily: StoryFonts.body, fontSize: 14, lineHeight: 20 },
  actions: { gap: Spacing.two },
  emptyCopy: { fontFamily: StoryFonts.body, fontSize: 14, lineHeight: 20 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.three,
    marginBottom: Spacing.two,
  },
  rowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  rowCopy: { flex: 1, gap: 2 },
  rowTitle: { fontFamily: StoryFonts.bodySemiBold, fontSize: 15 },
  rowMeta: { fontFamily: StoryFonts.body, fontSize: 12 },
  removeLabel: { fontFamily: StoryFonts.bodySemiBold, fontSize: 13, color: '#B5594A' },
});
