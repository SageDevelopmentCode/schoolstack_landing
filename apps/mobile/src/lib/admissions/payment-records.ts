import type { SupabaseClient } from '@supabase/supabase-js';

export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';
export type PaymentType = 'application_fee' | 'enrollment_checklist' | 'tuition';

export type PaymentRecordDisplayRow = {
  id: string;
  paymentType: PaymentType;
  label: string | null;
  amountCents: number;
  status: PaymentStatus;
  paidAt: string | null;
  createdAt: string;
  payerEmail: string | null;
};

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  application_fee: 'Application fee',
  enrollment_checklist: 'Enrollment',
  tuition: 'Tuition',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'Pending',
  succeeded: 'Succeeded',
  failed: 'Failed',
  refunded: 'Refunded',
};

function rowToPayment(row: Record<string, unknown>): PaymentRecordDisplayRow {
  return {
    id: String(row.id),
    paymentType: (row.payment_type as PaymentType) ?? 'application_fee',
    label: typeof row.label === 'string' ? row.label : null,
    amountCents: Number(row.amount_cents ?? 0),
    status: (row.status as PaymentStatus) ?? 'pending',
    paidAt: typeof row.paid_at === 'string' ? row.paid_at : null,
    createdAt: String(row.created_at),
    payerEmail: null,
  };
}

export async function listApplicationPayments(
  supabase: SupabaseClient,
  applicationId: string,
): Promise<PaymentRecordDisplayRow[]> {
  const { data, error } = await supabase
    .from('application_payments')
    .select(
      'id, payment_type, label, amount_cents, status, paid_at, created_at, payer_user_id',
    )
    .eq('application_id', applicationId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const rows = (data ?? []).map((row) => rowToPayment(row as Record<string, unknown>));
  const payerIds = [
    ...new Set(
      rows
        .map((row) => (data ?? []).find((entry) => String(entry.id) === row.id))
        .map((entry) => entry?.payer_user_id)
        .filter((id): id is string => typeof id === 'string' && id.length > 0),
    ),
  ];

  if (payerIds.length === 0) return rows;

  const { data: guardians, error: guardiansError } = await supabase
    .from('guardians')
    .select('user_id, email')
    .in('user_id', payerIds);

  if (guardiansError) throw guardiansError;

  const emailByUserId = new Map<string, string>();
  for (const guardian of guardians ?? []) {
    const userId = String(guardian.user_id);
    const email = typeof guardian.email === 'string' ? guardian.email.trim() : '';
    if (userId && email) emailByUserId.set(userId, email);
  }

  return rows.map((row) => {
    const source = (data ?? []).find((entry) => String(entry.id) === row.id);
    const payerUserId =
      source && typeof source.payer_user_id === 'string' ? source.payer_user_id : null;
    return {
      ...row,
      payerEmail: payerUserId ? (emailByUserId.get(payerUserId) ?? null) : null,
    };
  });
}

export function formatPaymentAmount(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

export function formatPaymentDateTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}
