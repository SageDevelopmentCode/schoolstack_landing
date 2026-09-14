export type TransactionsAttentionVariant = "failed" | "pending";

const STORAGE_PREFIX = "school_admin_transactions_attention_dismissed";

export function attentionDismissStorageKey(
  orgId: string,
  variant: TransactionsAttentionVariant,
): string {
  return `${STORAGE_PREFIX}:${orgId}:${variant}`;
}

export function isAttentionDismissed(
  orgId: string,
  variant: TransactionsAttentionVariant,
): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(attentionDismissStorageKey(orgId, variant)) === "1";
  } catch {
    return false;
  }
}

export function dismissAttention(
  orgId: string,
  variant: TransactionsAttentionVariant,
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(attentionDismissStorageKey(orgId, variant), "1");
  } catch {
    // Ignore storage failures.
  }
}

export function clearAttentionDismiss(
  orgId: string,
  variant: TransactionsAttentionVariant,
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(attentionDismissStorageKey(orgId, variant));
  } catch {
    // Ignore storage failures.
  }
}

export function readDismissedAttention(
  orgId: string,
): Partial<Record<TransactionsAttentionVariant, boolean>> {
  return {
    failed: isAttentionDismissed(orgId, "failed"),
    pending: isAttentionDismissed(orgId, "pending"),
  };
}
