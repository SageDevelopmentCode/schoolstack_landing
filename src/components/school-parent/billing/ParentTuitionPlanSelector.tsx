"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import PaymentSchedulePreviewModal from "@/components/school-admin/tuition/PaymentSchedulePreviewModal";
import { PaymentScheduleSelectionCard } from "@/components/school-admin/tuition/TuitionPaymentScheduleCards";
import { computeInstallmentAmountCents } from "@/lib/tuition/assignments";
import { formatCents } from "@/lib/tuition/pricing";
import type { EnrollmentTuitionSelectionContext } from "@/lib/tuition/enrollment-selection";
import {
  paymentScheduleCadence,
  schoolYearMonthSpan,
} from "@/lib/tuition/setup-wizard";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";

function possessiveFirstName(fullName: string): string {
  const firstName = fullName.trim().split(/\s+/)[0] ?? fullName;
  if (!firstName) return "Your";
  return `${firstName}'s`;
}

type ParentTuitionPlanSelectorProps = {
  C: AdminThemeTokens;
  context: EnrollmentTuitionSelectionContext;
  studentName?: string;
  onComplete: () => void;
  readOnly?: boolean;
};

export default function ParentTuitionPlanSelector({
  C,
  context,
  studentName,
  onComplete,
  readOnly = false,
}: ParentTuitionPlanSelectorProps) {
  const { assignment, ratePlan } = context;
  const tier =
    ratePlan.tiers.find((item) => item.id === assignment.rateTierId) ??
    ratePlan.tiers.find((item) => item.isDefault) ??
    ratePlan.tiers[0];
  const annualAmountCents = tier?.amountCents ?? ratePlan.amountCents;
  const schoolYearMonths = schoolYearMonthSpan(
    ratePlan.effectiveStart,
    ratePlan.effectiveEnd,
  );
  const enrollmentFees = ratePlan.feeComponents.filter(
    (fee) => fee.timing === "enrollment",
  );

  const [selectedPlanId, setSelectedPlanId] = useState(
    assignment.paymentPlanId ||
      ratePlan.paymentPlans.find((p) => p.isDefault)?.id ||
      ratePlan.paymentPlans[0]?.id ||
      "",
  );
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedPlan = ratePlan.paymentPlans.find((plan) => plan.id === selectedPlanId);

  const selectedPreview = useMemo(() => {
    if (!selectedPlan) return null;
    const amountCents = computeInstallmentAmountCents(
      annualAmountCents,
      selectedPlan.installmentCount,
    );
    return {
      count: selectedPlan.installmentCount,
      label: selectedPlan.name,
      amountCents,
      totalCents: amountCents * selectedPlan.installmentCount,
    };
  }, [annualAmountCents, selectedPlan]);

  const heading = studentName
    ? `${possessiveFirstName(studentName)} payment schedule`
    : "Your payment schedule";

  const handleConfirm = async () => {
    if (readOnly) return;
    if (!selectedPlanId) {
      setError("Select a payment schedule.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/tuition/enrollments/${assignment.enrollmentId}/payment-plan`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentPlanId: selectedPlanId }),
        },
      );
      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error ?? "Failed to save payment schedule.");
      }
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save payment schedule.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="flex flex-col gap-6 w-full rounded-xl p-5"
      style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
      data-testid="parent-tuition-plan-selector"
    >
      <div>
        <h2 className="text-lg font-semibold" style={{ color: C.textPrimary }}>
          {heading}
        </h2>
        <p className="text-sm mt-1" style={{ color: C.textSecondary }}>
          Annual tuition {formatCents(annualAmountCents)} · {ratePlan.name}
          {tier ? ` (${tier.label})` : ""} for the school year.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {ratePlan.paymentPlans.map((plan) => {
          const amountCents = computeInstallmentAmountCents(
            annualAmountCents,
            plan.installmentCount,
          );
          return (
            <PaymentScheduleSelectionCard
              key={plan.id}
              C={C}
              selected={selectedPlanId === plan.id}
              label={plan.name}
              cadence={paymentScheduleCadence(plan.installmentCount, schoolYearMonths)}
              perPayment={formatCents(amountCents)}
              annualTotal={formatCents(amountCents * plan.installmentCount)}
              onSelect={() => {
                if (!readOnly) setSelectedPlanId(plan.id);
              }}
            />
          );
        })}
      </div>

      {enrollmentFees.length > 0 ? (
        <div
          className="rounded-lg p-4"
          style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}
        >
          <p className="text-sm font-medium mb-2" style={{ color: C.textPrimary }}>
            Due at enrollment
          </p>
          <ul className="flex flex-col gap-2 text-sm">
            {enrollmentFees.map((fee) => (
              <li key={fee.id} className="flex items-center justify-between gap-3">
                <span style={{ color: C.textSecondary }}>{fee.label}</span>
                <span className="tabular-nums" style={{ color: C.textPrimary }}>
                  {formatCents(fee.amountCents)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {error ? (
        <p className="text-sm" style={{ color: C.error }}>
          {error}
        </p>
      ) : null}

      {!readOnly ? (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            disabled={!selectedPreview}
            data-testid="parent-schedule-preview-button"
            style={getAdminButtonStyle(C, "secondary")}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium"
          >
            See schedule preview
          </button>

          <button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={saving}
            style={getAdminButtonStyle(C, "primary")}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Confirm payment schedule
          </button>
        </div>
      ) : null}

      <PaymentSchedulePreviewModal
        C={C}
        open={showPreview}
        title={
          studentName
            ? `${possessiveFirstName(studentName)} schedule preview`
            : "Schedule preview"
        }
        previews={selectedPreview ? [selectedPreview] : []}
        defaultCount={selectedPreview?.count ?? 1}
        annualAmountCents={annualAmountCents}
        effectiveStart={ratePlan.effectiveStart}
        effectiveEnd={ratePlan.effectiveEnd}
        schoolYearMonths={schoolYearMonths}
        testId="parent-schedule-preview-modal"
        onClose={() => setShowPreview(false)}
      />
    </div>
  );
}
