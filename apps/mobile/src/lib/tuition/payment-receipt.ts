import type { ParentTuitionPaymentRecord } from '@/lib/parent/parent-portal-api';

export type TuitionPaymentReceiptLineItem = {
  studentName: string;
  chargeLabel: string;
  amountCents: number;
};

export type TuitionPaymentReceiptDetail = {
  paidAtLabel: string;
  paymentMethodLabel: string;
  lineItems: TuitionPaymentReceiptLineItem[];
  schoolAmountCents: number;
  processingFeeCents: number;
  totalPaidCents: number;
  isCombined: boolean;
};

function formatPaidAtLabel(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    dateStyle: 'long',
    timeStyle: 'short',
  });
}

export function formatTuitionPaymentMethodLabel(
  payment: Pick<ParentTuitionPaymentRecord, 'paymentMethodType' | 'stripeCheckoutSessionId'>,
): string {
  if (payment.paymentMethodType === 'card') return 'Card';
  if (payment.paymentMethodType === 'us_bank_account') return 'Bank account';
  if (payment.stripeCheckoutSessionId) return 'Paid online';
  return 'Manual payment';
}

export function resolveRelatedTuitionPayments(
  payments: ParentTuitionPaymentRecord[],
  paymentId: string,
): ParentTuitionPaymentRecord[] {
  const selected = payments.find((payment) => payment.id === paymentId);
  if (!selected) return [];

  if (selected.stripeCheckoutSessionId) {
    const grouped = payments.filter(
      (payment) =>
        payment.status === 'succeeded' &&
        payment.stripeCheckoutSessionId === selected.stripeCheckoutSessionId,
    );
    if (grouped.length > 0) {
      return grouped;
    }
  }

  return selected.status === 'succeeded' ? [selected] : [];
}

export function buildTuitionPaymentReceiptDetail(
  payments: ParentTuitionPaymentRecord[],
): TuitionPaymentReceiptDetail | null {
  const succeeded = payments.filter((payment) => payment.status === 'succeeded');
  if (succeeded.length === 0) return null;

  const isCombined = succeeded.length > 1;
  const lineItems: TuitionPaymentReceiptLineItem[] = succeeded.map((payment) => ({
    studentName: payment.studentFirstName ?? 'Student',
    chargeLabel: payment.label ?? 'Tuition',
    amountCents: payment.amountCents,
  }));

  const schoolAmountCents = succeeded.reduce((sum, payment) => sum + payment.amountCents, 0);
  const processingFeeCents = succeeded.reduce(
    (sum, payment) => sum + (payment.processingFeeCents ?? 0),
    0,
  );
  const totalPaidCents = succeeded.reduce(
    (sum, payment) => sum + (payment.chargedAmountCents ?? payment.amountCents),
    0,
  );

  const paidAt = succeeded
    .map((payment) => payment.paidAt)
    .filter((value): value is string => Boolean(value))
    .sort()
    .reverse()[0];

  return {
    paidAtLabel: paidAt ? formatPaidAtLabel(paidAt) : 'Payment',
    paymentMethodLabel: formatTuitionPaymentMethodLabel(succeeded[0]!),
    lineItems,
    schoolAmountCents,
    processingFeeCents,
    totalPaidCents,
    isCombined,
  };
}
