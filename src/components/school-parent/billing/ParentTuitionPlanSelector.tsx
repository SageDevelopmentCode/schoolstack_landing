"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import PaymentSchedulePreviewModal from "@/components/school-admin/tuition/PaymentSchedulePreviewModal";
import { PaymentScheduleSelectionCard } from "@/components/school-admin/tuition/TuitionPaymentScheduleCards";
import {
  filterPaymentPlansForBillingStart,
  maxInstallmentsForBillingStart,
} from "@/lib/tuition/billing-start";
import { computeInstallmentAmountCents } from "@/lib/tuition/assignments";
import { formatCents } from "@/lib/tuition/pricing";
import type { EnrollmentTuitionSelectionContext } from "@/lib/tuition/enrollment-selection";
import {
  paymentScheduleCadence,
  schoolYearMonthSpan,
} from "@/lib/tuition/setup-wizard";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";

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
  const billingStart =
    assignment.effectiveStart ?? ratePlan.effectiveStart ?? null;
  const schoolYearMonths = schoolYearMonthSpan(
    billingStart ?? ratePlan.effectiveStart,
    ratePlan.effectiveEnd,
  );
  const availablePaymentPlans = filterPaymentPlansForBillingStart(
    ratePlan.paymentPlans,
    billingStart
      ? maxInstallmentsForBillingStart(
          ratePlan.effectiveStart,
          ratePlan.effectiveEnd,
          billingStart,
        )
      : null,
  );
  const enrollmentFees = ratePlan.feeComponents.filter(
    (fee) => fee.timing === "enrollment",
  );

  const [selectedPlanId, setSelectedPlanId] = useState(
    assignment.paymentPlanId ||
      availablePaymentPlans.find((p) => p.isDefault)?.id ||
      availablePaymentPlans[0]?.id ||
      "",
  );
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedPlan = availablePaymentPlans.find((plan) => plan.id === selectedPlanId);
  let selectedPreview: {
    count: number;
    label: string;
    amountCents: number;
    totalCents: number;
  } | null = null;
  if (selectedPlan) {
    const amountCents = computeInstallmentAmountCents(
      annualAmountCents,
      selectedPlan.installmentCount,
    );
    selectedPreview = {
      count: selectedPlan.installmentCount,
      label: selectedPlan.name,
      amountCents,
      totalCents: amountCents * selectedPlan.installmentCount,
    };
  }

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
    let response: Response | undefined;
    try {
      response = await fetch(
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
      void reportPortalOperationalError(
        "parent_portal",
        {
          organizationId: context.assignment.organizationId,
          operation: "billing.save_payment_plan",
          error: "",
        },
        err,
        response?.status,
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      id="parent-tuition-plan-selector"
      className="flex flex-col gap-6 w-full rounded-xl p-5"
      style={{
        backgroundColor: C.surface,
        border: `1px solid ${C.warningBorder}`,
      }}
      data-testid="parent-tuition-plan-selector"
    >
      <div>
        <h2 className="text-lg font-semibold" style={{ color: C.textPrimary }}>
          {heading}
        </h2>
        <p className="text-sm mt-1" style={{ color: C.textSecondary }}>
          Required before tuition charges are generated.
        </p>
        <p className="text-sm mt-1" style={{ color: C.textSecondary }}>
          Annual tuition {formatCents(annualAmountCents)} · {ratePlan.name}
          {tier ? ` (${tier.label})` : ""} for the school year.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {availablePaymentPlans.map((plan) => {
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

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            if (readOnly) return;
            setShowPreview(true);
          }}
          disabled={readOnly || !selectedPreview}
          data-testid="parent-schedule-preview-button"
          style={getAdminButtonStyle(C, "secondary")}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          See schedule preview
          {readOnly ? " (preview)" : ""}
        </button>

        <button
          type="button"
          onClick={() => void handleConfirm()}
          disabled={readOnly || saving}
          style={getAdminButtonStyle(C, "primary")}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Confirm payment schedule
          {readOnly ? " (preview)" : ""}
        </button>
      </div>

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
        effectiveStart={billingStart ?? ratePlan.effectiveStart}
        effectiveEnd={ratePlan.effectiveEnd}
        schoolYearMonths={schoolYearMonths}
        testId="parent-schedule-preview-modal"
        onClose={() => setShowPreview(false)}
      />
    </div>
  );
}
