import type { SupabaseClient } from '@supabase/supabase-js';

export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';
export type PaymentType = 'application_fee' | 'enrollment_checklist' | 'tuition';
export type PaymentMethodType = 'card' | 'us_bank_account';

export type PaymentRecordDisplayRow = {
  id: string;
  applicationId: string | null;
  paymentType: PaymentType;
  label: string | null;
  amountCents: number;
  chargedAmountCents: number | null;
  processingFeeCents: number | null;
  paymentMethodType: PaymentMethodType | null;
  status: PaymentStatus;
  paidAt: string | null;
  createdAt: string;
  payerEmail: string | null;
  applicantLabel: string | null;
};

export type PaymentRowsSummary = {
  collectedThisMonthCents: number;
  collectedYtdCents: number;
  pendingCount: number;
  pendingCents: number;
  failedCount: number;
  refundedCount: number;
  refundedCents: number;
  applicationFeeCents: number;
  enrollmentCents: number;
  tuitionCents: number;
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

export const PAYMENT_METHOD_LABELS: Record<PaymentMethodType, string> = {
  card: 'Card',
  us_bank_account: 'ACH',
};

const ORGANIZATION_PAYMENTS_LIMIT = 500;

type PaymentRowSource = {
  id: string;
  applicationId: string | null;
  paymentType: PaymentType;
  label: string | null;
  amountCents: number;
  chargedAmountCents: number | null;
  processingFeeCents: number | null;
  paymentMethodType: PaymentMethodType | null;
  status: PaymentStatus;
  paidAt: string | null;
  createdAt: string;
  payerUserId: string | null;
};

function rowToPayment(row: Record<string, unknown>): PaymentRowSource {
  const paymentMethodType = row.payment_method_type;
  return {
    id: String(row.id),
    applicationId: typeof row.application_id === 'string' ? row.application_id : null,
    paymentType: (row.payment_type as PaymentType) ?? 'application_fee',
    label: typeof row.label === 'string' ? row.label : null,
    amountCents: Number(row.amount_cents ?? 0),
    chargedAmountCents:
      typeof row.charged_amount_cents === 'number' ? row.charged_amount_cents : null,
    processingFeeCents:
      typeof row.processing_fee_cents === 'number' ? row.processing_fee_cents : null,
    paymentMethodType:
      paymentMethodType === 'card' || paymentMethodType === 'us_bank_account'
        ? paymentMethodType
        : null,
    status: (row.status as PaymentStatus) ?? 'pending',
    paidAt: typeof row.paid_at === 'string' ? row.paid_at : null,
    createdAt: String(row.created_at),
    payerUserId: typeof row.payer_user_id === 'string' ? row.payer_user_id : null,
  };
}

function resolveApplicantLabel(responses: unknown): string | null {
  if (!responses || typeof responses !== 'object' || Array.isArray(responses)) {
    return null;
  }

  const record = responses as Record<string, unknown>;
  const studentFirst =
    typeof record.student_first_name === 'string' ? record.student_first_name.trim() : '';
  const studentLast =
    typeof record.student_last_name === 'string' ? record.student_last_name.trim() : '';
  const studentName = [studentFirst, studentLast].filter(Boolean).join(' ');
  if (studentName) return studentName;

  const guardianFirst =
    typeof record.guardian_first_name === 'string' ? record.guardian_first_name.trim() : '';
  const guardianLast =
    typeof record.guardian_last_name === 'string' ? record.guardian_last_name.trim() : '';
  const guardianName = [guardianFirst, guardianLast].filter(Boolean).join(' ');
  return guardianName || null;
}

async function enrichPaymentDisplayRows(
  supabase: SupabaseClient,
  records: PaymentRowSource[],
): Promise<PaymentRecordDisplayRow[]> {
  if (records.length === 0) return [];

  const applicationIds = [
    ...new Set(
      records
        .map((row) => row.applicationId)
        .filter((id): id is string => Boolean(id)),
    ),
  ];
  const payerIds = [
    ...new Set(
      records
        .map((row) => row.payerUserId)
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  const [applicationsResult, guardiansResult, profilesResult] = await Promise.all([
    applicationIds.length > 0
      ? supabase.from('applications').select('id, responses').in('id', applicationIds)
      : Promise.resolve({ data: [] as Array<{ id: string; responses: unknown }>, error: null }),
    payerIds.length > 0
      ? supabase.from('guardians').select('user_id, email').in('user_id', payerIds)
      : Promise.resolve({ data: [] as Array<{ user_id: string; email: string | null }>, error: null }),
    payerIds.length > 0
      ? supabase.from('profiles').select('id, email').in('id', payerIds)
      : Promise.resolve({ data: [] as Array<{ id: string; email: string | null }>, error: null }),
  ]);

  if (applicationsResult.error) throw applicationsResult.error;
  if (guardiansResult.error) throw guardiansResult.error;
  if (profilesResult.error) throw profilesResult.error;

  const applicationById = new Map(
    (applicationsResult.data ?? []).map((row) => [String(row.id), row]),
  );
  const guardianEmailByUserId = new Map<string, string>();
  for (const row of guardiansResult.data ?? []) {
    const userId = String(row.user_id);
    const email = typeof row.email === 'string' ? row.email.trim() : '';
    if (userId && email && !guardianEmailByUserId.has(userId)) {
      guardianEmailByUserId.set(userId, email);
    }
  }
  const profileEmailById = new Map(
    (profilesResult.data ?? [])
      .filter((row) => typeof row.email === 'string' && row.email.trim())
      .map((row) => [String(row.id), String(row.email)]),
  );

  return records.map((record) => {
    const payerEmail = record.payerUserId
      ? (guardianEmailByUserId.get(record.payerUserId) ??
          profileEmailById.get(record.payerUserId) ??
          null)
      : null;

    return {
      id: record.id,
      applicationId: record.applicationId,
      paymentType: record.paymentType,
      label: record.label,
      amountCents: record.amountCents,
      chargedAmountCents: record.chargedAmountCents,
      processingFeeCents: record.processingFeeCents,
      paymentMethodType: record.paymentMethodType,
      status: record.status,
      paidAt: record.paidAt,
      createdAt: record.createdAt,
      payerEmail,
      applicantLabel: record.applicationId
        ? resolveApplicantLabel(applicationById.get(record.applicationId)?.responses)
        : null,
    };
  });
}

function paymentTimestamp(row: PaymentRecordDisplayRow): Date | null {
  const iso = row.paidAt ?? row.createdAt;
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function summarizePaymentRows(rows: PaymentRecordDisplayRow[]): PaymentRowsSummary {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let collectedThisMonthCents = 0;
  let collectedYtdCents = 0;
  let pendingCount = 0;
  let pendingCents = 0;
  let failedCount = 0;
  let refundedCount = 0;
  let refundedCents = 0;
  let applicationFeeCents = 0;
  let enrollmentCents = 0;
  let tuitionCents = 0;

  for (const row of rows) {
    const amount = row.amountCents;
    const paidAt = paymentTimestamp(row);

    if (row.status === 'succeeded') {
      if (paidAt && paidAt.getFullYear() === currentYear) {
        collectedYtdCents += amount;
        if (paidAt.getMonth() === currentMonth) {
          collectedThisMonthCents += amount;
        }
      }
      if (row.paymentType === 'application_fee') {
        applicationFeeCents += amount;
      } else if (row.paymentType === 'enrollment_checklist') {
        enrollmentCents += amount;
      } else if (row.paymentType === 'tuition') {
        tuitionCents += amount;
      }
    } else if (row.status === 'pending') {
      pendingCount += 1;
      pendingCents += amount;
    } else if (row.status === 'failed') {
      failedCount += 1;
    } else if (row.status === 'refunded') {
      refundedCount += 1;
      refundedCents += amount;
    }
  }

  return {
    collectedThisMonthCents,
    collectedYtdCents,
    pendingCount,
    pendingCents,
    failedCount,
    refundedCount,
    refundedCents,
    applicationFeeCents,
    enrollmentCents,
    tuitionCents,
  };
}

const PAYMENT_SELECT =
  'id, application_id, payment_type, label, amount_cents, charged_amount_cents, processing_fee_cents, payment_method_type, status, paid_at, created_at, payer_user_id';

export async function listOrganizationPayments(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<PaymentRecordDisplayRow[]> {
  const { data, error } = await supabase
    .from('application_payments')
    .select(PAYMENT_SELECT)
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(ORGANIZATION_PAYMENTS_LIMIT);

  if (error) throw error;

  const records = (data ?? []).map((row) => rowToPayment(row as Record<string, unknown>));
  return enrichPaymentDisplayRows(supabase, records);
}

export async function listApplicationPayments(
  supabase: SupabaseClient,
  applicationId: string,
): Promise<PaymentRecordDisplayRow[]> {
  const { data, error } = await supabase
    .from('application_payments')
    .select(PAYMENT_SELECT)
    .eq('application_id', applicationId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const records = (data ?? []).map((row) => rowToPayment(row as Record<string, unknown>));
  return enrichPaymentDisplayRows(supabase, records);
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
