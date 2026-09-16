import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { TeacherMyStudentsFilterRows } from '@/components/teacher/students/teacher-my-students-filter-rows';
import { TeacherMyStudentsHeader } from '@/components/teacher/students/teacher-my-students-header';
import { TeacherMyStudentsMetricRow } from '@/components/teacher/students/teacher-my-students-metric-row';
import { TeacherMyStudentsSkeleton } from '@/components/teacher/students/teacher-my-students-skeleton';
import { TeacherNeedsAttentionBanner } from '@/components/teacher/students/teacher-needs-attention-banner';
import { TeacherStudentListItem } from '@/components/teacher/students/teacher-student-list-item';
import { TeacherStudentProfileSheet } from '@/components/teacher/students/teacher-student-profile-sheet';
import { StoryButton } from '@/components/story/story-button';
import { StoryErrorBanner } from '@/components/story/story-error-banner';
import { useTeacherHome } from '@/contexts/teacher-home-context';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { Story, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Radius, Spacing } from '@/constants/theme';
import { useAuthRequiredRedirect } from '@/hooks/use-auth-required-redirect';
import {
  deriveStudentRosterMetrics,
  filterStudentsByRosterFilter,
  matchesStudentSearch,
  type StudentRosterFilter,
} from '@/lib/school-admin/admin-student-roster-metrics';
import {
  listOrgEnrolledStudents,
  type AdminEnrolledStudentSummary,
} from '@/lib/school-admin/enrolled-students';
import { mergeStudentStandingHealthFlags } from '@/lib/school-admin/merge-student-standing-health-flags';
import type { TeacherStudentDetailScope } from '@/lib/teacher/teacher-nav';
import {
  countUnassignedClassroomStudents,
  STUDENTS_PAGE_SIZE,
  studentMatchesClassroomFilter,
  type TeacherClassroomFilter,
  type TeacherRosterScope,
} from '@/lib/teacher/teacher-students-utils';
import { getSupabaseClient } from '@/lib/supabase';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

type TeacherMyStudentsScreenProps = {
  slug: string;
};

function teacherFeatureEnabled(
  features: { teacher?: Record<string, boolean> } | undefined,
  key: string,
): boolean {
  const teacher = features?.teacher;
  if (!teacher || typeof teacher !== 'object') return false;
  return Boolean(teacher[key]);
}

export function TeacherMyStudentsScreen({ slug: _slug }: TeacherMyStudentsScreenProps) {
  const theme = useParentTheme();
  const { data, isLoading, isRefreshing, error, refresh, ensureLoaded } = useTeacherHome();
  const organizationId = data?.organizationId ?? '';
  const { reportError } = useMobileErrorReporter(organizationId);

  const [rosterScope, setRosterScope] = useState<TeacherRosterScope>('assigned');
  const [classroomFilter, setClassroomFilter] = useState<TeacherClassroomFilter>('all');
  const [rosterFilter, setRosterFilter] = useState<StudentRosterFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [schoolStudents, setSchoolStudents] = useState<AdminEnrolledStudentSummary[] | null>(null);
  const [loadingSchool, setLoadingSchool] = useState(false);
  const [schoolError, setSchoolError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(STUDENTS_PAGE_SIZE);
  const [selectedStudent, setSelectedStudent] = useState<AdminEnrolledStudentSummary | null>(null);
  const [selectedDetailAccess, setSelectedDetailAccess] =
    useState<TeacherStudentDetailScope>('assigned');

  const supabase = useMemo(() => getSupabaseClient(), []);

  useAuthRequiredRedirect(error);

  useEffect(() => {
    ensureLoaded();
  }, [ensureLoaded]);

  const assignedStudents = data?.summary.assignedStudents ?? [];
  const staffClassrooms = data?.summary.staffClassrooms ?? [];
  const staffMemberId = data?.summary.staffMemberId ?? null;
  const myStudentsEnabled = teacherFeatureEnabled(data?.features, 'my_students');

  const students = rosterScope === 'assigned' ? assignedStudents : (schoolStudents ?? []);
  const loading = rosterScope === 'assigned' ? isLoading && !data : loadingSchool;

  const assignedMetrics = useMemo(
    () => deriveStudentRosterMetrics(assignedStudents),
    [assignedStudents],
  );
  const schoolMetrics = useMemo(
    () => deriveStudentRosterMetrics(schoolStudents ?? []),
    [schoolStudents],
  );
  const metrics = rosterScope === 'assigned' ? assignedMetrics : schoolMetrics;
  const isSchoolScope = rosterScope === 'school';

  const healthFlagCount = useMemo(
    () => students.filter((student) => student.hasStandingHealthItems).length,
    [students],
  );

  const showProgramMetrics = metrics.programCount > 1;

  const programCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const student of students) {
      for (const programName of student.programNames) {
        counts[programName] = (counts[programName] ?? 0) + 1;
      }
    }
    return counts;
  }, [students]);

  const unassignedClassroomCount = useMemo(
    () => countUnassignedClassroomStudents(assignedStudents),
    [assignedStudents],
  );

  const loadSchoolStudents = useCallback(async () => {
    if (!organizationId) return;

    setLoadingSchool(true);
    setSchoolError(null);

    try {
      const rows = await listOrgEnrolledStudents(supabase, organizationId, { limit: 500 });
      const withFlags = await mergeStudentStandingHealthFlags(supabase, organizationId, rows);
      setSchoolStudents(withFlags);
    } catch (loadError) {
      reportError('teacher_students_load_school', loadError);
      setSchoolError(
        loadError instanceof Error ? loadError.message : 'Failed to load students.',
      );
    } finally {
      setLoadingSchool(false);
    }
  }, [organizationId, reportError, supabase]);

  useEffect(() => {
    if (rosterScope !== 'school' || schoolStudents !== null || !organizationId) return;
    void loadSchoolStudents();
  }, [loadSchoolStudents, organizationId, rosterScope, schoolStudents]);

  const changeRosterScope = (next: TeacherRosterScope) => {
    setRosterScope(next);
    setRosterFilter('all');
    setClassroomFilter('all');
    setVisibleCount(STUDENTS_PAGE_SIZE);
    setSearchQuery('');
  };

  const changeClassroomFilter = (next: TeacherClassroomFilter) => {
    setClassroomFilter(next);
    setVisibleCount(STUDENTS_PAGE_SIZE);
  };

  const changeRosterFilter = (next: StudentRosterFilter) => {
    setRosterFilter(next);
    setVisibleCount(STUDENTS_PAGE_SIZE);
  };

  const filteredStudents = useMemo(() => {
    const byFilter = filterStudentsByRosterFilter(students, rosterFilter);
    const byClassroom =
      rosterScope === 'assigned' && classroomFilter !== 'all'
        ? byFilter.filter((student) =>
            studentMatchesClassroomFilter(student, classroomFilter, staffClassrooms),
          )
        : byFilter;
    return byClassroom.filter((student) => matchesStudentSearch(student, searchQuery));
  }, [classroomFilter, rosterFilter, rosterScope, searchQuery, staffClassrooms, students]);

  const visibleStudents = useMemo(
    () => filteredStudents.slice(0, visibleCount),
    [filteredStudents, visibleCount],
  );

  const hasMoreStudents = visibleStudents.length < filteredStudents.length;

  const handleRefresh = () => {
    void refresh();
    if (rosterScope === 'school') {
      void loadSchoolStudents();
    }
  };

  const handlePressStudent = (student: AdminEnrolledStudentSummary) => {
    setSelectedDetailAccess(rosterScope === 'school' ? 'school' : 'assigned');
    setSelectedStudent(student);
  };

  const focusUnassignedStudents = () => {
    changeRosterFilter('unassigned');
  };

  if (isLoading && !data) {
    return <TeacherMyStudentsSkeleton />;
  }

  if (error && !data) {
    return (
      <View style={[styles.centered, { backgroundColor: Story.paper }]}>
        <Text style={[styles.errorText, { color: theme.muted }]}>{error}</Text>
        <StoryButton label="Try again" onPress={() => void refresh()} style={styles.retry} />
      </View>
    );
  }

  if (!data) return null;

  if (!myStudentsEnabled) {
    return (
      <View style={[styles.centered, { backgroundColor: Story.paper }]}>
        <Text style={[styles.errorText, { color: theme.muted }]}>
          My Students is not enabled for your school.
        </Text>
      </View>
    );
  }

  if (staffMemberId == null) {
    return (
      <View style={[styles.centered, { backgroundColor: Story.paper }]}>
        <Text style={[styles.staffMessage, { color: theme.muted }]}>
          Your account isn&apos;t linked to a staff record. Contact your school administrator so
          they can connect your portal login to the staff directory.
        </Text>
      </View>
    );
  }

  const emptyMessage =
    rosterScope === 'assigned'
      ? 'No students assigned to you yet. Your school admin can assign students from My School → My Students.'
      : 'No enrolled students found at your school yet.';

  const filterMissMessage = 'No students match the current filters.';

  const listHeader = (
    <View style={styles.headerBlock}>
      <Animated.View entering={FadeInDown.duration(350)}>
        <TeacherMyStudentsHeader
          rosterScope={rosterScope}
          assignedCount={assignedStudents.length}
          schoolCount={schoolStudents?.length ?? null}
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(40).duration(350)}>
        <TeacherMyStudentsFilterRows
          rosterScope={rosterScope}
          assignedCount={assignedStudents.length}
          schoolCount={schoolStudents?.length ?? null}
          onScopeChange={changeRosterScope}
          staffClassrooms={staffClassrooms}
          classroomFilter={classroomFilter}
          assignedStudentsCount={assignedStudents.length}
          unassignedClassroomCount={unassignedClassroomCount}
          onClassroomFilterChange={changeClassroomFilter}
          rosterFilter={rosterFilter}
          rosterTotalCount={metrics.totalCount}
          rosterUnassignedCount={metrics.unassignedCount}
          programOptions={metrics.programOptions}
          programCounts={programCounts}
          isSchoolScope={isSchoolScope}
          onRosterFilterChange={changeRosterFilter}
        />
      </Animated.View>

      {!loading && students.length > 0 ? (
        <Animated.View entering={FadeInDown.delay(80).duration(350)}>
          <TeacherMyStudentsMetricRow
            totalCount={metrics.totalCount}
            totalLabel={isSchoolScope ? 'All enrolled' : 'Assigned students'}
            unassignedTeacherCount={isSchoolScope ? metrics.unassignedCount : 0}
            healthFlagCount={healthFlagCount}
            programCount={metrics.programCount}
            showProgramMetric={showProgramMetrics}
          />
        </Animated.View>
      ) : null}

      {isSchoolScope && !loading && metrics.unassignedCount > 0 ? (
        <Animated.View entering={FadeInDown.delay(120).duration(350)}>
          <TeacherNeedsAttentionBanner
            unassignedCount={metrics.unassignedCount}
            onViewUnassigned={focusUnassignedStudents}
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
          placeholder="Search students, families, or email"
          placeholderTextColor={theme.muted}
          style={[styles.searchInput, { color: theme.ink }]}
          value={searchQuery}
          onChangeText={(value) => {
            setSearchQuery(value);
            setVisibleCount(STUDENTS_PAGE_SIZE);
          }}
        />
      </View>

      {schoolError ? <StoryErrorBanner message={schoolError} /> : null}
    </View>
  );

  const listFooter =
    hasMoreStudents ? (
      <View style={styles.showMoreWrap}>
        <StoryButton
          label={`Show more (${filteredStudents.length - visibleStudents.length} remaining)`}
          variant="outline"
          onPress={() => setVisibleCount((current) => current + STUDENTS_PAGE_SIZE)}
        />
      </View>
    ) : null;

  if (loading && students.length === 0) {
    return <TeacherMyStudentsSkeleton />;
  }

  return (
    <>
      <View style={styles.container}>
        <FlatList
          data={visibleStudents}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListHeaderComponent={listHeader}
          ListFooterComponent={listFooter}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing || loadingSchool}
              onRefresh={handleRefresh}
              tintColor={theme.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={[styles.emptyCopy, { color: theme.muted }]}>
                {students.length === 0
                  ? emptyMessage
                  : searchQuery.trim() || rosterFilter !== 'all' || classroomFilter !== 'all'
                    ? filterMissMessage
                    : emptyMessage}
              </Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(Math.min(index * 30, 180)).duration(220)}>
              <TeacherStudentListItem
                student={item}
                onPress={handlePressStudent}
                showTeacherLabel={isSchoolScope}
              />
            </Animated.View>
          )}
        />
      </View>

      <TeacherStudentProfileSheet
        visible={selectedStudent !== null}
        onClose={() => setSelectedStudent(null)}
        studentId={selectedStudent?.id ?? null}
        detailAccess={selectedDetailAccess}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Story.paper,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    gap: Spacing.three,
  },
  errorText: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  staffMessage: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  retry: {
    minWidth: 140,
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
  showMoreWrap: {
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
});
