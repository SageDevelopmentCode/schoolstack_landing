"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  adminToast,
  formatActionError,
} from "@/lib/school-admin/admin-toast";

/*
 * The admin Garden feedback contract (admin-portal-garden-design §4) in one
 * helper. Existing handlers keep their logic and wrap the async work in
 * `run(...)`:
 *  - pendingKey → spinner + "Saving…" on that one button (others stay usable)
 *  - success   → toast (title = what happened, description = what it means
 *                now), dismisses any earlier error toast, flashes the row
 *  - failure   → error toast with an error-specific id + Retry
 */

export type AdminActionCopy = {
  title: string;
  description?: string;
};

export type AdminActionOptions<T> = {
  /** Stable key for this action (button + row flash). */
  key: string;
  /** Toast id base. Success uses `${id}`, errors use `${id}-error`. */
  id?: string;
  success?: AdminActionCopy | ((result: T) => AdminActionCopy | null) | null;
  error: AdminActionCopy & { fallback?: string };
  /** Show "Retry" on the error toast (defaults to re-running the action). */
  retry?: boolean;
  /** Extra toast action on success (e.g. "Copy link"). */
  successAction?: { label: string; onClick: () => void };
  /** Row/item key to flash mint after success. */
  flashKey?: string | null;
};

const FLASH_MS = 1600;

export function useAdminAction() {
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [lastSavedKey, setLastSavedKey] = useState<string | null>(null);
  const flashTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (flashTimer.current) window.clearTimeout(flashTimer.current);
    },
    [],
  );

  const flash = useCallback((key: string | null | undefined) => {
    if (!key) return;
    setLastSavedKey(key);
    if (flashTimer.current) window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setLastSavedKey(null), FLASH_MS);
  }, []);

  const run = useCallback(
    async function runAction<T>(
      fn: () => Promise<T>,
      options: AdminActionOptions<T>,
    ): Promise<{ ok: true; result: T } | { ok: false; error: unknown }> {
      const toastId = options.id ?? `admin-${options.key}`;
      const errorId = `${toastId}-error`;
      setPendingKey(options.key);
      try {
        const result = await fn();
        adminToast.dismiss(errorId);
        const copy =
          typeof options.success === "function" ? options.success(result) : options.success;
        if (copy) {
          adminToast.success(copy.title, {
            id: toastId,
            description: copy.description,
            action: options.successAction,
          });
        }
        flash(options.flashKey ?? options.key);
        return { ok: true, result };
      } catch (error) {
        const message = formatActionError(error, options.error.fallback ?? options.error.title);
        const retry = options.retry !== false;
        adminToast.error(options.error.title, {
          id: errorId,
          description: [message !== options.error.title ? message : null, options.error.description]
            .filter(Boolean)
            .join(" "),
          action: retry
            ? { label: "Retry", onClick: () => void runAction(fn, options) }
            : undefined,
        });
        return { ok: false, error };
      } finally {
        setPendingKey((current) => (current === options.key ? null : current));
      }
    },
    [flash],
  );

  return { run, pendingKey, lastSavedKey, flash, isPending: (key: string) => pendingKey === key };
}

/** Shared copy for "the change was not saved" error descriptions. */
export const NOT_SAVED = "Nothing was changed.";
