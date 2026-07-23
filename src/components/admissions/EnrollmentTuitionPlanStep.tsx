"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { PaymentSchedulePreviewContent } from "@/components/school-admin/tuition/PaymentSchedulePreviewPanel";
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

type EnrollmentTuitionPlanStepProps = {
  C: AdminThemeTokens;
  context: EnrollmentTuitionSelectionContext;
  onComplete: () => void;
};

export default function EnrollmentTuitionPlanStep({
  C,
  context,
  onComplete,
}: EnrollmentTuitionPlanStepProps) {
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
    assignment.paymentPlanId || ratePlan.paymentPlans.find((p) => p.isDefault)?.id || ratePlan.paymentPlans[0]?.id || "",
  );
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

  const handleConfirm = async () => {
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
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold" style={{ color: C.textPrimary }}>
          Choose your payment schedule
        </h2>
        <p className="text-sm mt-1" style={{ color: C.textSecondary }}>
          Select how you would like to pay {ratePlan.name} tuition
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
              onSelect={() => setSelectedPlanId(plan.id)}
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

      {selectedPreview ? (
        <PaymentSchedulePreviewContent
          C={C}
          preview={selectedPreview}
          annualAmountCents={annualAmountCents}
          effectiveStart={ratePlan.effectiveStart}
          effectiveEnd={ratePlan.effectiveEnd}
          schoolYearMonths={schoolYearMonths}
          embedded
        />
      ) : null}

      {error ? (
        <p className="text-sm" style={{ color: C.error }}>
          {error}
        </p>
      ) : null}

      <button
        type="button"
        onClick={() => void handleConfirm()}
        disabled={saving}
        style={getAdminButtonStyle(C, "primary")}
        className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium self-start"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        Confirm payment schedule
      </button>
    </div>
  );
}
