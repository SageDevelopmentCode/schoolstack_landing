"use client";

import { formatDueDateLabel } from "@/components/school-admin/tuition/PaymentSchedulePreviewPanel";
import {
  formatCents,
  tuitionInputToAnnualCents,
  type TuitionInputMode,
} from "@/lib/tuition/pricing";
import {
  buildPaymentOptionPreviews,
  paymentScheduleCadence,
  schoolYearMonthSpan,
  type WizardFeeInput,
  type WizardTierInput,
} from "@/lib/tuition/setup-wizard";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type TuitionReviewStepProps = {
  C: AdminThemeTokens;
  programName: string;
  planName: string;
  effectiveStart: string | null;
  effectiveEnd: string | null;
  tuitionInputMode: TuitionInputMode;
  tiers: WizardTierInput[];
  annualAmountCents: number;
  paymentCounts: number[];
  defaultPaymentCount: number | null;
  fees: WizardFeeInput[];
  onGoToStep: (stepIndex: number) => void;
};

function formatTierDisplayAmount(
  annualCents: number,
  mode: TuitionInputMode,
): string {
  if (mode === "monthly") {
    return `${formatCents(Math.round(annualCents / 12))}/mo`;
  }
  return `${formatCents(annualCents)}/yr`;
}

function formatSchoolYearRange(
  effectiveStart: string | null,
  effectiveEnd: string | null,
): string | null {
  if (!effectiveStart && !effectiveEnd) return null;
  if (effectiveStart && effectiveEnd) {
    return `${formatDueDateLabel(effectiveStart)} – ${formatDueDateLabel(effectiveEnd)}`;
  }
  if (effectiveStart) return `Starts ${formatDueDateLabel(effectiveStart)}`;
  return `Ends ${formatDueDateLabel(effectiveEnd!)}`;
}

function DefaultBadge({ C }: { C: AdminThemeTokens }) {
  return (
    <span
      className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0"
      style={{ backgroundColor: C.accentLight, color: C.accent }}
    >
      Default
    </span>
  );
}

function ReviewBlock({
  C,
  title,
  stepIndex,
  onGoToStep,
  children,
}: {
  C: AdminThemeTokens;
  title: string;
  stepIndex: number;
  onGoToStep: (stepIndex: number) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
          {title}
        </p>
        <button
          type="button"
          onClick={() => onGoToStep(stepIndex)}
          className="text-sm font-medium shrink-0"
          style={{ color: C.accent }}
        >
          Edit
        </button>
      </div>
      <div
        className="rounded-lg p-4 text-sm"
        style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
      >
        {children}
      </div>
    </div>
  );
}

export default function TuitionReviewStep({
  C,
  programName,
  planName,
  effectiveStart,
  effectiveEnd,
  tuitionInputMode,
  tiers,
  annualAmountCents,
  paymentCounts,
  defaultPaymentCount,
  fees,
  onGoToStep,
}: TuitionReviewStepProps) {
  const schoolYearMonths = schoolYearMonthSpan(effectiveStart, effectiveEnd);
  const schoolYearRange = formatSchoolYearRange(effectiveStart, effectiveEnd);
  const resolvedDefaultCount = defaultPaymentCount ?? paymentCounts[0] ?? null;
  const paymentPreviews = buildPaymentOptionPreviews(annualAmountCents, paymentCounts);
  const activeFees = fees.filter((fee) => fee.label.trim() && fee.amountCents > 0);
  const showTierDefaultBadge = tiers.length > 1;

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm" style={{ color: C.textSecondary }}>
        Review the details below. This is what families will see when they enroll
        and choose a payment schedule.
      </p>

      <ReviewBlock
        C={C}
        title="Program & schedule"
        stepIndex={0}
        onGoToStep={onGoToStep}
      >
        <div className="flex flex-col gap-2">
          <p className="font-semibold" style={{ color: C.textPrimary }}>
            {planName.trim() || "—"}
          </p>
          <p style={{ color: C.textSecondary }}>
            Program: {programName || "—"}
          </p>
          <p className="text-xs" style={{ color: C.textTertiary }}>
            {schoolYearRange ?? "School year dates not set"}
          </p>
        </div>
      </ReviewBlock>

      <ReviewBlock
        C={C}
        title="Tuition rates"
        stepIndex={1}
        onGoToStep={onGoToStep}
      >
        <ul className="flex flex-col gap-3">
          {tiers.map((tier, index) => {
            const annualCents = tuitionInputToAnnualCents(
              Number(tier.amount),
              tuitionInputMode,
            );
            return (
              <li
                key={index}
                className="flex items-center justify-between gap-3"
              >
                <span style={{ color: C.textPrimary }}>
                  {tier.label || "Unnamed rate"}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="tabular-nums" style={{ color: C.textSecondary }}>
                    {formatTierDisplayAmount(annualCents, tuitionInputMode)}
                  </span>
                  {showTierDefaultBadge && tier.isDefault ? (
                    <DefaultBadge C={C} />
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </ReviewBlock>

      <ReviewBlock
        C={C}
        title="Payment schedules"
        stepIndex={2}
        onGoToStep={onGoToStep}
      >
        <ul className="flex flex-col gap-4">
          {paymentPreviews.map((preview) => {
            const isDefault = preview.count === resolvedDefaultCount;
            const cadence = paymentScheduleCadence(preview.count, schoolYearMonths);
            return (
              <li key={preview.count} className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium" style={{ color: C.textPrimary }}>
                    {preview.label}
                  </span>
                  {isDefault ? <DefaultBadge C={C} /> : null}
                </div>
                <p className="text-xs" style={{ color: C.textTertiary }}>
                  {cadence} · {formatCents(preview.amountCents)} per payment
                </p>
              </li>
            );
          })}
        </ul>
      </ReviewBlock>

      <ReviewBlock
        C={C}
        title="Additional fees"
        stepIndex={3}
        onGoToStep={onGoToStep}
      >
        {activeFees.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {activeFees.map((fee, index) => (
              <li
                key={fee.code ?? `${fee.label}-${index}`}
                className="flex items-center justify-between gap-3"
              >
                <span style={{ color: C.textPrimary }}>{fee.label}</span>
                <span className="tabular-nums shrink-0" style={{ color: C.textSecondary }}>
                  {formatCents(fee.amountCents)} at enrollment
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: C.textTertiary }}>No additional fees</p>
        )}
      </ReviewBlock>
    </div>
  );
}
