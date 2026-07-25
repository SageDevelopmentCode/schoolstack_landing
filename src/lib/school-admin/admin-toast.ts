/**
 * School admin toast conventions:
 * - Use for user-initiated mutations (save, create, delete, publish, send, sync).
 * - Keep inline setError for field validation before submit.
 * - Keep AdminPageState / inline banners for page/data load failures.
 * - Do not use for login / OTP flows.
 */
import { toast } from "sonner";

export function formatActionError(
  err: unknown,
  fallback: string,
): string {
  return err instanceof Error ? err.message : fallback;
}

export const adminToast = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  info: (message: string) => toast(message),
};
