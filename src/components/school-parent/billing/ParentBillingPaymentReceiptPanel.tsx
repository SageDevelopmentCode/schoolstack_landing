"use client";

import { Tick } from "@/components/garden/ui";
import ParentBillingSidePanel from "@/components/school-parent/billing/ParentBillingSidePanel";
import { chargeToneToGChip } from "@/components/school-parent/billing/garden/billing-garden-tones";
import { GChip, GKicker, NOTE_TINTS } from "@/components/school-parent/garden/ui";
import { formatCents } from "@/lib/tuition/pricing";
import {
  tuitionPaymentStripeStatusBadge,
  tuitionPaymentStripeStatusHint,
} from "@/lib/tuition/stripe-provider-status-display";
import type { TuitionPaymentReceiptDetail } from "@/lib/tuition/tuition-payment-receipt-detail";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ParentBillingPaymentReceiptPanelProps = {
  theme: ParentThemeTokens;
  /** Kept for call-site compatibility; the drawer uses Garden tokens. */
  C?: AdminThemeTokens;
  open: boolean;
  receipt: TuitionPaymentReceiptDetail | null;
  studentColorMap: Map<string, number>;
  onClose: () => void;
};

const HINT_TONE_CLASS = {
  danger: "text-[var(--sf-clay-deep)]",
  warning: "text-[#6b4f00]",
  info: "text-[var(--sf-ink)]/65",
} as const;

function ReceiptRow({
  label,
  value,
  emphasized = false,
}: {
  label: string;
  value: string;
  emphasized?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 ${
        emphasized
          ? "border-t-[1.5px] border-dashed border-[var(--sf-ink)]/20 pt-2.5 text-[15px] font-extrabold text-[var(--sf-ink)]"
          : "text-sm font-semibold"
      }`}
    >
      <span className={emphasized ? "" : "text-[var(--sf-soft)]"}>{label}</span>
      <span className="tabular-nums text-[var(--sf-ink)]">{value}</span>
    </div>
  );
}

/** Receipt drawer for one (possibly combined) tuition payment. */
export default function ParentBillingPaymentReceiptPanel({
  theme,
  open,
  receipt,
  studentColorMap,
  onClose,
}: ParentBillingPaymentReceiptPanelProps) {
  if (!receipt) return null;

  const stripeStatusBadge = receipt.stripeStatusSource
    ? tuitionPaymentStripeStatusBadge(receipt.stripeStatusSource)
    : null;
  const stripeStatusHint = receipt.stripeStatusSource
    ? tuitionPaymentStripeStatusHint(receipt.stripeStatusSource)
    : null;

  const uniqueStudents = [
    ...new Map(
      receipt.lineItems.map((item) => [item.enrollmentId ?? item.studentName, item]),
    ).values(),
  ];

  const tintFor = (enrollmentId: string | null | undefined) =>
    NOTE_TINTS[(enrollmentId ? (studentColorMap.get(enrollmentId) ?? 0) : 0) % NOTE_TINTS.length];

  return (
    <ParentBillingSidePanel
      theme={theme}
      open={open}
      kicker="Receipt"
      title="Payment receipt"
      subtitle={receipt.paidAtLabel}
      onClose={onClose}
      testId="parent-billing-payment-receipt-panel"
      panelId="parent-billing-payment-receipt-panel"
    >
      {stripeStatusBadge ? (
        <div className="flex flex-wrap items-center gap-2">
          <span data-testid={stripeStatusBadge.testId} className="inline-flex">
            <GChip tone={chargeToneToGChip(stripeStatusBadge.tone)}>
              {stripeStatusBadge.label}
            </GChip>
          </span>
          {stripeStatusHint ? (
            <p
              className={`m-0 text-xs font-semibold leading-snug ${HINT_TONE_CLASS[stripeStatusHint.tone]}`}
            >
              {stripeStatusHint.message}
            </p>
          ) : null}
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-[16px] bg-[var(--sf-mint)] px-4 py-3">
          <Tick className="h-8 w-8" color="var(--sf-forest)" />
          <p className="m-0 text-[15px] font-extrabold text-[var(--sf-forest)]">
            {formatCents(receipt.totalPaidCents)} paid
          </p>
        </div>
      )}

      {uniqueStudents.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {uniqueStudents.map((item) => (
            <span
              key={`${item.studentName}-${item.enrollmentId ?? "student"}`}
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-extrabold text-[var(--sf-ink)] ${tintFor(item.enrollmentId)}`}
            >
              {item.studentName}
            </span>
          ))}
        </div>
      ) : null}

      <div className="rounded-[20px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white p-4">
        <GKicker>{receipt.isCombined ? "Charges paid" : "Charge"}</GKicker>
        <ul className="m-0 mt-3 flex list-none flex-col gap-3 p-0">
          {receipt.lineItems.map((item, index) => (
            <li
              key={`${item.chargeLabel}-${item.studentName}-${index}`}
              className="flex items-start justify-between gap-3 text-sm"
            >
              <p className="m-0 min-w-0 font-semibold text-[var(--sf-ink)]">
                <span className="font-extrabold">{item.studentName}</span>
                <span className="text-[var(--sf-soft)]"> — </span>
                {item.chargeLabel}
              </p>
              <span className="shrink-0 font-extrabold tabular-nums text-[var(--sf-ink)]">
                {formatCents(item.amountCents)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {receipt.lumpSumBreakdown ? (
        <div
          className="rounded-[16px] bg-[var(--sf-sky)] p-4"
          data-testid="parent-billing-receipt-lump-sum"
        >
          <p className="m-0 text-sm font-extrabold text-[var(--sf-ink)]">Payment breakdown</p>
          <p className="m-0 mt-1 text-xs font-semibold text-[var(--sf-ink)]/70">
            {formatCents(receipt.lumpSumBreakdown.installmentCents)} installment ·{" "}
            {formatCents(receipt.lumpSumBreakdown.futureCents)} future
          </p>
          <p className="m-0 mt-1 text-xs font-semibold text-[var(--sf-ink)]/70">
            Future installments were recalculated.
          </p>
        </div>
      ) : null}

      <section className="sf-paper flex flex-col gap-2.5 rounded-[20px] p-4">
        <ReceiptRow label="School amount" value={formatCents(receipt.schoolAmountCents)} />
        {receipt.processingFeeCents > 0 ? (
          <ReceiptRow
            label="Processing fee"
            value={formatCents(receipt.processingFeeCents)}
          />
        ) : null}
        <ReceiptRow label="Total paid" value={formatCents(receipt.totalPaidCents)} emphasized />
        <ReceiptRow label="Payment method" value={receipt.paymentMethodLabel} />
      </section>
    </ParentBillingSidePanel>
  );
}
