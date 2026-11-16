"use client";

import { ChevronRight } from "lucide-react";
import { Tick } from "@/components/garden/ui";
import { chargeToneToGChip } from "@/components/school-parent/billing/garden/billing-garden-tones";
import { GChip, NOTE_TINTS, G_FOCUS } from "@/components/school-parent/garden/ui";
import { formatBillingDueDate } from "@/lib/tuition/due-date-display";
import { formatCents } from "@/lib/tuition/pricing";
import type { ParentTuitionPaymentRecord } from "@/lib/tuition/payments";
import { formatTuitionPaymentMethodLabel } from "@/lib/tuition/tuition-payment-receipt-detail";
import {
  tuitionPaymentStripeStatusBadge,
  tuitionPaymentStripeStatusHint,
} from "@/lib/tuition/stripe-provider-status-display";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ParentBillingPaymentHistoryRowProps = {
  /** Kept for call-site compatibility; the row uses Garden tokens. */
  C?: AdminThemeTokens;
  theme?: ParentThemeTokens;
  payment: ParentTuitionPaymentRecord;
  showStudentBadge?: boolean;
  badgeColorIndex?: number;
  onClick?: () => void;
};

const HINT_TONE_CLASS = {
  danger: "text-[var(--sf-clay-deep)]",
  warning: "text-[#6b4f00]",
  info: "text-[var(--sf-ink)]/65",
} as const;

/** One payment in a notebook list; opens the receipt drawer. */
export default function ParentBillingPaymentHistoryRow({
  payment,
  showStudentBadge = false,
  badgeColorIndex = 0,
  onClick,
}: ParentBillingPaymentHistoryRowProps) {
  const paymentMethodLabel = formatTuitionPaymentMethodLabel(payment);
  const subtitleDate = payment.paidAt
    ? formatBillingDueDate(payment.paidAt.slice(0, 10))
    : formatBillingDueDate(payment.createdAt.slice(0, 10));
  const displayAmountCents = payment.chargedAmountCents ?? payment.amountCents;
  const stripeStatusHint = tuitionPaymentStripeStatusHint(payment);
  const stripeStatusBadge = tuitionPaymentStripeStatusBadge(payment);
  const settled = payment.status === "succeeded" && !stripeStatusBadge;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex min-h-[60px] w-full items-center justify-between gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors hover:bg-white/80 ${G_FOCUS} focus-visible:ring-inset`}
      data-testid="parent-billing-payment-history-row"
    >
      <span className="flex min-w-0 items-center gap-3">
        {settled ? (
          <Tick className="h-7 w-7" color="var(--sf-forest)" fill="var(--sf-mint)" />
        ) : (
          <span
            aria-hidden="true"
            className="h-7 w-7 shrink-0 rounded-full border-2 border-dashed border-[var(--sf-ink)]/40 bg-white"
          />
        )}
        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-2">
            {showStudentBadge && payment.studentFirstName ? (
              <span
                className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-extrabold text-[var(--sf-ink)] ${NOTE_TINTS[badgeColorIndex % NOTE_TINTS.length]}`}
                data-testid="parent-billing-payment-student-badge"
              >
                For {payment.studentFirstName}
              </span>
            ) : null}
            <span className="text-[15px] font-extrabold text-[var(--sf-ink)]">
              {payment.label ?? "Tuition payment"}
            </span>
          </span>
          <span className="mt-0.5 block text-[13px] font-semibold text-[var(--sf-soft)]">
            {subtitleDate}
            {` · ${paymentMethodLabel}`}
          </span>
          {stripeStatusHint ? (
            <span
              className={`mt-1 block text-xs font-semibold leading-snug ${HINT_TONE_CLASS[stripeStatusHint.tone]}`}
              data-testid={stripeStatusHint.testId}
            >
              {stripeStatusHint.message}
            </span>
          ) : null}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-2">
        <span className="flex flex-col items-end gap-1">
          <span className="text-[15px] font-extrabold tabular-nums text-[var(--sf-forest)]">
            {formatCents(displayAmountCents)}
          </span>
          {stripeStatusBadge ? (
            <span data-testid={stripeStatusBadge.testId} className="inline-flex">
              <GChip tone={chargeToneToGChip(stripeStatusBadge.tone)}>
                {stripeStatusBadge.label}
              </GChip>
            </span>
          ) : null}
        </span>
        {onClick ? (
          <ChevronRight
            className="h-4 w-4 text-[var(--sf-ink)]/40 transition-transform duration-300 group-hover:translate-x-0.5"
            aria-hidden
          />
        ) : null}
      </span>
    </button>
  );
}
