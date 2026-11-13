"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import PaymentSchedulePreviewModal from "@/components/school-admin/tuition/PaymentSchedulePreviewModal";
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
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { G_FOCUS, gBtnOutlineSm, gBtnPopSm } from "@/components/school-parent/garden/ui";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";

function possessiveFirstName(fullName: string): string {
  const firstName = fullName.trim().split(/\s+/)[0] ?? fullName;
  if (!firstName) return "Your";
  return `${firstName}'s`;
}

type ParentTuitionPlanSelectorProps = {
  C: AdminThemeTokens;
  theme?: ParentThemeTokens;
  context: EnrollmentTuitionSelectionContext;
  studentName?: string;
  onComplete: () => void;
  readOnly?: boolean;
};

export default function ParentTuitionPlanSelector({
  C,
  theme,
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
      className="flex w-full scroll-mt-6 flex-col gap-6 rounded-[24px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white p-5 shadow-[0_3px_0_0_rgba(43,36,29,0.08)] sm:p-6"
      data-testid="parent-tuition-plan-selector"
    >
      <div>
        <p className="m-0 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--sf-soft)]">
          Pick a plan · preview it · confirm
        </p>
        <h2 className="sf-display m-0 mt-1 text-[1.4rem] leading-[1.05] text-[var(--sf-ink)]">
          {heading}
        </h2>
        <p className="m-0 mt-1.5 text-[13px] font-semibold text-[var(--sf-soft)]">
          Required before tuition charges are generated.
        </p>
        <p className="m-0 mt-0.5 text-[13px] font-semibold text-[var(--sf-soft)]">
          Annual tuition {formatCents(annualAmountCents)} · {ratePlan.name}
          {tier ? ` (${tier.label})` : ""} for the school year.
        </p>
      </div>

      <div
        role="radiogroup"
        aria-label="Payment plan options"
        className="grid gap-2.5 sm:grid-cols-2"
      >
        {availablePaymentPlans.map((plan) => {
          const amountCents = computeInstallmentAmountCents(
            annualAmountCents,
            plan.installmentCount,
          );
          const selected = selectedPlanId === plan.id;
          return (
            <button
              key={plan.id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-disabled={readOnly || undefined}
              onClick={() => {
                if (!readOnly) setSelectedPlanId(plan.id);
              }}
              className={`flex w-full items-start gap-3 rounded-[18px] border-2 p-4 text-left transition-all duration-200 ${G_FOCUS} ${
                selected
                  ? "border-[var(--sf-ink)] bg-[var(--sf-accent-wash)] shadow-[0_3px_0_0_var(--sf-ink)]"
                  : "border-[var(--sf-ink)]/15 bg-white hover:-translate-y-0.5 hover:border-[var(--sf-ink)]/40"
              }`}
            >
              <span
                aria-hidden="true"
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                  selected
                    ? "border-[var(--sf-ink)] bg-[var(--sf-clay)] text-white"
                    : "border-[var(--sf-ink)]/30 bg-white"
                }`}
              >
                {selected ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
              </span>
              <span className="min-w-0">
                <span className="block text-[15px] font-extrabold text-[var(--sf-ink)]">
                  {plan.name}
                </span>
                <span className="mt-0.5 block text-xs font-semibold text-[var(--sf-soft)]">
                  {paymentScheduleCadence(plan.installmentCount, schoolYearMonths)}
                </span>
                <span className="mt-1.5 block text-[13px] font-bold text-[var(--sf-ink)]/80">
                  {formatCents(amountCents)} per payment ·{" "}
                  {formatCents(amountCents * plan.installmentCount)}/yr
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {enrollmentFees.length > 0 ? (
        <div className="sf-paper rounded-[18px] p-4">
          <p className="m-0 mb-2 text-sm font-extrabold text-[var(--sf-ink)]">
            Due at enrollment
          </p>
          <ul className="m-0 flex list-none flex-col gap-2 p-0 text-sm font-semibold">
            {enrollmentFees.map((fee) => (
              <li key={fee.id} className="flex items-center justify-between gap-3">
                <span className="text-[var(--sf-ink)]/70">{fee.label}</span>
                <span className="tabular-nums text-[var(--sf-ink)]">
                  {formatCents(fee.amountCents)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {error ? (
        <p className="text-sm font-bold text-[var(--sf-clay-deep)]" role="alert">
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
          className={gBtnOutlineSm}
        >
          See schedule preview
          {readOnly ? " (preview)" : ""}
        </button>

        <button
          type="button"
          onClick={() => void handleConfirm()}
          disabled={readOnly || saving}
          aria-busy={saving || undefined}
          className={gBtnPopSm}
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
        appearance={theme ? "parent-garden" : "default"}
        theme={theme}
        onClose={() => setShowPreview(false)}
      />
    </div>
  );
}
