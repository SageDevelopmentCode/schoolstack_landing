/**
 * Parent portal toast conventions:
 * - Use for user-initiated actions (upload photo, submit forms, etc.).
 * - Keep inline errors for field validation before submit when helpful.
 * - Title = what happened (short); `description` = what it means / what to do.
 */
import { toast } from "sonner";

export function formatParentActionError(
  err: unknown,
  fallback: string,
): string {
  return err instanceof Error ? err.message : fallback;
}

export type ParentToastOptions = {
  description?: string;
  action?: { label: string; onClick: () => void };
  /** Stable id: a repeat with the same id replaces the visible toast. */
  id?: string;
  duration?: number;
  /** Per-toast placement, e.g. "top-center" so a toast never covers a dialog's action footer. */
  position?: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
};

export const parentToast = {
  success: (message: string, options?: ParentToastOptions) =>
    toast.success(message, options),
  error: (message: string, options?: ParentToastOptions) =>
    toast.error(message, { duration: 7000, ...options }),
  info: (message: string, options?: ParentToastOptions) => toast(message, options),
  /** Removes a toast by id (e.g. clear a stale error once the retry succeeds). */
  dismiss: (id: string) => toast.dismiss(id),
};
