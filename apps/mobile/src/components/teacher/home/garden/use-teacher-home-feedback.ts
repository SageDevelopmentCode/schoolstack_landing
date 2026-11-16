import { useCallback } from 'react';

import { closeThen, useGardenPullRefresh } from '@/components/parent/garden/feedback';
import { useGardenToast } from '@/components/parent/garden/toast';
import { notifyWebOnly } from '@/components/school-admin/garden/admin-feedback';
import type { TeacherHomeController } from '@/components/teacher/home/garden/use-teacher-home-controller';
import { haptic } from '@/lib/haptics';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

/**
 * Wraps the Home controller's callbacks with feedback (toasts, haptics,
 * web-only notices) without changing what they do. A tap with no in-app
 * screen explains itself instead of doing nothing.
 */
export function useTeacherHomeFeedback(controller: TeacherHomeController) {
  const toast = useGardenToast();
  const { reportError } = useMobileErrorReporter(controller.data?.organizationId);
  const {
    openFocusHref,
    openDocumentationHref,
    refreshHome,
    error,
    setHeroProfilePhotoUrl,
    reload,
    setHomeTab,
  } = controller;

  const { pullRefreshing, onPullRefresh } = useGardenPullRefresh({
    refresh: refreshHome,
    error,
    label: 'Home',
    id: 'teacher-home-refresh',
  });

  const openFocusItem = useCallback(
    (href: string) => {
      if (!openFocusHref(href)) notifyWebOnly(toast, { webPath: href, reportError });
    },
    [openFocusHref, reportError, toast],
  );

  /** Guide step: close the guide sheet first, then navigate (toasts sit behind open sheets). */
  const openGuideStep = useCallback(
    (closeSheet: () => void, href: string) => {
      closeThen(closeSheet, () => {
        if (!openDocumentationHref(href)) {
          notifyWebOnly(toast, {
            webPath: href,
            reportError,
            title: 'This step happens on the web portal',
            description: 'Open it there to finish this step.',
          });
        }
      });
    },
    [openDocumentationHref, reportError, toast],
  );

  const onProfilePhotoUpdated = useCallback(
    (url: string) => {
      setHeroProfilePhotoUrl(url);
      void reload();
      toast.success('Profile photo updated', { id: 'teacher-profile-photo' });
    },
    [reload, setHeroProfilePhotoUrl, toast],
  );

  const showAttendance = useCallback(() => {
    haptic.select();
    setHomeTab('attendance');
  }, [setHomeTab]);

  return {
    toast,
    reportError,
    pullRefreshing,
    onPullRefresh,
    openFocusItem,
    openGuideStep,
    onProfilePhotoUpdated,
    showAttendance,
  };
}

export type TeacherHomeFeedback = ReturnType<typeof useTeacherHomeFeedback>;
