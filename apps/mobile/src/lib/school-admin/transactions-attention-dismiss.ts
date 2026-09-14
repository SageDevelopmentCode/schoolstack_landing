import AsyncStorage from '@react-native-async-storage/async-storage';

export type TransactionsAttentionVariant = 'failed' | 'pending';

const STORAGE_PREFIX = 'school_admin_transactions_attention_dismissed';

export function attentionDismissStorageKey(
  orgId: string,
  variant: TransactionsAttentionVariant,
): string {
  return `${STORAGE_PREFIX}:${orgId}:${variant}`;
}

export async function isAttentionDismissed(
  orgId: string,
  variant: TransactionsAttentionVariant,
): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(attentionDismissStorageKey(orgId, variant));
    return value === '1';
  } catch {
    return false;
  }
}

export async function dismissAttention(
  orgId: string,
  variant: TransactionsAttentionVariant,
): Promise<void> {
  try {
    await AsyncStorage.setItem(attentionDismissStorageKey(orgId, variant), '1');
  } catch {
    // Ignore storage failures.
  }
}

export async function clearAttentionDismiss(
  orgId: string,
  variant: TransactionsAttentionVariant,
): Promise<void> {
  try {
    await AsyncStorage.removeItem(attentionDismissStorageKey(orgId, variant));
  } catch {
    // Ignore storage failures.
  }
}

export async function readDismissedAttention(
  orgId: string,
): Promise<Partial<Record<TransactionsAttentionVariant, boolean>>> {
  const [failed, pending] = await Promise.all([
    isAttentionDismissed(orgId, 'failed'),
    isAttentionDismissed(orgId, 'pending'),
  ]);

  return { failed, pending };
}
