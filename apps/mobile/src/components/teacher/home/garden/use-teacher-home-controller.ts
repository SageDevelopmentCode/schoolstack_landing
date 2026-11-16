import { useFocusEffect, useRouter, type Href } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { TeacherHomeSubTabId } from '@/components/teacher/home/teacher-home-sub-tabs';
import { useAuth } from '@/contexts/auth-context';
import { useTeacherHome } from '@/contexts/teacher-home-context';
import { useAuthRequiredRedirect } from '@/hooks/use-auth-required-redirect';
import { usePortalPreview } from '@/lib/portal-preview-gating';
import type { AdminEnrolledStudentSummary } from '@/lib/school-admin/enrolled-students';
import { fetchTeacherActivityNotificationUnreadCount } from '@/lib/teacher/fetch-activity-notifications';
import { isTeacherFeatureEnabled } from '@/lib/teacher/teacher-features';
import { filterStudentsByClassroomName } from '@/lib/teacher/teacher-home-utils';
import {
  resolveTeacherDocumentationMobileRoute,
  resolveTeacherFocusHref,
  teacherBulletinDetailRoute,
  teacherMoreRoute,
  teacherStudentDetailRoute,
  teacherTabRoute,
} from '@/lib/teacher/teacher-nav';
import type { StaffClassroomOption } from '@/lib/teacher/teacher-portal-api';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

export type TeacherHomeTab = TeacherHomeSubTabId;

/**
 * Teacher Home data, sheet state and navigation. No UI and no toasts: the
 * feedback hook wraps these callbacks (teacher-mobile-garden-design §4).
 * Logic moved verbatim from the old Story teacher Home screen.
 */
export function useTeacherHomeController(slug: string) {
  const router = useRouter();
  const { isPreview } = usePortalPreview();
  const { selectedSchool } = useAuth();
  const { data, updatedAt, isLoading, isRefreshing, error, refresh, ensureLoaded } = useTeacherHome();
  const { reportError } = useMobileErrorReporter(data?.organizationId);

  const [heroProfilePhotoUrl, setHeroProfilePhotoUrl] = useState<string | null>(null);
  const [homeTab, setHomeTab] = useState<TeacherHomeTab>('overview');
  const [bulletinOpen, setBulletinOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationUnreadCount, setNotificationUnreadCount] = useState(0);
  const [supportSheetOpen, setSupportSheetOpen] = useState(false);
  const [accountSheetOpen, setAccountSheetOpen] = useState(false);
  const [classroomRoster, setClassroomRoster] = useState<StaffClassroomOption | null>(null);
  const [myHoursRefreshKey, setMyHoursRefreshKey] = useState(0);

  useAuthRequiredRedirect(error);

  useEffect(() => {
    ensureLoaded();
  }, [ensureLoaded]);

  // Previous-value pattern: follow the server photo, but keep a fresh upload until it changes.
  const serverPhotoUrl = data?.userProfile.profilePhotoUrl;
  const [prevServerPhotoUrl, setPrevServerPhotoUrl] = useState<string | null | undefined>(undefined);
  if (serverPhotoUrl !== undefined && serverPhotoUrl !== prevServerPhotoUrl) {
    setPrevServerPhotoUrl(serverPhotoUrl);
    setHeroProfilePhotoUrl(serverPhotoUrl);
  }

  const organizationId = data?.organizationId ?? null;

  const loadNotificationUnreadCount = useCallback(async () => {
    if (!organizationId) return;
    try {
      const count = await fetchTeacherActivityNotificationUnreadCount(organizationId, slug);
      setNotificationUnreadCount(count);
    } catch (err) {
      reportError('teacher.activity_notifications.unread_count_failed', err);
    }
  }, [organizationId, reportError, slug]);

  useFocusEffect(
    useCallback(() => {
      void loadNotificationUnreadCount();
    }, [loadNotificationUnreadCount]),
  );

  const classroomRosterStudents = useMemo(() => {
    if (!classroomRoster || !data) return [];
    return filterStudentsByClassroomName(data.summary.assignedStudents, classroomRoster.name);
  }, [classroomRoster, data]);

  const features = data?.features;
  const attendanceEnabled = isTeacherFeatureEnabled(features, 'attendance');
  const myStudentsEnabled = isTeacherFeatureEnabled(features, 'my_students');
  const messagesEnabled = isTeacherFeatureEnabled(features, 'messages');
  const calendarEnabled = isTeacherFeatureEnabled(features, 'calendar');
  const myHoursEnabled = isTeacherFeatureEnabled(features, 'my_hours');

  // Attendance switched off while its tab was open: fall back to Overview.
  if (data && homeTab === 'attendance' && !attendanceEnabled) {
    setHomeTab('overview');
  }

  /** Pull to refresh: home payload, the My Hours card and the bell count. */
  const refreshHome = useCallback(async () => {
    await refresh();
    setMyHoursRefreshKey((key) => key + 1);
    void loadNotificationUnreadCount();
  }, [loadNotificationUnreadCount, refresh]);

  /** Focus items and notifications. Returns `false` when there's no in-app screen. */
  const openFocusHref = useCallback(
    (href: string): boolean => {
      const route = resolveTeacherFocusHref(slug, href);
      if (!route) return false;
      router.push(route);
      return true;
    },
    [router, slug],
  );

  /** How-to guide step actions. Returns `false` when there's no in-app screen. */
  const openDocumentationHref = useCallback(
    (href: string): boolean => {
      const route = resolveTeacherDocumentationMobileRoute(slug, href);
      if (!route) return false;
      router.push(route);
      return true;
    },
    [router, slug],
  );

  const openStudentProfile = useCallback(
    (student: AdminEnrolledStudentSummary) => {
      setClassroomRoster(null);
      router.push(teacherStudentDetailRoute(slug, student.id));
    },
    [router, slug],
  );

  const openBulletinPost = useCallback(
    (postId: string) => router.push(teacherBulletinDetailRoute(slug, postId)),
    [router, slug],
  );

  const openTab = useCallback(
    (tab: 'calendar' | 'messages' | 'my-students') => router.replace(teacherTabRoute(slug, tab)),
    [router, slug],
  );

  const openMyHours = useCallback(
    () => router.push(teacherMoreRoute(slug, 'my-hours')),
    [router, slug],
  );

  const pushRoute = useCallback((route: Href) => router.push(route), [router]);

  return {
    slug,
    isPreview,
    data,
    status: (isLoading && !data ? 'loading' : error && !data ? 'error' : data ? 'ready' : 'empty') as
      | 'loading'
      | 'error'
      | 'ready'
      | 'empty',
    isRefreshing,
    error,
    reload: refresh,
    refreshHome,
    lastUpdatedAt: updatedAt,
    accountOrganizationId: selectedSchool?.id ?? data?.organizationId ?? '',
    features: {
      attendanceEnabled,
      myStudentsEnabled,
      messagesEnabled,
      calendarEnabled,
      myHoursEnabled,
    },
    heroProfilePhotoUrl,
    setHeroProfilePhotoUrl,
    homeTab,
    setHomeTab,
    bulletinOpen,
    setBulletinOpen,
    notificationsOpen,
    setNotificationsOpen,
    notificationUnreadCount,
    setNotificationUnreadCount,
    supportSheetOpen,
    setSupportSheetOpen,
    accountSheetOpen,
    setAccountSheetOpen,
    classroomRoster,
    setClassroomRoster,
    classroomRosterStudents,
    myHoursRefreshKey,
    openFocusHref,
    openDocumentationHref,
    openStudentProfile,
    openBulletinPost,
    openTab,
    openMyHours,
    pushRoute,
  };
}

export type TeacherHomeController = ReturnType<typeof useTeacherHomeController>;
