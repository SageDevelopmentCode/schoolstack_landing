"use client";

import { ArrowRight, CircleAlert } from "lucide-react";
import { formatCents } from "@/lib/tuition/pricing";
import { formatInstallmentRange } from "@/lib/tuition/format-installment-range";
import type { InstallmentRedistributionPreview } from "@/lib/tuition/payment-settlement";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

/* Renders inside the parent pay modal's Garden frame. */
type TuitionPaySchedulePreviewProps = {
  /** Kept for call-site compatibility; uses Garden tokens. */
  C?: AdminThemeTokens;
  paymentAmountCents: number;
  currentChargeRemainingCents: number;
  preview: InstallmentRedistributionPreview;
};

function AmountTile({
  label,
  amountCents,
  testId,
  after = false,
}: {
  label: string;
  amountCents: number;
  testId: string;
  after?: boolean;
}) {
  return (
    <div
      className={`min-w-0 flex-1 rounded-2xl border-[1.5px] px-3 py-2 ${
        after ? "border-[var(--sf-ink)] bg-white" : "border-[var(--sf-ink)]/12 bg-white/70"
      }`}
      data-testid={testId}
    >
      <p className="m-0 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--sf-soft)]">
        {label}
      </p>
      <p className="m-0 text-[15px] font-extrabold tabular-nums text-[var(--sf-ink)]">
        {formatCents(amountCents)}
      </p>
    </div>
  );
}

export default function TuitionPaySchedulePreview({
  paymentAmountCents,
  currentChargeRemainingCents,
  preview,
}: TuitionPaySchedulePreviewProps) {
  const surplusCents = Math.max(0, paymentAmountCents - currentChargeRemainingCents);
  if (surplusCents <= 0) return null;

  const futureTotalBeforeCents =
    preview.newTotalRemainingCents + surplusCents - preview.creditBalanceCents;
  const totalRemainingBeforeCents =
    currentChargeRemainingCents + futureTotalBeforeCents;
  const totalRemainingAfterCents = preview.newTotalRemainingCents;
  const remainingPercent =
    totalRemainingBeforeCents > 0
      ? Math.min(
          100,
          Math.max(0, (totalRemainingAfterCents / totalRemainingBeforeCents) * 100),
        )
      : 0;

  return (
    <div
      className="rounded-[18px] bg-[var(--sf-paper)] p-3.5 text-sm ring-[1.5px] ring-[var(--sf-ink)]/10"
      data-testid="tuition-pay-schedule-preview"
    >
      <div className="flex items-center gap-1.5">
        <CircleAlert className="h-4 w-4 shrink-0 text-[var(--sf-clay-deep)]" aria-hidden />
        <p className="m-0 text-xs font-extrabold text-[var(--sf-ink)]">Updated payment schedule</p>
      </div>

      <div className="mt-2.5 flex flex-col gap-2.5">
        <div className="flex items-stretch gap-2">
          <AmountTile
            label="Before"
            amountCents={totalRemainingBeforeCents}
            testId="tuition-pay-schedule-before"
          />
          <div className="flex shrink-0 flex-col items-center justify-center gap-0.5 px-0.5">
            <ArrowRight className="h-4 w-4 text-[var(--sf-clay-deep)]" aria-hidden />
            <p
              className="m-0 whitespace-nowrap text-[10px] font-bold tabular-nums text-[var(--sf-soft)]"
              data-testid="tuition-pay-schedule-payment"
            >
              − {formatCents(paymentAmountCents)}
            </p>
          </div>
          <AmountTile
            label="After"
            amountCents={totalRemainingAfterCents}
            testId="tuition-pay-schedule-after"
            after
          />
        </div>

        <div
          className="h-2.5 w-full overflow-hidden rounded-full border-[1.5px] border-[var(--sf-ink)] bg-white"
          role="img"
          aria-label={`Remaining balance drops from ${formatCents(totalRemainingBeforeCents)} to ${formatCents(totalRemainingAfterCents)}`}
        >
          <div
            className={`h-full transition-all duration-300 ${
              preview.fullyPaid ? "bg-[var(--sf-forest)]" : "bg-[var(--sf-clay)]"
            }`}
            style={{ width: `${remainingPercent}%` }}
          />
        </div>

        {preview.fullyPaid ? (
          <p className="m-0 text-xs font-semibold text-[var(--sf-ink)]/75">
            No further payments this year
          </p>
        ) : preview.futureInstallmentCount > 0 ? (
          <p className="m-0 text-xs font-semibold leading-snug text-[var(--sf-ink)]/75">
            {formatCents(currentChargeRemainingCents)} installment ·{" "}
            {formatCents(surplusCents)} future · {preview.futureInstallmentCount} payment
            {preview.futureInstallmentCount === 1 ? "" : "s"} at approximately{" "}
            <span className="font-extrabold text-[var(--sf-ink)]">
              {formatInstallmentRange(preview.projectedAmountsCents)}
            </span>{" "}
            each
          </p>
        ) : null}

        {preview.creditBalanceCents > 0 ? (
          <p className="m-0 text-xs font-semibold text-[var(--sf-ink)]/75">
            {formatCents(preview.creditBalanceCents)} stored as account credit
          </p>
        ) : null}
      </div>
    </div>
  );
}
