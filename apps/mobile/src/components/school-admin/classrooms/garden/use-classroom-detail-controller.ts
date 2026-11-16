import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { ClassroomFormInput } from '@/components/school-admin/classrooms/garden/admin-classroom-form-sheet';
import type { ClassroomDetail, ClassroomStaffRole, ClassroomSummary, ProgramOption } from '@/lib/school-admin/classrooms';
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
  updateClassroomApi,
  type StaffMemberRecord,
} from '@/lib/school-admin-api';
import { listOrgEnrolledStudents, type AdminEnrolledStudentSummary } from '@/lib/school-admin/enrolled-students';
import { getSupabaseClient } from '@/lib/supabase';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

function message(err: unknown, fallback: string): Error {
  return err instanceof Error ? err : new Error(fallback);
}

/**
 * Data for School admin › More › Classrooms › one classroom (no UI, no
 * toasts). Same loads, mutations and `reportError` operations as the Story
 * screen; mutations report, then rethrow.
 */
export function useClassroomDetailController({ slug, organizationId, classroomId }: { slug: string; organizationId: string; classroomId: string }) {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseClient(), []);
  const { reportError } = useMobileErrorReporter(organizationId);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const [summary, setSummary] = useState<ClassroomSummary | null>(null);
  const [detail, setDetail] = useState<ClassroomDetail | null>(null);
  const [roster, setRoster] = useState<AdminEnrolledStudentSummary[]>([]);
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMemberRecord[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [staffPickerOpen, setStaffPickerOpen] = useState(false);
  const [studentPickerOpen, setStudentPickerOpen] = useState(false);
  const [assigningStaff, setAssigningStaff] = useState(false);
  const [assigningStudents, setAssigningStudents] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [enrolled, setEnrolled] = useState<AdminEnrolledStudentSummary[]>([]);
  const [enrolledLoading, setEnrolledLoading] = useState(false);
  const [enrolledError, setEnrolledError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [classroomsPayload, detailPayload, rosterPayload, staffPayload] = await Promise.all([
        fetchClassrooms(slug),
        fetchClassroomDetailApi(slug, classroomId),
        fetchClassroomStudentsApi(slug, classroomId),
        fetchStaffMembers(slug),
      ]);
      if (!mounted.current) return;
      setSummary(classroomsPayload.classrooms.find((entry) => entry.id === classroomId) ?? detailPayload);
      setPrograms(classroomsPayload.programs);
      setDetail(detailPayload);
      setRoster(rosterPayload);
      setStaffMembers(staffPayload);
      setError(null);
      setLastUpdatedAt(Date.now());
    } catch (loadError) {
      reportError('school_admin_classroom_load', loadError, { entityType: 'classroom', entityId: classroomId });
      if (mounted.current) setError(loadError instanceof Error ? loadError.message : 'Failed to load classroom.');
    } finally {
      if (mounted.current) setLoaded(true);
    }
  }, [classroomId, reportError, slug]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const reload = useCallback(async () => {
    setLoaded(false);
    await loadData();
  }, [loadData]);

  const loadEnrolled = useCallback(async () => {
    setEnrolledLoading(true);
    setEnrolledError(null);
    try {
      const students = await listOrgEnrolledStudents(supabase, organizationId);
      if (mounted.current) setEnrolled(students);
    } catch (loadError) {
      reportError('school_admin_classroom_enrolled_students_load', loadError, { entityType: 'classroom', entityId: classroomId });
      if (mounted.current) setEnrolledError(loadError instanceof Error ? loadError.message : 'Failed to load students.');
    } finally {
      if (mounted.current) setEnrolledLoading(false);
    }
  }, [classroomId, organizationId, reportError, supabase]);

  const openStudentPicker = useCallback(() => {
    setStudentPickerOpen(true);
    if (enrolled.length === 0) void loadEnrolled();
  }, [enrolled.length, loadEnrolled]);

  const saveEdit = useCallback(
    async (input: ClassroomFormInput) => {
      setSavingEdit(true);
      try {
        await updateClassroomApi(slug, classroomId, input);
        await loadData();
      } catch (saveError) {
        reportError('school_admin_classroom_save', saveError, {
          entityType: 'classroom',
          entityId: classroomId,
          metadata: { mode: 'edit' },
        });
        throw message(saveError, 'Failed to save classroom.');
      } finally {
        if (mounted.current) setSavingEdit(false);
      }
    },
    [classroomId, loadData, reportError, slug],
  );

  const assignStaff = useCallback(
    async (staffMemberId: string, role: ClassroomStaffRole) => {
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
        throw message(assignError, 'Failed to assign staff.');
      } finally {
        if (mounted.current) setAssigningStaff(false);
      }
    },
    [classroomId, loadData, reportError, slug],
  );

  const assignStudents = useCallback(
    async (studentIds: string[]) => {
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
        throw message(assignError, 'Failed to assign students.');
      } finally {
        if (mounted.current) setAssigningStudents(false);
      }
    },
    [classroomId, loadData, reportError, slug],
  );

  const removeStaff = useCallback(
    async (staffMemberId: string) => {
      setRemovingId(staffMemberId);
      try {
        await removeStaffFromClassroomApi(slug, classroomId, staffMemberId);
        await loadData();
      } catch (removeError) {
        reportError('school_admin_classroom_staff_remove', removeError, {
          entityType: 'classroom',
          entityId: classroomId,
          metadata: { staffMemberId },
        });
        throw message(removeError, 'Failed to remove staff.');
      } finally {
        if (mounted.current) setRemovingId(null);
      }
    },
    [classroomId, loadData, reportError, slug],
  );

  const removeStudent = useCallback(
    async (studentId: string) => {
      setRemovingId(studentId);
      try {
        await removeStudentFromClassroomApi(slug, classroomId, studentId);
        await loadData();
      } catch (removeError) {
        reportError('school_admin_classroom_student_remove', removeError, {
          entityType: 'classroom',
          entityId: classroomId,
          metadata: { studentId },
        });
        throw message(removeError, 'Failed to remove student.');
      } finally {
        if (mounted.current) setRemovingId(null);
      }
    },
    [classroomId, loadData, reportError, slug],
  );

  const deleteClassroom = useCallback(async () => {
    setDeleting(true);
    try {
      await deleteClassroomApi(slug, classroomId);
      router.back();
    } catch (deleteError) {
      reportError('school_admin_classroom_delete', deleteError, { entityType: 'classroom', entityId: classroomId });
      throw message(deleteError, 'Failed to delete classroom.');
    } finally {
      if (mounted.current) setDeleting(false);
    }
  }, [classroomId, reportError, router, slug]);

  const status: 'loading' | 'error' | 'ready' = !loaded ? 'loading' : summary && detail ? 'ready' : 'error';

  return {
    slug,
    organizationId,
    classroomId,
    status,
    summary,
    detail,
    roster,
    programs,
    staffMembers,
    error,
    lastUpdatedAt,
    refresh: loadData,
    reload,
    goBack: useCallback(() => router.back(), [router]),
    openStudent: useCallback((studentId: string) => router.push(`/school-admin/${slug}/students/${studentId}`), [router, slug]),
    openStaff: useCallback((staffMemberId: string) => router.push(`/school-admin/${slug}/more/staff/${staffMemberId}`), [router, slug]),
    editOpen,
    openEdit: useCallback(() => setEditOpen(true), []),
    closeEdit: useCallback(() => setEditOpen(false), []),
    savingEdit,
    saveEdit,
    staffPickerOpen,
    openStaffPicker: useCallback(() => setStaffPickerOpen(true), []),
    closeStaffPicker: useCallback(() => setStaffPickerOpen(false), []),
    studentPickerOpen,
    openStudentPicker,
    closeStudentPicker: useCallback(() => setStudentPickerOpen(false), []),
    assigningStaff,
    assignStaff,
    assigningStudents,
    assignStudents,
    removingId,
    removeStaff,
    removeStudent,
    deleting,
    deleteClassroom,
    enrolled,
    enrolledLoading,
    enrolledError,
    retryEnrolled: loadEnrolled,
  };
}

export type ClassroomDetailController = ReturnType<typeof useClassroomDetailController>;
