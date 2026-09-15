import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { StudentClassroomAssignPicker } from '@/components/school-admin/students/student-classroom-assign-picker';
import { StudentStoryListItem } from '@/components/school-admin/students/student-story-list-item';
import { StudentsMetricRow } from '@/components/school-admin/students/students-metric-row';
import { StudentsNeedsAttentionBanner } from '@/components/school-admin/students/students-needs-attention-banner';
import { StudentsRosterFilters } from '@/components/school-admin/students/students-roster-filters';
import { StudentsStoryHeader } from '@/components/school-admin/students/students-story-header';
import { StudentsListSkeleton } from '@/components/school-admin/students-list-skeleton';
import { StoryErrorBanner } from '@/components/story/story-error-banner';
import { useSchoolAdminStudents } from '@/contexts/school-admin-students-context';
import { useParentTheme } from '@/contexts/parent-theme-context';
import {
  deriveStudentRosterMetrics,
  filterStudentsByRosterFilter,
  matchesStudentSearch,
  type StudentRosterFilter,
} from '@/lib/school-admin/admin-student-roster-metrics';
import {
  formatEnrolledStudentName,
  type AdminEnrolledStudentSummary,
} from '@/lib/school-admin/enrolled-students';
import type { ClassroomSummary } from '@/lib/school-admin/classrooms';
import { fetchClassrooms, setStudentClassroomsApi } from '@/lib/school-admin-api';
import { Story, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Radius, Spacing } from '@/constants/theme';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

type StudentsListScreenProps = {
  organizationId: string;
  slug: string;
};

export function StudentsListScreen({ organizationId, slug }: StudentsListScreenProps) {
  const theme = useParentTheme();
  const router = useRouter();
  const { reportError } = useMobileErrorReporter(organizationId);
  const { students, isLoading, isRefreshing, error, staffError, refresh } =
    useSchoolAdminStudents();

  const [searchQuery, setSearchQuery] = useState('');
  const [rosterFilter, setRosterFilter] = useState<StudentRosterFilter>('all');
  const [pickerStudent, setPickerStudent] = useState<AdminEnrolledStudentSummary | null>(null);
  const [classrooms, setClassrooms] = useState<ClassroomSummary[]>([]);
  const [classroomsLoading, setClassroomsLoading] = useState(false);
  const [classroomsLoaded, setClassroomsLoaded] = useState(false);
  const [assigningStudentId, setAssigningStudentId] = useState<string | null>(null);
  const [assignError, setAssignError] = useState<string | null>(null);

  const metrics = useMemo(() => deriveStudentRosterMetrics(students), [students]);

  const programCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const student of students) {
      for (const programName of student.programNames) {
        counts[programName] = (counts[programName] ?? 0) + 1;
      }
    }
    return counts;
  }, [students]);

  const filteredStudents = useMemo(() => {
    const byFilter = filterStudentsByRosterFilter(students, rosterFilter);
    return byFilter.filter((student) => matchesStudentSearch(student, searchQuery));
  }, [rosterFilter, searchQuery, students]);

  const ensureClassroomsLoaded = useCallback(async () => {
    if (classroomsLoaded || classroomsLoading) return;
    setClassroomsLoading(true);
    try {
      const payload = await fetchClassrooms(slug);
      setClassrooms(payload.classrooms);
      setClassroomsLoaded(true);
    } catch (loadError) {
      reportError('school_admin_classrooms_load', loadError);
      setAssignError('Failed to load classrooms.');
    } finally {
      setClassroomsLoading(false);
    }
  }, [classroomsLoaded, classroomsLoading, reportError, slug]);

  const handlePressStudent = (student: AdminEnrolledStudentSummary) => {
    router.push(`/school-admin/${slug}/students/${student.id}`);
  };

  const handlePressClassroom = (student: AdminEnrolledStudentSummary) => {
    void ensureClassroomsLoaded();
    setPickerStudent(student);
  };

  const handleAssignClassrooms = async (studentId: string, classroomIds: string[]) => {
    setAssigningStudentId(studentId);
    setAssignError(null);
    try {
      await setStudentClassroomsApi(slug, studentId, classroomIds);
      await refresh({ silent: true });
    } catch (assignError) {
      reportError('school_admin_student_classrooms_assign', assignError, {
        entityType: 'student',
        entityId: studentId,
        metadata: { classroomIds },
      });
      setAssignError(
        assignError instanceof Error ? assignError.message : 'Failed to assign classrooms.',
      );
      throw assignError;
    } finally {
      setAssigningStudentId(null);
    }
  };

  const handleRefresh = () => {
    void refresh({ silent: true });
  };

  const listHeader = (
    <View style={styles.headerBlock}>
      <Animated.View entering={FadeInDown.duration(350)}>
        <StudentsStoryHeader totalCount={metrics.totalCount} />
      </Animated.View>

      {students.length > 0 ? (
        <Animated.View entering={FadeInDown.delay(40).duration(350)}>
          <StudentsMetricRow
            totalCount={metrics.totalCount}
            unassignedCount={metrics.unassignedCount}
            programCount={metrics.programCount}
            newEnrollmentCount={metrics.newEnrollmentCount}
          />
        </Animated.View>
      ) : null}

      {metrics.unassignedCount > 0 ? (
        <Animated.View entering={FadeInDown.delay(80).duration(350)}>
          <StudentsNeedsAttentionBanner
            unassignedCount={metrics.unassignedCount}
            onShowUnassigned={() => setRosterFilter('unassigned')}
          />
        </Animated.View>
      ) : null}

      {students.length > 0 ? (
        <Animated.View entering={FadeInDown.delay(120).duration(350)}>
          <StudentsRosterFilters
            activeFilter={rosterFilter}
            totalCount={metrics.totalCount}
            unassignedCount={metrics.unassignedCount}
            programOptions={metrics.programOptions}
            programCounts={programCounts}
            onChange={setRosterFilter}
          />
        </Animated.View>
      ) : null}

      <View
        style={[
          styles.searchField,
          {
            backgroundColor: theme.white,
            borderColor: Story.line,
          },
        ]}>
        <Ionicons name="search" size={18} color={theme.muted} />
        <TextInput
          accessibilityLabel="Search students"
          placeholder="Search students"
          placeholderTextColor={theme.muted}
          style={[styles.searchInput, { color: theme.ink }]}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {error ? <StoryErrorBanner message={error} /> : null}
      {assignError ? <StoryErrorBanner message={assignError} /> : null}
      {staffError ? (
        <Text style={[styles.staffError, { color: theme.muted }]}>{staffError}</Text>
      ) : null}
    </View>
  );

  if (isLoading && students.length === 0) {
    return <StudentsListSkeleton />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredStudents}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={listHeader}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyCopy, { color: theme.muted }]}>
              {students.length === 0
                ? 'No enrolled students yet.'
                : rosterFilter === 'unassigned'
                  ? 'No unassigned students right now.'
                  : 'No students match your search.'}
            </Text>
            {students.length === 0 ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => router.replace(`/school-admin/${slug}/admissions/submissions`)}
                style={({ pressed }) => [pressed && { opacity: 0.7 }]}>
                <Text style={[styles.emptyLink, { color: theme.primary }]}>Go to Admissions →</Text>
              </Pressable>
            ) : null}
          </View>
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(Math.min(index * 30, 180)).duration(220)}>
            <StudentStoryListItem
              student={item}
              onPress={handlePressStudent}
              onPressClassroom={handlePressClassroom}
            />
          </Animated.View>
        )}
      />

      <StudentClassroomAssignPicker
        visible={pickerStudent !== null}
        studentName={pickerStudent ? formatEnrolledStudentName(pickerStudent) : ''}
        studentProgramNames={pickerStudent?.programNames ?? []}
        studentProgramIds={pickerStudent?.programIds ?? []}
        classroomIds={pickerStudent?.classroomIds ?? []}
        classrooms={classrooms}
        loading={classroomsLoading || (pickerStudent !== null && !classroomsLoaded)}
        saving={pickerStudent ? assigningStudentId === pickerStudent.id : false}
        onClose={() => setPickerStudent(null)}
        onAddClassroom={() => {
          setPickerStudent(null);
          router.push(`/school-admin/${slug}/more/classrooms`);
        }}
        onSave={async (classroomIds) => {
          if (!pickerStudent) return;
          await handleAssignClassrooms(pickerStudent.id, classroomIds);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Story.paper,
  },
  headerBlock: {
    gap: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
  },
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Radius.pill,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: StoryFonts.body,
    padding: 0,
  },
  staffError: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  listContent: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingBottom: Spacing.five,
    flexGrow: 1,
  },
  separator: {
    height: Spacing.two,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.five,
    gap: Spacing.two,
  },
  emptyCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  emptyLink: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
  },
});
