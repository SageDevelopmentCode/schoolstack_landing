import { useCallback, useEffect, useRef, useState } from 'react';

import { useGardenToast, type GardenToastOptions } from '@/components/parent/garden/toast';
import { haptic } from '@/lib/haptics';
import {
  describeParentMessagesFeedback,
  type ParentMessagesFeedbackEvent,
} from '@/lib/messages/parent-messages-feedback';
import { usePortalPreview } from '@/lib/portal-preview-gating';

/** Delay before acting after a native-modal sheet closes (matches the Home `closeThen`). */
export const SHEET_DISMISS_MS = 220;

/** Run `action` once the sheet has had time to dismiss (toasts render behind open sheets). */
export function closeThen(close: () => void, action: () => void) {
  close();
  setTimeout(action, SHEET_DISMISS_MS);
}

/**
 * Messages events → Garden toasts. Failures here only *tell* the parent; the
 * caller still reports through `useMobileErrorReporter`.
 */
export function useParentMessagesNotify() {
  const toast = useGardenToast();
  const { readOnly } = usePortalPreview();

  const notify = useCallback(
    (event: ParentMessagesFeedbackEvent, extra?: Pick<GardenToastOptions, 'action'>) => {
      const described = describeParentMessagesFeedback(event);
      const options: GardenToastOptions = {
        id: described.id,
        description: described.description,
        durationMs: described.durationMs,
        ...extra,
      };
      if (described.kind === 'success') toast.success(described.title, options);
      else if (described.kind === 'error') toast.error(described.title, options);
      else toast.info(described.title, options);
    },
    [toast],
  );

  const notifyReadOnly = useCallback(() => notify({ type: 'read_only' }), [notify]);

  return { notify, notifyReadOnly, readOnly, toast };
}

/**
 * Pull-to-refresh with feedback (skill §6): select haptic on pull, a spinner the
 * whole time (even on a silent inbox refresh), then "up to date" or an error
 * toast with Try again. The inbox context already reports load failures.
 */
export function useInboxRefreshFeedback(
  refresh: (options?: { silent?: boolean }) => Promise<void>,
  error: string | null,
) {
  const { notify } = useParentMessagesNotify();
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
      await refresh({ silent: true });
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
      notify(
        { type: 'refresh_failed' },
        { action: { label: 'Try again', onPress: () => void onPullRefresh() } },
      );
    } else {
      notify({ type: 'refreshed' });
    }
  }, [error, notify, onPullRefresh, settledTick]);

  return { pullRefreshing, onPullRefresh };
}
