import { useCallback, useEffect, useRef, useState } from 'react';

import { useGardenToast } from '@/components/parent/garden/toast';
import { haptic } from '@/lib/haptics';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

export type AdminToastSpec = { title: string; description?: string };

export type AdminActionOptions<T> = {
  /** Identifies the action (row id, "copy-apply-link"): pending state, flash and toast ids. */
  key: string;
  /** Toast after success. Return `null` for no toast. */
  success?: ((result: T) => AdminToastSpec | null) | AdminToastSpec | null;
  /** Toast after failure. The description should say what did NOT change. */
  error: ((err: unknown) => AdminToastSpec) | AdminToastSpec;
  /** `fn` resolved but the action failed (e.g. `saveAction` → `false`). Defaults to "never". */
  failed?: (result: T) => boolean;
  /**
   * Report thrown errors under this operation. Omit when `fn` already reports
   * (e.g. attendance context) so Discord doesn't get the same failure twice.
   */
  operation?: string;
  metadata?: Record<string, unknown>;
  /** Show a Retry button on the error toast (re-runs the same action). */
  retry?: boolean;
  /** Skip toasts (a sheet is open: show status inside it instead). */
  silent?: boolean;
};

const FLASH_MS = 1600;

/**
 * Admin feedback contract on mobile (mirror of web `useAdminAction`): pending
 * key, success / error toast pair with an ERROR-SPECIFIC id (+ Retry), mint
 * flash key, haptics, and `reportError` for thrown failures.
 */
export function useAdminAction(organizationId: string) {
  const toast = useGardenToast();
  const { reportError } = useMobileErrorReporter(organizationId);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [flashKey, setFlashKey] = useState<string | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
    },
    [],
  );

  const flash = useCallback((key: string) => {
    if (flashTimer.current) clearTimeout(flashTimer.current);
    setFlashKey(key);
    flashTimer.current = setTimeout(() => setFlashKey(null), FLASH_MS);
  }, []);

  const run = useCallback(
    async <T>(fn: () => Promise<T>, options: AdminActionOptions<T>): Promise<boolean> => {
      const { key, success, error, failed, operation, metadata, retry, silent } = options;
      const errorId = `${key}-error`;
      setPendingKey(key);

      const fail = (err: unknown) => {
        const spec = typeof error === 'function' ? error(err) : error;
        haptic.error();
        if (!silent) {
          toast.error(spec.title, {
            id: errorId,
            description: spec.description,
            action: retry ? { label: 'Retry', onPress: () => void run(fn, options) } : undefined,
          });
        }
      };

      try {
        const result = await fn();
        if (failed?.(result)) {
          fail(null);
          return false;
        }
        toast.dismiss(errorId);
        const spec = typeof success === 'function' ? success(result) : success;
        haptic.success();
        if (spec && !silent) {
          toast.success(spec.title, { id: key, description: spec.description });
        }
        flash(key);
        return true;
      } catch (err) {
        if (operation) reportError(operation, err, { metadata });
        fail(err);
        return false;
      } finally {
        setPendingKey((current) => (current === key ? null : current));
      }
    },
    [flash, reportError, toast],
  );

  return { run, pendingKey, flashKey, flash, toast, reportError };
}

export type AdminAction = ReturnType<typeof useAdminAction>;
