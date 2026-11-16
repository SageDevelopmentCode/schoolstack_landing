import * as Clipboard from 'expo-clipboard';
import { useCallback, useState } from 'react';

import { useGardenPullRefresh } from '@/components/parent/garden/feedback';
import type { AdminDashboardController } from '@/components/school-admin/dashboard/garden/use-admin-dashboard-controller';
import {
  metricRoute,
  metricWebPath,
  notifyWebOnly,
  setupStepWebPath,
} from '@/components/school-admin/garden/admin-feedback';
import { useAdminAction } from '@/components/school-admin/garden/use-admin-action';
import { resolveWebUrl } from '@/lib/admissions/school-apply-url';
import type {
  AdmissionsSetupStep,
  DashboardMetric,
  DashboardQuickAction,
} from '@/lib/school-admin/dashboard-summary-types';

/**
 * Wraps the Dashboard controller's callbacks with feedback (haptics, toasts,
 * pending states) without changing what they do. Taps with no in-app screen
 * explain themselves instead of doing nothing.
 */
export function useAdminDashboardFeedback(controller: AdminDashboardController) {
  const action = useAdminAction(controller.organizationId);
  const { toast, reportError } = action;
  const { slug, navigateToHref, pushRoute, openStaffPortal } = controller;
  const [staffPortalPending, setStaffPortalPending] = useState(false);

  const { pullRefreshing, onPullRefresh } = useGardenPullRefresh({
    refresh: controller.refresh,
    error: controller.error,
    label: 'Dashboard',
    id: 'admin-dashboard-refresh',
  });

  /** Opens a web href in the app, or explains that it lives on the web portal. */
  const openHref = useCallback(
    (href: string) => {
      if (!navigateToHref(href)) notifyWebOnly(toast, { webPath: href, reportError });
    },
    [navigateToHref, reportError, toast],
  );

  const openMetric = useCallback(
    (metric: DashboardMetric) => {
      const route = metricRoute(slug, metric);
      if (route) {
        pushRoute(route);
        return;
      }
      notifyWebOnly(toast, { webPath: metricWebPath(slug, metric), reportError });
    },
    [pushRoute, reportError, slug, toast],
  );

  const openSetupStep = useCallback(
    (step: AdmissionsSetupStep) => {
      notifyWebOnly(toast, {
        webPath: setupStepWebPath(slug, step.id),
        reportError,
        title: `Finish "${step.title}" on the web portal`,
        description: 'Go-live setup is done on the web portal. The app updates once it is saved.',
      });
    },
    [reportError, slug, toast],
  );

  const copyApplyLink = useCallback(
    (quick: Extract<DashboardQuickAction, { kind: 'copy-apply-link' }>) => {
      const url = resolveWebUrl(quick.applyFormPublicPath);
      return action.run(() => Clipboard.setStringAsync(url), {
        key: `copy-apply-link-${quick.id}`,
        operation: 'school_admin_copy_apply_link',
        success: { title: 'Apply link copied', description: 'Paste it anywhere families will see it.' },
        error: { title: "Couldn't copy the link", description: `Copy it by hand: ${url}` },
        retry: true,
      });
    },
    [action],
  );

  const openStaffPortalWithFeedback = useCallback(async () => {
    setStaffPortalPending(true);
    try {
      const opened = await openStaffPortal();
      if (!opened) {
        toast.warning('Staff portal not available', {
          id: 'admin-staff-portal',
          description: "This account doesn't have staff access at this school either.",
        });
      }
    } catch (err) {
      reportError('school_admin_open_staff_portal', err);
      toast.error("Couldn't open the staff portal", {
        id: 'admin-staff-portal-error',
        description: 'Check your connection, then try again.',
        action: { label: 'Retry', onPress: () => void openStaffPortalWithFeedback() },
      });
    } finally {
      setStaffPortalPending(false);
    }
  }, [openStaffPortal, reportError, toast]);

  const onProfilePhotoUpdated = useCallback(
    (url: string) => {
      controller.setHeroProfilePhotoUrl(url);
      toast.success('Profile photo updated', { id: 'admin-profile-photo' });
    },
    [controller, toast],
  );

  return {
    action,
    toast,
    reportError,
    pullRefreshing,
    onPullRefresh,
    openHref,
    openMetric,
    openSetupStep,
    copyApplyLink,
    openStaffPortal: openStaffPortalWithFeedback,
    staffPortalPending,
    onProfilePhotoUpdated,
  };
}

export type AdminDashboardFeedback = ReturnType<typeof useAdminDashboardFeedback>;
