/**
 * Parent portal toast conventions:
 * - Use for user-initiated actions (upload photo, submit forms, etc.).
 * - Keep inline errors for field validation before submit when helpful.
 */
import { toast } from "sonner";

export function formatParentActionError(
  err: unknown,
  fallback: string,
): string {
  return err instanceof Error ? err.message : fallback;
}

export const parentToast = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  info: (message: string) => toast(message),
};
