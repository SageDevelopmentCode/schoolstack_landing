/**
 * School admin toast conventions:
 * - Use for user-initiated mutations (save, create, delete, publish, send, sync).
 * - Keep inline setError for field validation before submit.
 * - Keep AdminPageState / inline banners for page/data load failures.
 * - Do not use for login / OTP flows.
 */
import { toast } from "sonner";

const SESSION_EXPIRED_USER_MESSAGE =
  "Your session expired. Refresh the page and sign in again.";

const SESSION_EXPIRED_MESSAGES = new Set(["JWT expired", "Invalid JWT"]);

function readErrorField(err: unknown, field: "message" | "code"): string | undefined {
  if (!err || typeof err !== "object") return undefined;
  const value = (err as Record<string, unknown>)[field];
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

/** Plain session message for an expired Supabase JWT. Null for every other error. */
export function sessionExpiredUserMessage(err: unknown): string | null {
  if (readErrorField(err, "code") === "PGRST303") return SESSION_EXPIRED_USER_MESSAGE;
  const message = readErrorField(err, "message");
  if (message && SESSION_EXPIRED_MESSAGES.has(message)) return SESSION_EXPIRED_USER_MESSAGE;
  return null;
}

export function formatActionError(
  err: unknown,
  fallback: string,
): string {
  return sessionExpiredUserMessage(err) ?? (err instanceof Error ? err.message : fallback);
}

export type AdminToastOptions = {
  /** What it means / what to do next. The title says what happened. */
  description?: string;
  action?: { label: string; onClick: () => void };
  /** Stable id: a repeat with the same id replaces the visible toast. */
  id?: string;
  duration?: number;
};

export const adminToast = {
  success: (message: string, options?: AdminToastOptions) =>
    toast.success(message, options),
  error: (message: string, options?: AdminToastOptions) =>
    toast.error(message, options ? { duration: 7000, ...options } : undefined),
  info: (message: string, options?: AdminToastOptions) => toast(message, options),
  /** Show a spinner toast; update it later with the same id. */
  loading: (message: string, options?: AdminToastOptions) => toast.loading(message, options),
  dismiss: (id?: string) => toast.dismiss(id),
};
