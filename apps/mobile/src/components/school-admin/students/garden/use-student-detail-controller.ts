import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useSchoolAdminStudents } from '@/contexts/school-admin-students-context';
import { listFamilyGuardians, type FamilyGuardianRecord } from '@/lib/admissions/family-guardians';
import type { ClassroomSummary } from '@/lib/school-admin/classrooms';
import { loadEnrolledStudentDetail, type EnrolledStudentDetail } from '@/lib/school-admin/enrolled-students';
import { fetchClassrooms, setStudentClassroomsApi } from '@/lib/school-admin-api';
import { studentHasStandingHealthItems, type StudentHealthProfile } from '@/lib/student-health/types';
import { getSupabaseClient } from '@/lib/supabase';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

export type StudentDetailTab = 'overview' | 'family' | 'health';

/**
 * One student's record (moved from `student-detail-workspace.tsx`, screen
 * variant; same calls and `reportError` operations). No UI, no toasts.
 * A classroom save also refreshes the Students list so it isn't stale.
 */
export function useStudentDetailController({
  organizationId,
  studentId,
  slug,
}: {
  organizationId: string;
  studentId: string;
  slug: string;
}) {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseClient(), []);
  const { reportError } = useMobileErrorReporter(organizationId);
  const { refresh: refreshRoster } = useSchoolAdminStudents();

  const [detail, setDetail] = useState<EnrolledStudentDetail | null>(null);
  const [guardians, setGuardians] = useState<FamilyGuardianRecord[]>([]);
  const [guardiansLoading, setGuardiansLoading] = useState(false);
  const [guardiansLoadedForFamilyId, setGuardiansLoadedForFamilyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  const [activeTab, setActiveTabState] = useState<StudentDetailTab>('overview');
  const [visitedTabs, setVisitedTabs] = useState<Set<StudentDetailTab>>(() => new Set(['overview']));
  const [classroomPickerOpen, setClassroomPickerOpen] = useState(false);
  const [classrooms, setClassrooms] = useState<ClassroomSummary[]>([]);
  const [classroomsLoading, setClassroomsLoading] = useState(false);
  const [classroomsLoaded, setClassroomsLoaded] = useState(false);
  const [classroomsError, setClassroomsError] = useState<string | null>(null);
  const [assigningClassroom, setAssigningClassroom] = useState(false);
  const [hasStandingHealth, setHasStandingHealth] = useState(false);

  /** `silent` keeps the record on screen (pull to refresh) and rethrows on failure. */
  const loadDetail = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      if (!silent) {
        setLoading(true);
        setError(null);
      }
      try {
        const nextDetail = await loadEnrolledStudentDetail(supabase, organizationId, studentId);
        if (!nextDetail) {
          setError('Student not found.');
          setDetail(null);
          return;
        }
        setError(null);
        setDetail(nextDetail);
        setLastUpdatedAt(Date.now());
      } catch (loadError) {
        reportError('school_admin_student_load', loadError, {
          entityType: 'student',
          entityId: studentId,
        });
        if (silent) throw loadError;
        setError(loadError instanceof Error ? loadError.message : 'Failed to load student.');
        setDetail(null);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [organizationId, reportError, studentId, supabase],
  );

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  const setActiveTab = useCallback((tab: StudentDetailTab) => {
    setActiveTabState(tab);
    setVisitedTabs((current) => {
      if (current.has(tab)) return current;
      const next = new Set(current);
      next.add(tab);
      return next;
    });
  }, []);

  const familyId = detail?.familyId ?? null;
  const familyVisited = visitedTabs.has('family');

  useEffect(() => {
    if (!familyVisited) return;
    if (!familyId) {
      queueMicrotask(() => setGuardians([]));
      return;
    }
    if (guardiansLoadedForFamilyId === familyId) return;

    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setGuardiansLoading(true);
    });
    void (async () => {
      try {
        const rows = await listFamilyGuardians(supabase, organizationId, familyId);
        if (cancelled) return;
        setGuardians(rows);
        setGuardiansLoadedForFamilyId(familyId);
      } catch {
        if (!cancelled) setGuardians([]);
      } finally {
        if (!cancelled) setGuardiansLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [familyVisited, familyId, guardiansLoadedForFamilyId, organizationId, supabase]);

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

  const openClassroomPicker = useCallback(() => {
    void ensureClassroomsLoaded();
    setClassroomPickerOpen(true);
  }, [ensureClassroomsLoaded]);

  const closeClassroomPicker = useCallback(() => setClassroomPickerOpen(false), []);

  /** PATCH classrooms, patch the record in place, refresh the roster. Reports and rethrows. */
  const assignClassrooms = useCallback(
    async (classroomIds: string[]) => {
      if (!detail) return;
      setAssigningClassroom(true);
      try {
        const result = await setStudentClassroomsApi(slug, detail.id, classroomIds);
        setDetail((current) =>
          current
            ? {
                ...current,
                classroomIds: result.classroomIds,
                classroomNames: result.classroomNames,
                assignedTeachers: result.assignedTeachers,
                assignedTeacherNames: result.assignedTeacherNames,
                enrollments: current.enrollments.map((enrollment) => ({
                  ...enrollment,
                  classroomName: result.classroomNames.length > 0 ? result.classroomNames.join(', ') : null,
                  classroomIds: result.classroomIds,
                })),
              }
            : current,
        );
        void refreshRoster({ silent: true });
        return result;
      } catch (assignError) {
        reportError('school_admin_student_classrooms_assign', assignError, {
          entityType: 'student',
          entityId: detail.id,
          metadata: { classroomIds },
        });
        throw assignError;
      } finally {
        setAssigningClassroom(false);
      }
    },
    [detail, refreshRoster, reportError, slug],
  );

  const onHealthProfileChange = useCallback((profile: StudentHealthProfile) => {
    setHasStandingHealth(studentHasStandingHealthItems(profile));
  }, []);

  const goBack = useCallback(() => router.back(), [router]);
  const goToClassrooms = useCallback(() => {
    router.push(`/school-admin/${slug}/more/classrooms`);
  }, [router, slug]);
  const openApplication = useCallback(() => {
    if (!detail?.applicationId) return;
    router.push(`/school-admin/${slug}/admissions/submissions/${detail.applicationId}`);
  }, [detail?.applicationId, router, slug]);

  const refresh = useCallback(() => loadDetail({ silent: true }), [loadDetail]);

  return {
    organizationId,
    studentId,
    slug,
    status: (loading ? 'loading' : error || !detail ? 'error' : 'ready') as 'loading' | 'error' | 'ready',
    error,
    detail,
    lastUpdatedAt,
    activeTab,
    setActiveTab,
    visitedTabs,
    guardians,
    guardiansLoading,
    classroomPickerOpen,
    openClassroomPicker,
    closeClassroomPicker,
    classrooms,
    classroomsLoading,
    classroomsLoaded,
    classroomsError,
    retryClassrooms: ensureClassroomsLoaded,
    assigningClassroom,
    assignClassrooms,
    hasStandingHealth,
    onHealthProfileChange,
    reload: loadDetail,
    refresh,
    goBack,
    goToClassrooms,
    openApplication,
  };
}

export type StudentDetailController = ReturnType<typeof useStudentDetailController>;
