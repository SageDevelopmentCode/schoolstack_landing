import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

import { useGardenToast } from '@/components/parent/garden/toast';
import { haptic } from '@/lib/haptics';
import { usePortalReadOnly } from '@/lib/portal-preview-gating';

/** Delay before acting after a native-modal sheet closes (toasts render behind open sheets). */
export const SHEET_DISMISS_MS = 220;

/** Close a sheet, then run `action` once it has dismissed. */
export function closeThen(close: () => void, action: () => void) {
  close();
  setTimeout(action, SHEET_DISMISS_MS);
}

/**
 * Native destructive confirm as a promise. Resolves `true` only when the parent
 * taps the destructive button.
 */
export function confirmDestructive({
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
}: {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}): Promise<boolean> {
  haptic.warning();
  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: cancelLabel, style: 'cancel', onPress: () => resolve(false) },
        { text: confirmLabel, style: 'destructive', onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}

/**
 * Read-only preview gate (skill §6): instead of a dead button, actions that
 * write tell the viewer they're previewing.
 */
export function useGardenReadOnlyGate() {
  const readOnly = usePortalReadOnly();
  const toast = useGardenToast();

  const notifyReadOnly = useCallback(() => {
    toast.info('Read-only preview', {
      id: 'read-only-preview',
      description: 'Actions are turned off while previewing.',
    });
  }, [toast]);

  /** Wrap a write action: in preview it toasts instead of running. */
  const guard = useCallback(
    <Args extends unknown[]>(action: (...args: Args) => void) =>
      (...args: Args) => {
        if (readOnly) {
          notifyReadOnly();
          return;
        }
        action(...args);
      },
    [notifyReadOnly, readOnly],
  );

  return { readOnly, guard, notifyReadOnly };
}

/**
 * Pull-to-refresh with feedback (skill §6): select haptic on pull, the spinner
 * for the whole request, then "{label} is up to date" or an error toast with
 * Try again. Load failures are reported by the caller; this only tells the parent.
 */
export function useGardenPullRefresh({
  refresh,
  error,
  label,
  id,
}: {
  refresh: () => Promise<unknown>;
  error: string | null;
  /** e.g. "Attendance" → "Attendance is up to date". */
  label: string;
  id: string;
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
    } catch {
      // intentionally silent: the caller reports; the toast below reads `error`.
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
      toast.error(`Couldn't refresh ${label.toLowerCase()}`, {
        id,
        description: 'Showing what we already have. Check your connection, then try again.',
        action: { label: 'Try again', onPress: () => void onPullRefresh() },
      });
    } else {
      toast.info(`${label} is up to date`, { id, durationMs: 2600 });
    }
  }, [error, id, label, onPullRefresh, settledTick, toast]);

  return { pullRefreshing, onPullRefresh };
}
