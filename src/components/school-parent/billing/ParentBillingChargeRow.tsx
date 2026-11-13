"use client";

import { Tick } from "@/components/garden/ui";
import { chargeToneToGChip } from "@/components/school-parent/billing/garden/billing-garden-tones";
import { GChip, G_FOCUS } from "@/components/school-parent/garden/ui";
import {
  formatParentChargeAmountLabel,
  formatParentChargeDueLine,
  formatParentChargeStatusBadge,
} from "@/lib/tuition/charge-status-display";
import { buildChargeAdjustmentBreakdown, formatCents } from "@/lib/tuition/pricing";
import { chargeRemainingCents } from "@/lib/tuition/billing-splits";
import {
  PAY_AHEAD_REDUCTION_HINT,
  PAY_AHEAD_REDUCTION_LABEL,
} from "@/lib/tuition/tuition-pay-copy";
import { pendingCheckoutPaymentHint } from "@/lib/tuition/stripe-provider-status-display";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { PaymentRecord } from "@/lib/stripe/application-payments";
import type { TuitionAdjustment, TuitionCharge } from "@/lib/tuition/types";

type ParentBillingChargeRowProps = {
  /** Kept for call-site compatibility; the row uses Garden tokens. */
  C?: AdminThemeTokens;
  charge: TuitionCharge;
  adjustmentsForAssignment: TuitionAdjustment[];
  payingChargeId: string | null;
  highlighted?: boolean;
  autopayEnabled?: boolean;
  pendingCheckoutPayment?: PaymentRecord | null;
  onPay: (chargeId: string) => void;
  readOnly?: boolean;
};

const UNPAID_CHARGE_STATUSES = new Set(["scheduled", "sent", "overdue"]);

function formatBreakdownAmount(amountCents: number): string {
  if (amountCents < 0) {
    return `−${formatCents(Math.abs(amountCents))}`;
  }
  return formatCents(amountCents);
}

/** Timeline marker: tick when paid, peach dot when overdue, ring otherwise. */
function ChargeMarker({ charge, processing }: { charge: TuitionCharge; processing: boolean }) {
  if (charge.status === "paid") {
    return <Tick className="h-6 w-6" color="var(--sf-forest)" fill="var(--sf-mint)" />;
  }
  if (charge.status === "overdue") {
    return (
      <span
        aria-hidden="true"
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-[var(--sf-clay-deep)] bg-[var(--sf-peach)]"
      >
        <span className="h-2 w-2 rounded-full bg-[var(--sf-clay-deep)]" />
      </span>
    );
  }
  return (
    <span
      aria-hidden="true"
      className={`h-6 w-6 shrink-0 rounded-full border-2 bg-white ${
        processing ? "border-dashed border-[#24507a]" : "border-[var(--sf-ink)]/45"
      }`}
    />
  );
}

/** One installment / fee in the payment schedule (notebook row). */
export default function ParentBillingChargeRow({
  charge,
  adjustmentsForAssignment,
  payingChargeId,
  highlighted = false,
  autopayEnabled = false,
  pendingCheckoutPayment = null,
  onPay,
  readOnly = false,
}: ParentBillingChargeRowProps) {
  const breakdown = buildChargeAdjustmentBreakdown({
    baseAmountCents: charge.baseAmountCents,
    amountCents: charge.amountCents,
    adjustments: adjustmentsForAssignment,
  });

  const remainingCents = chargeRemainingCents(charge);
  const amountDisplay = formatParentChargeAmountLabel(charge);
  const showBreakdown =
    charge.chargeType !== "late_fee" && charge.baseAmountCents !== charge.amountCents;
  const totalLine = breakdown.find((line) => line.kind === "total");
  const hasPayAheadReduction = breakdown.some(
    (line) => line.label === PAY_AHEAD_REDUCTION_LABEL,
  );
  const statusBadge = formatParentChargeStatusBadge(charge, {
    pendingCheckoutPayment: Boolean(pendingCheckoutPayment),
  });
  const dueLine = formatParentChargeDueLine(charge);
  const showAutopayHint =
    autopayEnabled &&
    UNPAID_CHARGE_STATUSES.has(charge.status) &&
    remainingCents > 0 &&
    !pendingCheckoutPayment;
  const canPay =
    UNPAID_CHARGE_STATUSES.has(charge.status) &&
    remainingCents > 0 &&
    !pendingCheckoutPayment;
  const isPaying = payingChargeId === charge.id;

  return (
    <div
      data-testid="parent-billing-charge-row"
      data-charge-id={charge.id}
      className={`@container rounded-[16px] border-[1.5px] px-4 py-3.5 transition-[box-shadow,border-color,background-color] duration-300 ${
        highlighted
          ? "border-[var(--sf-clay)] bg-[var(--sf-accent-wash)] shadow-[0_0_0_4px_color-mix(in_srgb,var(--sf-clay)_18%,transparent)]"
          : "border-[var(--sf-ink)]/10 bg-white"
      }`}
    >
     <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-3 @3xl:grid-cols-[auto_1.2fr_0.9fr_0.7fr_auto] @3xl:items-center">
      <div className="row-span-3 pt-0.5 @3xl:row-span-1 @3xl:pt-0">
        <ChargeMarker charge={charge} processing={Boolean(pendingCheckoutPayment)} />
      </div>

      <div className="min-w-0">
        <p className="m-0 text-[15px] font-extrabold leading-snug text-[var(--sf-ink)]">
          {charge.label}
        </p>
        <p className="m-0 mt-0.5 text-[13px] font-semibold text-[var(--sf-soft)]">{dueLine}</p>
        {showAutopayHint ? (
          <p
            className="m-0 mt-1 text-xs font-semibold text-[var(--sf-ink)]/65"
            data-testid="parent-billing-charge-autopay-hint"
          >
            Autopay on due date
          </p>
        ) : null}
        {pendingCheckoutPayment ? (
          <p
            className="m-0 mt-1 text-xs font-semibold text-[#24507a]"
            data-testid="parent-billing-charge-processing-hint"
          >
            {pendingCheckoutPaymentHint(pendingCheckoutPayment) ??
              "Bank payment processing — usually 3–5 business days"}
          </p>
        ) : null}
      </div>

      <div className="col-start-2 min-w-0 text-xs leading-relaxed text-[var(--sf-ink)]/65 @3xl:col-start-auto">
        {showBreakdown ? (
          <div
            data-testid="parent-billing-charge-breakdown"
            className="rounded-xl bg-[var(--sf-paper)] px-3 py-2"
          >
            {breakdown
              .filter((line) => line.kind !== "total")
              .map((line, index) => (
                <div key={`${line.kind}-${line.label}-${index}`} className="tabular-nums">
                  {line.label} {formatBreakdownAmount(line.amountCents)}
                </div>
              ))}
            {hasPayAheadReduction ? (
              <p
                className="m-0 mt-1 text-[11px] leading-snug text-[var(--sf-soft)]"
                data-testid="parent-billing-charge-pay-ahead-hint"
              >
                {PAY_AHEAD_REDUCTION_HINT}
              </p>
            ) : null}
          </div>
        ) : (
          <span className="hidden text-[var(--sf-soft)] @3xl:inline" aria-hidden="true">
            —
          </span>
        )}
      </div>

      <div className="col-start-2 flex min-w-0 items-center gap-2 @3xl:col-start-auto @3xl:flex-col @3xl:items-start @3xl:gap-1">
        <p className="m-0 text-[15px] font-extrabold tabular-nums text-[var(--sf-ink)]">
          {showBreakdown && totalLine
            ? formatCents(totalLine.amountCents)
            : amountDisplay.text}
        </p>
        <span data-testid="parent-billing-charge-status-badge" className="inline-flex">
          <GChip tone={chargeToneToGChip(statusBadge.tone)}>{statusBadge.label}</GChip>
        </span>
      </div>

      <div className="col-span-2 flex w-full items-center justify-end @3xl:col-span-1 @3xl:w-auto">
        {canPay ? (
          <button
            type="button"
            onClick={() => {
              if (readOnly) return;
              onPay(charge.id);
            }}
            disabled={readOnly || isPaying}
            aria-busy={isPaying || undefined}
            aria-label={showAutopayHint ? "Pay early" : "Pay charge"}
            className={`inline-flex w-full items-center justify-center rounded-full border-[1.5px] border-[var(--sf-ink)]/25 bg-white px-4 py-2 text-[13px] font-extrabold text-[var(--sf-clay-deep)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--sf-clay)] hover:bg-[var(--sf-accent-wash)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto ${G_FOCUS}`}
          >
            {isPaying ? "…" : readOnly ? "Pay (preview)" : "Pay"}
          </button>
        ) : null}
      </div>
     </div>
    </div>
  );
}
