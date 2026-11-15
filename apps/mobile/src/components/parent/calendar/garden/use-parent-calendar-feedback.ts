import { useCallback, useEffect, useRef, useState } from 'react';

import { useGardenToast } from '@/components/parent/garden/toast';
import { haptic } from '@/lib/haptics';

/**
 * Calendar feedback (skill §6). Wraps the controller's callbacks with haptics
 * and Garden toasts without changing what they do. Load failures are already
 * reported by `ParentCalendarProvider`; this only tells the parent.
 */
export function useParentCalendarFeedback({
  refresh,
  error,
  deepLinkMissing,
}: {
  refresh: () => Promise<void>;
  error: string | null;
  deepLinkMissing: boolean;
}) {
  const toast = useGardenToast();
  const [pullRefreshing, setPullRefreshing] = useState(false);
  const [settledTick, setSettledTick] = useState(0);
  const pendingRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const onPullRefresh = useCallback(async () => {
    haptic.select();
    pendingRef.current = true;
    setPullRefreshing(true);
    try {
      await refresh();
    } finally {
      if (mountedRef.current) {
        setPullRefreshing(false);
        setSettledTick((tick) => tick + 1);
      }
    }
  }, [refresh]);

  // Runs after the render that carries the refreshed `error`, so it reads the result.
  useEffect(() => {
    if (settledTick === 0 || !pendingRef.current) return;
    pendingRef.current = false;
    if (error) {
      toast.error("Couldn't refresh the calendar", {
        id: 'calendar-refresh',
        description: 'Showing what we already have. Check your connection, then try again.',
        action: { label: 'Try again', onPress: () => void onPullRefresh() },
      });
    } else {
      toast.info('Calendar is up to date', { id: 'calendar-refresh', durationMs: 2600 });
    }
  }, [error, onPullRefresh, settledTick, toast]);

  // A link to an event that no longer exists: say so instead of doing nothing (web parity).
  useEffect(() => {
    if (!deepLinkMissing) return;
    toast.info("That event isn't on the calendar anymore", {
      id: 'calendar-missing-event',
      description: "It may have been moved or cancelled. Here's the rest of the calendar.",
    });
  }, [deepLinkMissing, toast]);

  return { pullRefreshing, onPullRefresh };
}
