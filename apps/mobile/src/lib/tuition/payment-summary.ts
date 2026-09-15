import type { ParentTuitionPaymentRecord } from '@/lib/parent/parent-portal-api';

export type ParentLastPaymentDaySummary = {
  paidAt: string;
  amountCents: number;
  studentFirstNames: string[];
};

export function resolveMostRecentTuitionPayment(
  payments: ParentTuitionPaymentRecord[],
): ParentTuitionPaymentRecord | null {
  const succeeded = payments.filter(
    (payment) => payment.status === 'succeeded' && payment.paidAt,
  );

  if (succeeded.length === 0) return null;

  return [...succeeded].sort((a, b) => (b.paidAt ?? '').localeCompare(a.paidAt ?? ''))[0]!;
}

export function resolveLastPaymentDaySummary(
  payments: ParentTuitionPaymentRecord[],
): ParentLastPaymentDaySummary | null {
  const mostRecentPayment = resolveMostRecentTuitionPayment(payments);
  if (!mostRecentPayment?.paidAt) return null;

  const lastPaymentDay = mostRecentPayment.paidAt.slice(0, 10);
  const sameDayPayments = payments.filter(
    (payment) =>
      payment.status === 'succeeded' && payment.paidAt?.slice(0, 10) === lastPaymentDay,
  );

  const amountCents = sameDayPayments.reduce((sum, payment) => sum + payment.amountCents, 0);
  const studentFirstNames = [
    ...new Set(
      sameDayPayments
        .map((payment) => payment.studentFirstName)
        .filter((name): name is string => Boolean(name)),
    ),
  ];

  return {
    paidAt: mostRecentPayment.paidAt,
    amountCents,
    studentFirstNames,
  };
}
