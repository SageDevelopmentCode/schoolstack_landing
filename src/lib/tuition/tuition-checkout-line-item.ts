import { formatFeeAmount } from "@/lib/admissions/application-form-schema";
import type { CheckoutPaymentMethod } from "@/lib/stripe/processing-fee";
import { childFirstNameFromFullName } from "./parent-billing-summary";

export type TuitionCheckoutPaymentKind = "installment" | "lump_sum";

export type TuitionCheckoutLineItem = {
  label: string;
  description: string;
  paymentKind: TuitionCheckoutPaymentKind;
};

export type TuitionCheckoutDisplayLine = {
  label: string;
  amountCents: number;
};

function tuitionCheckoutStudentDisplayName(
  studentName?: string | null,
): string | null {
  if (!studentName?.trim()) return null;
  return childFirstNameFromFullName(studentName);
}

function buildStudentChargeLabel(
  studentName: string | null,
  chargeLabel: string,
): string {
  return studentName ? `${studentName} — ${chargeLabel}` : chargeLabel;
}

function processingFeeLabel(paymentMethod: CheckoutPaymentMethod): string {
  return paymentMethod === "card" ? "Card processing fee" : "Bank processing fee";
}

export function buildTuitionCheckoutLineItem(input: {
  studentName?: string | null;
  chargeLabel: string;
  remainingCents: number;
  requestedAmountCents: number;
  processingFeeCents: number;
}): TuitionCheckoutLineItem {
  const studentLabel = tuitionCheckoutStudentDisplayName(input.studentName);
  const label = buildStudentChargeLabel(studentLabel, input.chargeLabel);

  const feeNote = `Includes ${formatFeeAmount(input.processingFeeCents)} processing fee`;
  const isLumpSum = input.requestedAmountCents > input.remainingCents;
  const description = isLumpSum
    ? `${feeNote}. ${formatFeeAmount(input.remainingCents)} toward this installment; remainder applies to future installments.`
    : `${feeNote}.`;

  return {
    label,
    description,
    paymentKind: isLumpSum ? "lump_sum" : "installment",
  };
}

export function buildTuitionCheckoutLineItems(input: {
  studentName?: string | null;
  chargeLabel: string;
  remainingCents: number;
  requestedAmountCents: number;
  processingFeeCents: number;
  paymentMethod: CheckoutPaymentMethod;
}): {
  lineItems: TuitionCheckoutDisplayLine[];
  netToSchoolCents: number;
  grossAmountCents: number;
  paymentKind: "lump_sum";
} {
  const futureCents = input.requestedAmountCents - input.remainingCents;
  if (futureCents <= 0) {
    throw new Error(
      "buildTuitionCheckoutLineItems requires a lump-sum payment.",
    );
  }

  const studentLabel = tuitionCheckoutStudentDisplayName(input.studentName);
  const lineItems: TuitionCheckoutDisplayLine[] = [
    {
      label: buildStudentChargeLabel(studentLabel, input.chargeLabel),
      amountCents: input.remainingCents,
    },
    {
      label: studentLabel
        ? `${studentLabel} — Future installments`
        : "Future installments",
      amountCents: futureCents,
    },
  ];

  if (input.processingFeeCents > 0) {
    lineItems.push({
      label: processingFeeLabel(input.paymentMethod),
      amountCents: input.processingFeeCents,
    });
  }

  const netToSchoolCents = input.requestedAmountCents;
  const grossAmountCents = netToSchoolCents + input.processingFeeCents;

  return {
    lineItems,
    netToSchoolCents,
    grossAmountCents,
    paymentKind: "lump_sum",
  };
}
