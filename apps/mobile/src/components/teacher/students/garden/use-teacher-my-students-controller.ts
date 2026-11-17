import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { HEALTH_NOTES_FILTER } from '@/components/teacher/students/garden/teacher-my-students-status';
import { useTeacherHome } from '@/contexts/teacher-home-context';
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
import { getSupabaseClient } from '@/lib/supabase';
import { isTeacherFeatureEnabled } from '@/lib/teacher/teacher-features';
import { teacherStudentDetailRoute } from '@/lib/teacher/teacher-nav';
import {
  countUnassignedClassroomStudents,
  STUDENTS_PAGE_SIZE,
  studentMatchesClassroomFilter,
  type TeacherClassroomFilter,
  type TeacherRosterScope,
} from '@/lib/teacher/teacher-students-utils';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

export type MyStudentsStatus = 'loading' | 'error' | 'disabled' | 'no-staff' | 'ready';

/**
 * My Students data and routes (moved from the Story screen: same queries,
 * filters, search, paging and `reportError` operations). No UI, no toasts.
 * Adds the "health notes" roster filter (a number tile) and pushes the
 * full-screen student page instead of opening a sheet.
 */
export function useTeacherMyStudentsController(slug: string) {
  const router = useRouter();
  const {
    data,
    isLoading,
    isRefreshing,
    error,
    refresh,
    ensureLoaded,
    updatedAt,
    healthFlagOverrides,
  } = useTeacherHome();
  const organizationId = data?.organizationId ?? '';
  const { reportError } = useMobileErrorReporter(organizationId);

  const [rosterScope, setRosterScope] = useState<TeacherRosterScope>('assigned');
  const [classroomFilter, setClassroomFilter] = useState<TeacherClassroomFilter>('all');
  const [rosterFilter, setRosterFilter] = useState<StudentRosterFilter>('all');
  const [searchQuery, setSearchQueryState] = useState('');
  const [schoolStudentsRaw, setSchoolStudents] = useState<AdminEnrolledStudentSummary[] | null>(null);
  const [loadingSchool, setLoadingSchool] = useState(false);
  const [schoolError, setSchoolError] = useState<string | null>(null);
  const [schoolLoadedAt, setSchoolLoadedAt] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(STUDENTS_PAGE_SIZE);

  const supabase = useMemo(() => getSupabaseClient(), []);

  useAuthRequiredRedirect(error);

  useEffect(() => {
    ensureLoaded();
  }, [ensureLoaded]);

  const assignedStudents = useMemo(() => data?.summary.assignedStudents ?? [], [data]);
  const staffClassrooms = useMemo(() => data?.summary.staffClassrooms ?? [], [data]);
  const staffMemberId = data?.summary.staffMemberId ?? null;
  const myStudentsEnabled = isTeacherFeatureEnabled(data?.features, 'my_students');

  // Health changes made on a student page this session also apply to the school list.
  const schoolStudents = useMemo(() => {
    if (!schoolStudentsRaw || healthFlagOverrides.size === 0) return schoolStudentsRaw;
    return schoolStudentsRaw.map((student) => {
      const flag = healthFlagOverrides.get(student.id);
      return flag === undefined || flag === student.hasStandingHealthItems
        ? student
        : { ...student, hasStandingHealthItems: flag };
    });
  }, [healthFlagOverrides, schoolStudentsRaw]);

  const isSchoolScope = rosterScope === 'school';
  const students = useMemo(
    () => (isSchoolScope ? (schoolStudents ?? []) : assignedStudents),
    [assignedStudents, isSchoolScope, schoolStudents],
  );
  /** The school list is loading for the first time (nothing to show yet). */
  const schoolLoadingFirst = isSchoolScope && loadingSchool && schoolStudents === null;

  const metrics = useMemo(() => deriveStudentRosterMetrics(students), [students]);

  const healthFlagCount = useMemo(
    () => students.filter((student) => student.hasStandingHealthItems).length,
    [students],
  );

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
      setSchoolLoadedAt(Date.now());
    } catch (loadError) {
      reportError('teacher_students_load_school', loadError);
      setSchoolError(loadError instanceof Error ? loadError.message : 'Failed to load students.');
    } finally {
      setLoadingSchool(false);
    }
  }, [organizationId, reportError, supabase]);

  useEffect(() => {
    if (rosterScope !== 'school' || schoolStudentsRaw !== null || !organizationId) return;
    if (loadingSchool || schoolError) return;
    queueMicrotask(() => void loadSchoolStudents());
  }, [loadSchoolStudents, loadingSchool, organizationId, rosterScope, schoolError, schoolStudentsRaw]);

  const changeRosterScope = useCallback((next: TeacherRosterScope) => {
    // Switching back to All students after a failed load tries again (as before).
    if (next === 'school') setSchoolError(null);
    setRosterScope(next);
    setRosterFilter('all');
    setClassroomFilter('all');
    setVisibleCount(STUDENTS_PAGE_SIZE);
    setSearchQueryState('');
  }, []);

  const changeClassroomFilter = useCallback((next: TeacherClassroomFilter) => {
    setClassroomFilter(next);
    setVisibleCount(STUDENTS_PAGE_SIZE);
  }, []);

  const changeRosterFilter = useCallback((next: StudentRosterFilter) => {
    setRosterFilter(next);
    setVisibleCount(STUDENTS_PAGE_SIZE);
  }, []);

  const setSearchQuery = useCallback((value: string) => {
    setSearchQueryState(value);
    setVisibleCount(STUDENTS_PAGE_SIZE);
  }, []);

  const clearFilters = useCallback(() => {
    setRosterFilter('all');
    setClassroomFilter('all');
    setSearchQueryState('');
    setVisibleCount(STUDENTS_PAGE_SIZE);
  }, []);

  const filteredStudents = useMemo(() => {
    const byFilter =
      rosterFilter === HEALTH_NOTES_FILTER
        ? students.filter((student) => student.hasStandingHealthItems)
        : filterStudentsByRosterFilter(students, rosterFilter);
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
  const remainingCount = filteredStudents.length - visibleStudents.length;

  const showMore = useCallback(() => setVisibleCount((current) => current + STUDENTS_PAGE_SIZE), []);

  /** Pull to refresh: home data, plus the school list in school scope. */
  const refreshAll = useCallback(async () => {
    await Promise.all([refresh(), isSchoolScope ? loadSchoolStudents() : Promise.resolve()]);
  }, [isSchoolScope, loadSchoolStudents, refresh]);

  const openStudent = useCallback(
    (student: AdminEnrolledStudentSummary) => {
      router.push(teacherStudentDetailRoute(slug, student.id, { scope: isSchoolScope ? 'school' : 'assigned' }));
    },
    [isSchoolScope, router, slug],
  );

  const status: MyStudentsStatus =
    isLoading && !data
      ? 'loading'
      : error && !data
        ? 'error'
        : !data
          ? 'loading'
          : !myStudentsEnabled
            ? 'disabled'
            : staffMemberId == null
              ? 'no-staff'
              : 'ready';

  const filtering =
    rosterFilter !== 'all' || classroomFilter !== 'all' || searchQuery.trim().length > 0;

  return {
    slug,
    status,
    error,
    organizationId,
    reload: refresh,
    isRefreshing,
    lastUpdatedAt: isSchoolScope ? schoolLoadedAt : updatedAt,
    rosterScope,
    isSchoolScope,
    changeRosterScope,
    classroomFilter,
    changeClassroomFilter,
    rosterFilter,
    changeRosterFilter,
    searchQuery,
    setSearchQuery,
    clearFilters,
    filtering,
    assignedStudents,
    schoolStudents,
    schoolLoadingFirst,
    loadingSchool,
    schoolError,
    retrySchool: loadSchoolStudents,
    staffClassrooms,
    students,
    metrics,
    healthFlagCount,
    programCounts,
    unassignedClassroomCount,
    filteredStudents,
    visibleStudents,
    remainingCount,
    showMore,
    refreshAll,
    openStudent,
  };
}

export type TeacherMyStudentsController = ReturnType<typeof useTeacherMyStudentsController>;
