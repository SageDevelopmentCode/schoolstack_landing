"use client";

import ParentBillingChargeRow from "@/components/school-parent/billing/ParentBillingChargeRow";
import ParentBillingSidePanel from "@/components/school-parent/billing/ParentBillingSidePanel";
import { formatBillingDueDate } from "@/lib/tuition/due-date-display";
import { formatCents } from "@/lib/tuition/pricing";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { TuitionAdjustment, TuitionCharge } from "@/lib/tuition/types";
import type { PaymentRecord } from "@/lib/stripe/application-payments";

type ParentBillingUpcomingChargesPanelProps = {
  theme: ParentThemeTokens;
  C: AdminThemeTokens;
  open: boolean;
  charges: TuitionCharge[];
  studentName?: string | null;
  totalRemainingCents?: number;
  adjustmentsByAssignment: Map<string, TuitionAdjustment[]>;
  payingChargeId: string | null;
  highlightedChargeId?: string | null;
  autopayEnabled: boolean;
  pendingPaymentByChargeId?: Map<string, PaymentRecord>;
  readOnly?: boolean;
  onClose: () => void;
  onPay: (chargeId: string) => void;
};

function sortChargesByDueDate(charges: TuitionCharge[]): TuitionCharge[] {
  return [...charges].sort((a, b) => {
    const dueCompare = a.dueDate.localeCompare(b.dueDate);
    if (dueCompare !== 0) return dueCompare;
    return (a.installmentNumber ?? 0) - (b.installmentNumber ?? 0);
  });
}

export function formatUpcomingChargesSummary(charges: TuitionCharge[]): string {
  if (charges.length === 0) return "";
  const sorted = sortChargesByDueDate(charges);
  const countLabel = `${charges.length} upcoming`;
  const nextDue = sorted[0]?.dueDate;
  if (!nextDue) return countLabel;
  return `${countLabel} · next due ${formatBillingDueDate(nextDue)}`;
}

export default function ParentBillingUpcomingChargesPanel({
  theme,
  C,
  open,
  charges,
  studentName,
  totalRemainingCents = 0,
  adjustmentsByAssignment,
  payingChargeId,
  highlightedChargeId = null,
  autopayEnabled,
  pendingPaymentByChargeId = new Map(),
  readOnly = false,
  onClose,
  onPay,
}: ParentBillingUpcomingChargesPanelProps) {
  const scheduleCharges = sortChargesByDueDate(charges);

  const subtitle = (
    <>
      {studentName ? <p className="m-0">{studentName}</p> : null}
      {totalRemainingCents > 0 ? (
        <p
          className="m-0 mt-1 inline-flex rounded-full bg-[var(--sf-accent-wash)] px-2.5 py-0.5 text-xs font-extrabold text-[var(--sf-clay-deep)]"
          data-testid="parent-billing-upcoming-total-remaining"
        >
          Total remaining: {formatCents(totalRemainingCents)}
        </p>
      ) : null}
    </>
  );

  return (
    <ParentBillingSidePanel
      theme={theme}
      open={open}
      title="Payment schedule"
      kicker="Upcoming charges"
      subtitle={studentName || totalRemainingCents > 0 ? subtitle : undefined}
      onClose={onClose}
      testId="parent-billing-upcoming-charges-panel"
      panelId="parent-billing-upcoming-charges-panel"
    >
      {scheduleCharges.length > 0 ? (
        <div className="flex flex-col gap-2.5">
          {scheduleCharges.map((charge) => (
            <ParentBillingChargeRow
              key={charge.id}
              C={C}
              charge={charge}
              adjustmentsForAssignment={
                adjustmentsByAssignment.get(charge.assignmentId) ?? []
              }
              payingChargeId={payingChargeId}
              highlighted={highlightedChargeId === charge.id}
              autopayEnabled={autopayEnabled}
              pendingCheckoutPayment={
                pendingPaymentByChargeId.get(charge.id) ?? null
              }
              onPay={onPay}
              readOnly={readOnly}
            />
          ))}
        </div>
      ) : (
        <p className="m-0 text-[15px] font-semibold text-[var(--sf-soft)]">
          No upcoming charges yet.
        </p>
      )}
    </ParentBillingSidePanel>
  );
}
