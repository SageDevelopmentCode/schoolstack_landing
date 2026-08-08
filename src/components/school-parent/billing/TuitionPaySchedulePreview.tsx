"use client";

import { ArrowRight, CircleAlert } from "lucide-react";
import { formatCents } from "@/lib/tuition/pricing";
import { formatInstallmentRange } from "@/lib/tuition/format-installment-range";
import type { InstallmentRedistributionPreview } from "@/lib/tuition/payment-settlement";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type TuitionPaySchedulePreviewProps = {
  C: AdminThemeTokens;
  paymentAmountCents: number;
  currentChargeRemainingCents: number;
  preview: InstallmentRedistributionPreview;
};

function AmountTile({
  C,
  label,
  amountCents,
  testId,
}: {
  C: AdminThemeTokens;
  label: string;
  amountCents: number;
  testId: string;
}) {
  return (
    <div
      className="min-w-0 flex-1 rounded-md border px-2 py-1"
      style={{
        borderColor: C.border,
        backgroundColor: C.surface,
      }}
      data-testid={testId}
    >
      <p
        className="text-[10px] font-medium uppercase tracking-wide"
        style={{ color: C.textTertiary }}
      >
        {label}
      </p>
      <p className="text-xs font-semibold tabular-nums" style={{ color: C.textPrimary }}>
        {formatCents(amountCents)}
      </p>
    </div>
  );
}

export default function TuitionPaySchedulePreview({
  C,
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
  const barFillColor = preview.fullyPaid ? C.success : C.accent;

  return (
    <div
      className="rounded-lg border p-2.5 text-sm"
      style={{
        borderColor: C.warningBorder,
        backgroundColor: C.warningBg,
      }}
      data-testid="tuition-pay-schedule-preview"
    >
      <div className="flex items-center gap-1.5">
        <CircleAlert
          className="h-4 w-4 shrink-0"
          style={{ color: C.warning }}
          aria-hidden
        />
        <p className="font-medium text-xs" style={{ color: C.textPrimary }}>
          Updated payment schedule
        </p>
      </div>

      <div className="mt-2 space-y-2">
        <div className="flex items-stretch gap-2">
          <AmountTile
            C={C}
            label="Before"
            amountCents={totalRemainingBeforeCents}
            testId="tuition-pay-schedule-before"
          />
          <div className="flex shrink-0 flex-col items-center justify-center gap-0.5 px-0.5">
            <ArrowRight className="h-3.5 w-3.5" style={{ color: C.warning }} aria-hidden />
            <p
              className="whitespace-nowrap text-[10px] tabular-nums"
              style={{ color: C.textTertiary }}
              data-testid="tuition-pay-schedule-payment"
            >
              − {formatCents(paymentAmountCents)}
            </p>
          </div>
          <AmountTile
            C={C}
            label="After"
            amountCents={totalRemainingAfterCents}
            testId="tuition-pay-schedule-after"
          />
        </div>

        <div
          className="h-1.5 w-full overflow-hidden rounded-full"
          style={{ backgroundColor: C.elevated }}
          role="img"
          aria-label={`Remaining balance drops from ${formatCents(totalRemainingBeforeCents)} to ${formatCents(totalRemainingAfterCents)}`}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              backgroundColor: barFillColor,
              width: `${remainingPercent}%`,
            }}
          />
        </div>

        {preview.fullyPaid ? (
          <p className="text-[11px]" style={{ color: C.textSecondary }}>
            No further payments this year
          </p>
        ) : preview.futureInstallmentCount > 0 ? (
          <p className="text-[11px] leading-snug" style={{ color: C.textSecondary }}>
            {formatCents(currentChargeRemainingCents)} installment ·{" "}
            {formatCents(surplusCents)} future · {preview.futureInstallmentCount} payment
            {preview.futureInstallmentCount === 1 ? "" : "s"} at approximately{" "}
            <span className="font-medium" style={{ color: C.textPrimary }}>
              {formatInstallmentRange(preview.projectedAmountsCents)}
            </span>{" "}
            each
          </p>
        ) : null}

        {preview.creditBalanceCents > 0 ? (
          <p className="text-[11px]" style={{ color: C.textSecondary }}>
            {formatCents(preview.creditBalanceCents)} stored as account credit
          </p>
        ) : null}
      </div>
    </div>
  );
}
