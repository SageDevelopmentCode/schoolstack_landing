import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useSchoolAdminStudents } from '@/contexts/school-admin-students-context';
import {
  deriveStudentRosterMetrics,
  filterStudentsByRosterFilter,
  isRecentEnrollment,
  matchesStudentSearch,
  type StudentRosterFilter,
} from '@/lib/school-admin/admin-student-roster-metrics';
import type { ClassroomSummary } from '@/lib/school-admin/classrooms';
import type { AdminEnrolledStudentSummary } from '@/lib/school-admin/enrolled-students';
import { fetchClassrooms, setStudentClassroomsApi } from '@/lib/school-admin-api';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

/** KPI-only filter ("New enrollments" tile): enrolled in the last 30 days. Never a program name. */
export const NEW_ENROLLMENTS_FILTER = '__new_enrollments__';

/**
 * Students roster data, filters, classroom loading/saving and routes (moved
 * from `students-list-screen.tsx`, same calls and `reportError` operations).
 * No UI, no toasts.
 */
export function useStudentsListController({
  organizationId,
  slug,
}: {
  organizationId: string;
  slug: string;
}) {
  const router = useRouter();
  const { reportError } = useMobileErrorReporter(organizationId);
  const { students, isLoading, isRefreshing, error, staffError, refresh } = useSchoolAdminStudents();

  const [searchQuery, setSearchQuery] = useState('');
  const [rosterFilter, setRosterFilter] = useState<StudentRosterFilter>('all');
  const [pickerStudentId, setPickerStudentId] = useState<string | null>(null);
  const [classrooms, setClassrooms] = useState<ClassroomSummary[]>([]);
  const [classroomsLoading, setClassroomsLoading] = useState(false);
  const [classroomsLoaded, setClassroomsLoaded] = useState(false);
  const [classroomsError, setClassroomsError] = useState<string | null>(null);
  const [assigningStudentId, setAssigningStudentId] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);

  useEffect(() => {
    if (isLoading && students.length === 0) return;
    queueMicrotask(() => setLastUpdatedAt(Date.now()));
  }, [isLoading, students]);

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
    const byFilter =
      rosterFilter === NEW_ENROLLMENTS_FILTER
        ? students.filter((student) => isRecentEnrollment(student.enrolledAt))
        : filterStudentsByRosterFilter(students, rosterFilter);
    return byFilter.filter((student) => matchesStudentSearch(student, searchQuery));
  }, [rosterFilter, searchQuery, students]);

  /** The picker reads the live roster row, so it reflects a save straight away. */
  const pickerStudent = useMemo(
    () => (pickerStudentId ? (students.find((student) => student.id === pickerStudentId) ?? null) : null),
    [pickerStudentId, students],
  );

  const ensureClassroomsLoaded = useCallback(async () => {
    if (classroomsLoaded || classroomsLoading) return;
    setClassroomsLoading(true);
    setClassroomsError(null);
    try {
      const payload = await fetchClassrooms(slug);
      setClassrooms(payload.classrooms);
      setClassroomsLoaded(true);
    } catch (loadError) {
      reportError('school_admin_classrooms_load', loadError);
      setClassroomsError('Failed to load classrooms.');
    } finally {
      setClassroomsLoading(false);
    }
  }, [classroomsLoaded, classroomsLoading, reportError, slug]);

  const openStudent = useCallback(
    (student: Pick<AdminEnrolledStudentSummary, 'id'>) => {
      router.push(`/school-admin/${slug}/students/${student.id}`);
    },
    [router, slug],
  );

  const openClassroomPicker = useCallback(
    (student: AdminEnrolledStudentSummary) => {
      void ensureClassroomsLoaded();
      setPickerStudentId(student.id);
    },
    [ensureClassroomsLoaded],
  );

  const closeClassroomPicker = useCallback(() => setPickerStudentId(null), []);

  /** PATCH classrooms then refresh the roster. Reports and rethrows on failure. */
  const assignClassrooms = useCallback(
    async (studentId: string, classroomIds: string[]) => {
      setAssigningStudentId(studentId);
      try {
        await setStudentClassroomsApi(slug, studentId, classroomIds);
        await refresh({ silent: true });
      } catch (assignError) {
        reportError('school_admin_student_classrooms_assign', assignError, {
          entityType: 'student',
          entityId: studentId,
          metadata: { classroomIds },
        });
        throw assignError;
      } finally {
        setAssigningStudentId(null);
      }
    },
    [refresh, reportError, slug],
  );

  const goToAdmissions = useCallback(() => {
    router.replace(`/school-admin/${slug}/admissions/submissions`);
  }, [router, slug]);

  const goToClassrooms = useCallback(() => {
    router.push(`/school-admin/${slug}/more/classrooms`);
  }, [router, slug]);

  const refreshSilently = useCallback(() => refresh({ silent: true }), [refresh]);

  const clearFilters = useCallback(() => {
    setRosterFilter('all');
    setSearchQuery('');
  }, []);

  return {
    organizationId,
    slug,
    status: (isLoading && students.length === 0 ? 'loading' : 'ready') as 'loading' | 'ready',
    students,
    filteredStudents,
    metrics,
    programCounts,
    searchQuery,
    setSearchQuery,
    rosterFilter,
    setRosterFilter,
    clearFilters,
    isRefreshing,
    error,
    staffError,
    lastUpdatedAt,
    refresh: refreshSilently,
    pickerStudent,
    openClassroomPicker,
    closeClassroomPicker,
    classrooms,
    classroomsLoading,
    classroomsLoaded,
    classroomsError,
    retryClassrooms: ensureClassroomsLoaded,
    assigningStudentId,
    assignClassrooms,
    openStudent,
    goToAdmissions,
    goToClassrooms,
  };
}

export type StudentsListController = ReturnType<typeof useStudentsListController>;
