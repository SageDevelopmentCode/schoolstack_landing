import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  assignStudentsToStaffApi,
  deactivateStaffPortalAccess,
  fetchStaffAssignedStudents,
  fetchStaffMembers,
  reactivateStaffPortalAccess,
  unassignStudentFromStaffApi,
  updateStaffMember,
  type AdminEnrolledStudentSummary,
  type StaffEmploymentStatus,
  type StaffMemberRecord,
  type StaffPortalRole,
} from '@/lib/school-admin-api';
import { listOrgEnrolledStudents } from '@/lib/school-admin/enrolled-students';
import { formatStaffApiError, schoolTeacherLoginUrl } from '@/lib/school-admin/staff-labels';
import { getSupabaseClient } from '@/lib/supabase';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

const siteUrl = process.env.EXPO_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://trymudkitchen.com';

export type StaffDetailTab = 'profile' | 'portal' | 'students' | 'contact';

export type StaffEditForm = {
  firstName: string;
  lastName: string;
  roleTitle: string;
  portalRole: StaffPortalRole;
  employmentStatus: StaffEmploymentStatus;
};

function formFromMember(member: StaffMemberRecord): StaffEditForm {
  return {
    firstName: member.firstName,
    lastName: member.lastName,
    roleTitle: member.roleTitle ?? '',
    portalRole: member.portalRole ?? 'teacher',
    employmentStatus: member.employmentStatus,
  };
}

/**
 * Data for School admin › More › Staff › one member (no UI, no toasts). Same
 * fetches, saves and `reportError` operations as the Story screen and its
 * Learners section. Mutations report, then rethrow a formatted error.
 */
export function useStaffDetailController({ slug, staffMemberId, organizationId }: { slug: string; staffMemberId: string; organizationId: string }) {
  const router = useRouter();
  const { reportError } = useMobileErrorReporter(organizationId);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const [member, setMember] = useState<StaffMemberRecord | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<StaffEditForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [portalAction, setPortalAction] = useState<'deactivate' | 'reactivate' | null>(null);
  const [activeTab, setActiveTabState] = useState<StaffDetailTab>('profile');
  const [visitedTabs, setVisitedTabs] = useState<Set<StaffDetailTab>>(() => new Set(['profile']));

  const loadMember = useCallback(async (): Promise<StaffMemberRecord | null> => {
    try {
      const members = await fetchStaffMembers(slug);
      const next = members.find((item) => item.id === staffMemberId) ?? null;
      if (!mounted.current) return next;
      if (!next) {
        setError('Staff member not found.');
        setMember(null);
        return null;
      }
      setMember(next);
      setError(null);
      setLastUpdatedAt(Date.now());
      return next;
    } catch (loadError) {
      reportError('school_admin_staff_load', loadError, { entityType: 'staff_member', entityId: staffMemberId });
      if (mounted.current) setError(formatStaffApiError(loadError, 'Failed to load staff member.'));
      return null;
    } finally {
      if (mounted.current) setLoaded(true);
    }
  }, [reportError, slug, staffMemberId]);

  useEffect(() => {
    void loadMember();
  }, [loadMember]);

  const reload = useCallback(async () => {
    setLoaded(false);
    await loadMember();
  }, [loadMember]);

  const setActiveTab = useCallback((tab: StaffDetailTab) => {
    setActiveTabState(tab);
    setVisitedTabs((current) => {
      if (current.has(tab)) return current;
      const next = new Set(current);
      next.add(tab);
      return next;
    });
  }, []);

  const startEditing = useCallback(() => {
    if (!member) return;
    setForm(formFromMember(member));
    setIsEditing(true);
  }, [member]);

  const cancelEditing = useCallback(() => {
    setForm(member ? formFromMember(member) : null);
    setIsEditing(false);
  }, [member]);

  const formDirty = useMemo(() => {
    if (!member || !form) return false;
    const base = formFromMember(member);
    return (
      base.firstName !== form.firstName ||
      base.lastName !== form.lastName ||
      base.roleTitle !== form.roleTitle ||
      base.portalRole !== form.portalRole ||
      base.employmentStatus !== form.employmentStatus
    );
  }, [form, member]);

  const updateForm = useCallback((patch: Partial<StaffEditForm>) => {
    setForm((current) => (current ? { ...current, ...patch } : current));
  }, []);

  const saveProfile = useCallback(async () => {
    if (!member || !form) return;
    setSaving(true);
    try {
      await updateStaffMember(slug, member.id, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        roleTitle: form.roleTitle.trim(),
        portalRole: form.portalRole,
        employmentStatus: form.employmentStatus,
      });
      setIsEditing(false);
      await loadMember();
    } catch (saveError) {
      reportError('school_admin_staff_save', saveError, { entityType: 'staff_member', entityId: member.id });
      throw new Error(formatStaffApiError(saveError, 'Failed to update staff member.'));
    } finally {
      if (mounted.current) setSaving(false);
    }
  }, [form, loadMember, member, reportError, slug]);

  const runPortalAction = useCallback(
    async (action: 'deactivate' | 'reactivate') => {
      if (!member) return;
      setPortalAction(action);
      try {
        if (action === 'deactivate') await deactivateStaffPortalAccess(slug, member.id);
        else await reactivateStaffPortalAccess(slug, member.id);
        await loadMember();
      } catch (portalError) {
        reportError('school_admin_staff_portal_access', portalError, {
          entityType: 'staff_member',
          entityId: member.id,
          metadata: { action },
        });
        throw new Error(formatStaffApiError(portalError, 'Failed to update portal access.'));
      } finally {
        if (mounted.current) setPortalAction(null);
      }
    },
    [loadMember, member, reportError, slug],
  );

  /* ---------------- Learners & groups ---------------- */

  const [students, setStudents] = useState<AdminEnrolledStudentSummary[]>([]);
  const [studentsLoaded, setStudentsLoaded] = useState(false);
  const [studentsError, setStudentsError] = useState<string | null>(null);
  const [removingStudentId, setRemovingStudentId] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [enrolled, setEnrolled] = useState<AdminEnrolledStudentSummary[]>([]);
  const [enrolledLoading, setEnrolledLoading] = useState(false);
  const [enrolledError, setEnrolledError] = useState<string | null>(null);

  const loadStudents = useCallback(async () => {
    try {
      const rows = await fetchStaffAssignedStudents(slug, staffMemberId);
      if (!mounted.current) return;
      setStudents(rows);
      setStudentsError(null);
    } catch (loadError) {
      reportError('school_admin_staff_students_load', loadError, { entityType: 'staff_member', entityId: staffMemberId });
      if (mounted.current) setStudentsError(formatStaffApiError(loadError, 'Failed to load assigned students.'));
    } finally {
      if (mounted.current) setStudentsLoaded(true);
    }
  }, [reportError, slug, staffMemberId]);

  const studentsTabVisited = visitedTabs.has('students');
  useEffect(() => {
    if (studentsTabVisited) void loadStudents();
  }, [loadStudents, studentsTabVisited]);

  const retryStudents = useCallback(async () => {
    setStudentsLoaded(false);
    await loadStudents();
  }, [loadStudents]);

  const loadEnrolled = useCallback(async () => {
    setEnrolledLoading(true);
    setEnrolledError(null);
    try {
      const rows = await listOrgEnrolledStudents(getSupabaseClient(), organizationId, { limit: 500 });
      if (mounted.current) setEnrolled(rows);
    } catch (loadError) {
      reportError('school_admin_staff_enrolled_students_load', loadError, { entityType: 'staff_member', entityId: staffMemberId });
      if (mounted.current) setEnrolledError(formatStaffApiError(loadError, 'Failed to load students.'));
    } finally {
      if (mounted.current) setEnrolledLoading(false);
    }
  }, [organizationId, reportError, staffMemberId]);

  const openPicker = useCallback(() => {
    setPickerOpen(true);
    void loadEnrolled();
  }, [loadEnrolled]);

  const closePicker = useCallback(() => setPickerOpen(false), []);

  const assignStudents = useCallback(
    async (studentIds: string[]) => {
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
        throw new Error(formatStaffApiError(assignError, 'Failed to assign students.'));
      } finally {
        if (mounted.current) setAssigning(false);
      }
    },
    [loadStudents, reportError, slug, staffMemberId],
  );

  const unassignStudent = useCallback(
    async (studentId: string) => {
      setRemovingStudentId(studentId);
      try {
        await unassignStudentFromStaffApi(slug, staffMemberId, studentId);
        if (mounted.current) setStudents((current) => current.filter((row) => row.id !== studentId));
      } catch (unassignError) {
        reportError('school_admin_staff_students_unassign', unassignError, {
          entityType: 'staff_member',
          entityId: staffMemberId,
          metadata: { studentId },
        });
        throw new Error(formatStaffApiError(unassignError, 'Failed to unassign student.'));
      } finally {
        if (mounted.current) setRemovingStudentId(null);
      }
    },
    [reportError, slug, staffMemberId],
  );

  const refresh = useCallback(async () => {
    await Promise.all([loadMember(), studentsTabVisited ? loadStudents() : Promise.resolve()]);
  }, [loadMember, loadStudents, studentsTabVisited]);

  const loginUrl = useMemo(() => schoolTeacherLoginUrl(slug, siteUrl), [slug]);

  const status: 'loading' | 'error' | 'ready' = !loaded ? 'loading' : member ? 'ready' : 'error';

  return {
    slug,
    organizationId,
    staffMemberId,
    status,
    member,
    error,
    lastUpdatedAt,
    reload,
    refresh,
    goBack: useCallback(() => router.back(), [router]),
    openStudent: useCallback(
      (studentId: string) => router.push(`/school-admin/${slug}/students/${studentId}`),
      [router, slug],
    ),
    activeTab,
    visitedTabs,
    setActiveTab,
    isEditing,
    form,
    formDirty,
    updateForm,
    startEditing,
    cancelEditing,
    saving,
    saveProfile,
    portalAction,
    runPortalAction,
    loginUrl,
    students,
    studentsLoaded,
    studentsError,
    retryStudents,
    removingStudentId,
    unassignStudent,
    assigning,
    assignStudents,
    pickerOpen,
    openPicker,
    closePicker,
    enrolled,
    enrolledLoading,
    enrolledError,
    retryEnrolled: loadEnrolled,
  };
}

export type StaffDetailController = ReturnType<typeof useStaffDetailController>;
