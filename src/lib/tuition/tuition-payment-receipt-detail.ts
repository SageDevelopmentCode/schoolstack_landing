import type { ParentTuitionPaymentRecord } from "./payments";

export type TuitionPaymentReceiptLineItem = {
  studentName: string;
  chargeLabel: string;
  amountCents: number;
  enrollmentId: string | null;
};

export type TuitionPaymentReceiptDetail = {
  paidAtLabel: string;
  paymentMethodLabel: string;
  lineItems: TuitionPaymentReceiptLineItem[];
  schoolAmountCents: number;
  processingFeeCents: number;
  totalPaidCents: number;
  lumpSumBreakdown?: {
    installmentCents: number;
    futureCents: number;
  };
  isCombined: boolean;
  studentNames: string[];
  enrollmentIds: string[];
};

function formatPaidAtLabel(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  });
}

function resolvePaymentMethodLabel(
  payment: ParentTuitionPaymentRecord,
): string {
  if (payment.paymentMethodType === "card") return "Card";
  if (payment.paymentMethodType === "us_bank_account") return "Bank account";
  return "Manual payment";
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
        payment.status === "succeeded" &&
        payment.stripeCheckoutSessionId === selected.stripeCheckoutSessionId,
    );
    if (grouped.length > 0) {
      return grouped;
    }
  }

  return selected.status === "succeeded" ? [selected] : [];
}

export function buildTuitionPaymentReceiptDetail(
  payments: ParentTuitionPaymentRecord[],
): TuitionPaymentReceiptDetail | null {
  const succeeded = payments.filter((payment) => payment.status === "succeeded");
  if (succeeded.length === 0) return null;

  const isCombined = succeeded.length > 1;

  const lineItems: TuitionPaymentReceiptLineItem[] = succeeded.map((payment) => ({
    studentName: payment.studentFirstName ?? "Student",
    chargeLabel: payment.label ?? "Tuition",
    amountCents: payment.amountCents,
    enrollmentId: payment.enrollmentId,
  }));

  const schoolAmountCents = succeeded.reduce(
    (sum, payment) => sum + payment.amountCents,
    0,
  );
  const processingFeeCents = succeeded.reduce(
    (sum, payment) => sum + (payment.processingFeeCents ?? 0),
    0,
  );
  const totalPaidCents = succeeded.reduce(
    (sum, payment) => sum + (payment.chargedAmountCents ?? payment.amountCents),
    0,
  );

  const paidAt =
    succeeded
      .map((payment) => payment.paidAt)
      .filter((value): value is string => Boolean(value))
      .sort()[0] ?? succeeded[0]!.createdAt;

  let lumpSumBreakdown: TuitionPaymentReceiptDetail["lumpSumBreakdown"];
  if (!isCombined) {
    const payment = succeeded[0]!;
    const installmentCents = payment.amountAppliedCents ?? payment.amountCents;
    const futureCents = payment.amountCents - installmentCents;
    if (futureCents > 0) {
      lumpSumBreakdown = { installmentCents, futureCents };
    }
  }

  const studentNames = [
    ...new Set(lineItems.map((item) => item.studentName)),
  ];
  const enrollmentIds = [
    ...new Set(
      succeeded
        .map((payment) => payment.enrollmentId)
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  return {
    paidAtLabel: formatPaidAtLabel(paidAt),
    paymentMethodLabel: resolvePaymentMethodLabel(succeeded[0]!),
    lineItems,
    schoolAmountCents,
    processingFeeCents,
    totalPaidCents,
    lumpSumBreakdown,
    isCombined,
    studentNames,
    enrollmentIds,
  };
}
