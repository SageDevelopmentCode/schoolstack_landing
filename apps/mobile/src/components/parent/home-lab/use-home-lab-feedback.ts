import { useCallback, useEffect, useMemo, useRef } from 'react';

import type { ParentHomeDashboardProps } from '@/components/parent/home/parent-home-dashboard';
import { useGardenToast } from '@/components/parent/garden/toast';
import { useParentHome } from '@/contexts/parent-home-context';
import { haptic } from '@/lib/haptics';
import { usePortalPreview } from '@/lib/portal-preview-gating';

/**
 * Wraps the real Home callbacks with feedback (haptics + Garden toasts) without
 * changing what they do. Every navigation still goes through the same callback.
 */
export function useHomeLabFeedback(props: ParentHomeDashboardProps) {
  const toast = useGardenToast();
  const { isRefreshing, error } = useParentHome();
  const { readOnly } = usePortalPreview();
  const pendingRefresh = useRef(false);
  const wasRefreshing = useRef(isRefreshing);
  const { onRefresh } = props;

  const refreshWithFeedback = useCallback(() => {
    haptic.select();
    pendingRefresh.current = true;
    onRefresh();
  }, [onRefresh]);

  // Refresh errors are already reported by the Home context (`parent_home_load`);
  // here we only tell the parent how it went.
  useEffect(() => {
    const finished = wasRefreshing.current && !isRefreshing;
    wasRefreshing.current = isRefreshing;
    if (!finished || !pendingRefresh.current) return;
    pendingRefresh.current = false;
    if (error) {
      toast.error("Couldn't refresh Home", {
        id: 'home-refresh',
        description: 'Check your connection, then try again.',
        action: { label: 'Try again', onPress: refreshWithFeedback },
      });
    } else {
      toast.info('Home is up to date', { id: 'home-refresh', durationMs: 2600 });
    }
  }, [error, isRefreshing, refreshWithFeedback, toast]);

  const notifyReadOnly = useCallback(() => {
    toast.info('Read-only preview', {
      id: 'home-read-only',
      description: 'Actions are turned off while previewing.',
    });
  }, [toast]);

  const dashboardProps = useMemo<ParentHomeDashboardProps>(
    () => ({ ...props, onRefresh: refreshWithFeedback }),
    [props, refreshWithFeedback],
  );

  return {
    toast,
    readOnly,
    dashboardProps,
    notifyReadOnly,
    onNotificationsMarkedRead: () =>
      toast.success('Notifications marked as read', { id: 'home-notifications-read' }),
    onProfilePhotoUpdated: () =>
      toast.success('Profile photo updated', { id: 'home-profile-photo' }),
    onProgramSelected: (label: string) =>
      toast.info(`Switching to ${label}…`, { id: 'home-program-switch', durationMs: 2000 }),
  };
}

export type HomeLabFeedback = ReturnType<typeof useHomeLabFeedback>;
