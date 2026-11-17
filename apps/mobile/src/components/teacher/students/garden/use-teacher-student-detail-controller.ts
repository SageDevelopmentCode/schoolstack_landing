import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useTeacherHome } from '@/contexts/teacher-home-context';
import { useTeacherMessagesInbox } from '@/contexts/teacher-messages-inbox-context';
import { contactKeyForThread } from '@/lib/messages/participants-from-contact';
import type { MessageContact } from '@/lib/messages/types';
import {
  loadTeacherAssignedStudentDetail,
  loadTeacherSchoolStudentDetail,
  type EnrolledStudentDetail,
} from '@/lib/school-admin/enrolled-students';
import { studentHasStandingHealthItems, type StudentHealthProfile } from '@/lib/student-health/types';
import { getSupabaseClient } from '@/lib/supabase';
import { isTeacherFeatureEnabled } from '@/lib/teacher/teacher-features';
import {
  teacherMessageThreadRoute,
  teacherNewMessageThreadRoute,
  teacherTabRoute,
  type TeacherStudentDetailScope,
} from '@/lib/teacher/teacher-nav';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

export type TeacherStudentTab = 'overview' | 'family' | 'health';

/** Family contacts (guardians) a teacher can message about this student. */
export function familyContactsForStudent(
  contacts: MessageContact[],
  student: { id: string; familyId: string | null },
): MessageContact[] {
  return contacts.filter(
    (contact) =>
      contact.kind === 'guardian' &&
      ((student.familyId != null && contact.familyId === student.familyId) ||
        (contact.subtitleStudents ?? []).some((ref) => ref.id === student.id)),
  );
}

/**
 * One student, full screen (moved from `teacher-student-detail-workspace.tsx`:
 * same queries, scope rules, error copy and `reportError` operation). Adds the
 * family contacts for "Message family". No UI, no toasts.
 */
export function useTeacherStudentDetailController({
  slug,
  studentId,
  detailAccess,
}: {
  slug: string;
  studentId: string;
  detailAccess: TeacherStudentDetailScope;
}) {
  const router = useRouter();
  const { data: homeData, updateStudentHealthFlag, ensureLoaded, healthFlagOverrides } = useTeacherHome();
  const inbox = useTeacherMessagesInbox();
  const organizationId = homeData?.organizationId ?? '';
  const staffMemberId = homeData?.summary.staffMemberId ?? '';
  const summaryStudent = homeData?.summary.assignedStudents.find((s) => s.id === studentId);
  const { reportError } = useMobileErrorReporter(organizationId);
  const supabase = useMemo(() => getSupabaseClient(), []);

  const [detail, setDetail] = useState<EnrolledStudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadedAt, setLoadedAt] = useState<number | null>(null);
  const [activeTab, setActiveTabState] = useState<TeacherStudentTab>('overview');
  const [visitedTabs, setVisitedTabs] = useState<ReadonlySet<TeacherStudentTab>>(() => new Set(['overview']));
  const [profileHealth, setProfileHealth] = useState<boolean | null>(null);

  const loadDetail = useCallback(async () => {
    if (!organizationId) {
      setError('School profile not loaded.');
      setLoading(false);
      return;
    }

    if (detailAccess === 'assigned' && !staffMemberId) {
      setError('Staff profile not loaded.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const nextDetail =
        detailAccess === 'school'
          ? await loadTeacherSchoolStudentDetail(supabase, organizationId, studentId)
          : await loadTeacherAssignedStudentDetail(supabase, organizationId, staffMemberId, studentId);
      if (!nextDetail) {
        setError(
          detailAccess === 'school'
            ? 'Student not found or not enrolled at this school.'
            : 'Student not found or not assigned to you.',
        );
        setDetail(null);
        return;
      }
      setDetail(nextDetail);
      setLoadedAt(Date.now());
    } catch (loadError) {
      reportError('teacher_student_load_detail', loadError, {
        entityType: 'student',
        entityId: studentId,
      });
      setError(loadError instanceof Error ? loadError.message : 'Failed to load student.');
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [detailAccess, organizationId, reportError, staffMemberId, studentId, supabase]);

  useEffect(() => {
    ensureLoaded();
  }, [ensureLoaded]);

  useEffect(() => {
    queueMicrotask(() => void loadDetail());
  }, [loadDetail]);

  const setActiveTab = useCallback((tab: TeacherStudentTab) => {
    setVisitedTabs((previous) => {
      if (previous.has(tab)) return previous;
      const next = new Set(previous);
      next.add(tab);
      return next;
    });
    setActiveTabState(tab);
  }, []);

  const onHealthProfileChange = useCallback(
    (profile: StudentHealthProfile) => {
      const nextFlag = studentHasStandingHealthItems(profile);
      setProfileHealth(nextFlag);
      updateStudentHealthFlag(studentId, nextFlag);
    },
    [studentId, updateStudentHealthFlag],
  );

  // Health dot: the loaded profile wins, then this session's edits, then the roster summary.
  const hasStandingHealth =
    profileHealth ?? healthFlagOverrides.get(studentId) ?? summaryStudent?.hasStandingHealthItems ?? false;

  const messagesEnabled = isTeacherFeatureEnabled(homeData?.features, 'messages');
  const familyContacts = useMemo(
    () => (detail ? familyContactsForStudent(inbox.contacts, detail) : []),
    [detail, inbox.contacts],
  );

  /** Existing thread with this contact, else the "new" thread route. */
  const routeForContact = useCallback(
    (contact: MessageContact) => {
      const viewerStaffId = inbox.staffMemberId ?? staffMemberId;
      const existing = inbox.threads.find(
        (thread) =>
          contactKeyForThread(thread.participants, 'teacher', { staffMemberId: viewerStaffId }) === contact.key,
      );
      return existing
        ? teacherMessageThreadRoute(slug, existing.id)
        : teacherNewMessageThreadRoute(slug, contact.key);
    },
    [inbox.staffMemberId, inbox.threads, slug, staffMemberId],
  );

  const messageContact = useCallback(
    (contact: MessageContact) => router.push(routeForContact(contact)),
    [routeForContact, router],
  );

  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace(teacherTabRoute(slug, 'my-students'));
  }, [router, slug]);

  const status: 'loading' | 'error' | 'ready' = loading && !detail ? 'loading' : error || !detail ? 'error' : 'ready';

  return {
    slug,
    studentId,
    detailAccess,
    organizationId,
    status,
    detail,
    error,
    reload: loadDetail,
    loadedAt,
    summaryStudent,
    activeTab,
    setActiveTab,
    visitedTabs,
    hasStandingHealth,
    onHealthProfileChange,
    messagesEnabled,
    familyContacts,
    inboxLoading: inbox.isLoading && !inbox.hasLoaded,
    inboxError: inbox.error,
    refreshInbox: inbox.refresh,
    messageContact,
    goBack,
  };
}

export type TeacherStudentDetailController = ReturnType<typeof useTeacherStudentDetailController>;
