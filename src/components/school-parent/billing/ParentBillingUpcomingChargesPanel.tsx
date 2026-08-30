"use client";

import ParentBillingChargeRow from "@/components/school-parent/billing/ParentBillingChargeRow";
import ParentBillingSidePanel from "@/components/school-parent/billing/ParentBillingSidePanel";
import { formatBillingDueDate } from "@/lib/tuition/due-date-display";
import { formatCents } from "@/lib/tuition/pricing";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { TuitionAdjustment, TuitionCharge } from "@/lib/tuition/types";

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
  readOnly = false,
  onClose,
  onPay,
}: ParentBillingUpcomingChargesPanelProps) {
  const scheduleCharges = sortChargesByDueDate(charges);

  const subtitle = (
    <>
      {studentName ? <p>{studentName}</p> : null}
      {totalRemainingCents > 0 ? (
        <p
          className="font-medium"
          style={{ color: theme.primary }}
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
      subtitle={studentName || totalRemainingCents > 0 ? subtitle : undefined}
      onClose={onClose}
      testId="parent-billing-upcoming-charges-panel"
      panelId="parent-billing-upcoming-charges-panel"
    >
      {scheduleCharges.length > 0 ? (
        <div className="flex flex-col gap-3">
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
              onPay={onPay}
              readOnly={readOnly}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm" style={{ color: theme.muted }}>
          No upcoming charges yet.
        </p>
      )}
    </ParentBillingSidePanel>
  );
}
