import type { GChipTone } from "@/components/school-parent/garden/ui";
import { formatFeeAmount } from "@/lib/admissions/application-form-schema";
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_TYPE_LABELS,
  type PaymentRecordDisplayRow,
} from "@/lib/admissions/payment-records";
import { paymentRecordAdminStatusBadge } from "@/lib/tuition/stripe-provider-status-display";

/** Shared display helpers for the Garden Finances ledger and drawer. */

export function formatPaymentDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export function paymentWhen(row: PaymentRecordDisplayRow): string {
  return formatPaymentDateTime(row.paidAt ?? row.createdAt);
}

export function paymentTitle(row: PaymentRecordDisplayRow): string {
  return row.label ?? PAYMENT_TYPE_LABELS[row.paymentType];
}

export function paymentPayer(row: PaymentRecordDisplayRow): string {
  return row.payerEmail ?? row.applicantLabel ?? "—";
}

export function paymentMethod(row: PaymentRecordDisplayRow): string {
  return row.paymentMethodType ? PAYMENT_METHOD_LABELS[row.paymentMethodType] : "—";
}

export function paymentStatusChip(row: PaymentRecordDisplayRow): { label: string; tone: GChipTone } {
  const badge = paymentRecordAdminStatusBadge(row);
  return { label: badge.label, tone: badge.tone === "purple" ? "neutral" : badge.tone };
}

export function paymentChargedLine(row: PaymentRecordDisplayRow): string {
  return `Charged ${formatFeeAmount(row.chargedAmountCents ?? row.amountCents)}${
    row.processingFeeCents ? ` (+${formatFeeAmount(row.processingFeeCents)} fee)` : ""
  }`;
}

export function applicationHref(orgSlug: string, applicationId: string): string {
  return `/school/${orgSlug}/admin/admissions/submissions?application=${applicationId}`;
}

export function pluralize(count: number, one: string, many = `${one}s`): string {
  return `${count} ${count === 1 ? one : many}`;
}

/** What each status means for the school, in admin words. */
export const PAYMENT_STATUS_GUIDE: Array<{ label: string; tone: GChipTone; meaning: string }> = [
  { label: "Succeeded", tone: "success", meaning: "Collected through Stripe." },
  { label: "Processing", tone: "info", meaning: "Bank payment processing — usually 3–5 business days." },
  { label: "Pending", tone: "warning", meaning: "Started, but Stripe hasn't confirmed it yet." },
  {
    label: "Verify bank",
    tone: "warning",
    meaning: "The family needs to finish bank verification from the email Stripe sent them.",
  },
  { label: "Failed", tone: "alert", meaning: "Didn't go through. Nothing was collected." },
  { label: "Refunded", tone: "info", meaning: "Returned to the family." },
];
