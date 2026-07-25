"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Pencil, Plus, Save } from "lucide-react";
import PaymentSchedulePreviewModal from "@/components/school-admin/tuition/PaymentSchedulePreviewModal";
import TuitionSetupWizard from "@/components/school-admin/tuition/TuitionSetupWizard";
import {
  annualCentsFromTiers,
  formatCents,
  formatTierAmountRange,
} from "@/lib/tuition/pricing";
import {
  syncRatePlanPaymentOptions,
  updateRatePlan,
} from "@/lib/tuition/rate-plans";
import type { RatePlanWithDetails } from "@/lib/tuition/types";
import {
  buildPaymentOptionPreviews,
  DEFAULT_PAYMENT_COUNT,
  filterAllowedPaymentCounts,
  isPaymentCountAllowed,
  MAX_PAYMENT_INSTALLMENT_COUNT,
  maxInstallmentsForSchoolYear,
  paymentScheduleCadence,
  paymentScheduleLabel,
  schoolYearMonthSpan,
  SUGGESTED_PAYMENT_SCHEDULES,
  validateCustomPaymentCount,
} from "@/lib/tuition/setup-wizard";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { createClient } from "@/utils/supabase/client";

type TuitionRateCatalogPanelProps = {
  organizationId: string;
  branding: OrganizationBranding;
  ratePlans: RatePlanWithDetails[];
  selectedPlanId: string | null;
  onSelectPlan: (planId: string) => void;
  onRefresh: () => void;
  onStartSetup: () => void;
  saving?: boolean;
};

function inputStyle(C: ReturnType<typeof buildAdminThemeTokens>): React.CSSProperties {
  return {
    backgroundColor: C.input,
    border: `1px solid ${C.inputBorder}`,
    color: C.textPrimary,
    borderRadius: C.r.md,
    fontSize: "14px",
    padding: "10px 12px",
    width: "100%",
    boxSizing: "border-box",
    outline: "none",
  };
}

function planTierRangeLabel(plan: RatePlanWithDetails): string {
  const billingBasis = plan.billingBasis === "monthly" ? "monthly" : "annual";
  const tiers = plan.tiers.length
    ? plan.tiers
  : [{ amountCents: plan.amountCents, isDefault: true }];
  return (
    formatTierAmountRange(tiers, billingBasis) ??
    `${formatCents(plan.amountCents)}/yr`
  );
}

function formatTierDisplayAmount(
  amountCents: number,
  billingBasis: RatePlanWithDetails["billingBasis"],
): string {
  if (billingBasis === "monthly") {
    return `${formatCents(Math.round(amountCents / 12))}/mo`;
  }
  return `${formatCents(amountCents)}/yr`;
}

export default function TuitionRateCatalogPanel({
  organizationId,
  branding,
  ratePlans,
  selectedPlanId,
  onSelectPlan,
  onRefresh,
  onStartSetup,
  saving = false,
}: TuitionRateCatalogPanelProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const supabase = useMemo(() => createClient(), []);

  const catalogRatePlans = useMemo(
    () => ratePlans.filter((plan) => plan.status !== "draft"),
    [ratePlans],
  );

  const selectedPlan =
    catalogRatePlans.find((plan) => plan.id === selectedPlanId) ?? null;

  const [localPlan, setLocalPlan] = useState<RatePlanWithDetails | null>(null);
  const [paymentCounts, setPaymentCounts] = useState<number[]>([]);
  const [defaultPaymentCount, setDefaultPaymentCount] = useState(DEFAULT_PAYMENT_COUNT);
  const [customCount, setCustomCount] = useState("");
  const [savingPlan, setSavingPlan] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activePlan = localPlan ?? selectedPlan;
  const annualAmountCents = activePlan
    ? annualCentsFromTiers(
        activePlan.tiers.length
          ? activePlan.tiers
          : [{ amountCents: activePlan.amountCents, isDefault: true }],
      )
    : 0;

  const schoolYearMonths = schoolYearMonthSpan(
    activePlan?.effectiveStart,
    activePlan?.effectiveEnd,
  );
  const maxInstallments = maxInstallmentsForSchoolYear(
    activePlan?.effectiveStart,
    activePlan?.effectiveEnd,
  );

  const availableSuggestedSchedules = useMemo(
    () =>
      SUGGESTED_PAYMENT_SCHEDULES.filter((schedule) =>
        isPaymentCountAllowed(schedule.count, maxInstallments),
      ),
    [maxInstallments],
  );

  const selectedPreviews = buildPaymentOptionPreviews(
    annualAmountCents,
    paymentCounts,
  );

  const syncLocalFromSelected = (plan: RatePlanWithDetails | null) => {
    if (!plan) {
      setLocalPlan(null);
      return;
    }
    setLocalPlan(plan);
    const counts = plan.paymentPlans.length
      ? plan.paymentPlans.map((p) => p.installmentCount)
      : [DEFAULT_PAYMENT_COUNT];
    const allowedCounts = filterAllowedPaymentCounts(
      counts,
      plan.effectiveStart,
      plan.effectiveEnd,
    );
    setPaymentCounts(allowedCounts);
    const defaultPlan =
      plan.paymentPlans.find((p) => p.isDefault) ?? plan.paymentPlans[0];
    const defaultCount = defaultPlan?.installmentCount ?? DEFAULT_PAYMENT_COUNT;
    setDefaultPaymentCount(
      allowedCounts.includes(defaultCount)
        ? defaultCount
        : (allowedCounts[0] ?? DEFAULT_PAYMENT_COUNT),
    );
  };

  useEffect(() => {
    if (!activePlan) return;
    setPaymentCounts((prev) => {
      const filtered = filterAllowedPaymentCounts(
        prev,
        activePlan.effectiveStart,
        activePlan.effectiveEnd,
      );
      if (filtered.length === prev.length) return prev;
      setDefaultPaymentCount((current) =>
        filtered.includes(current) ? current : (filtered[0] ?? DEFAULT_PAYMENT_COUNT),
      );
      return filtered;
    });
  }, [activePlan?.effectiveStart, activePlan?.effectiveEnd, activePlan?.id]);

  useEffect(() => {
    syncLocalFromSelected(selectedPlan);
  }, [selectedPlan?.id, selectedPlan?.updatedAt]);

  const toggleCount = (count: number) => {
    setPaymentCounts((prev) => {
      if (prev.includes(count)) {
        const next = prev.filter((value) => value !== count);
        if (defaultPaymentCount === count) {
          setDefaultPaymentCount(next[0] ?? DEFAULT_PAYMENT_COUNT);
        }
        return next;
      }
      return [...prev, count].sort((a, b) => a - b);
    });
  };

  const addCustomCount = () => {
    const count = Number(customCount);
    const validationError = validateCustomPaymentCount(
      count,
      paymentCounts,
      maxInstallments,
    );
    if (validationError) {
      setError(validationError);
      return;
    }
    setPaymentCounts((prev) => [...prev, count].sort((a, b) => a - b));
    setCustomCount("");
    setError(null);
  };

  const handleSavePlan = async () => {
    if (!activePlan) return;
    if (annualAmountCents <= 0) {
      setError("Rate plan has no valid default tuition tier.");
      return;
    }
    setSavingPlan(true);
    setError(null);
    try {
      await updateRatePlan(supabase, activePlan.id, {
        name: activePlan.name,
        amountCents: annualAmountCents,
        billingBasis: activePlan.billingBasis,
        status: activePlan.status,
        effectiveStart: activePlan.effectiveStart,
        effectiveEnd: activePlan.effectiveEnd,
      });
      await syncRatePlanPaymentOptions(supabase, {
        organizationId,
        ratePlanId: activePlan.id,
        annualAmountCents,
        paymentCounts,
        defaultPaymentCount,
      });
      adminToast.success("Payment options saved");
      onRefresh();
    } catch (err) {
      const message = formatActionError(err, "Failed to save rate plan.");
      setError(message);
      adminToast.error(message);
    } finally {
      setSavingPlan(false);
    }
  };

  if (editingPlanId) {
    return (
      <TuitionSetupWizard
        organizationId={organizationId}
        branding={branding}
        editRatePlanId={editingPlanId}
        onCancelEdit={() => setEditingPlanId(null)}
        onComplete={() => {
          setEditingPlanId(null);
          onRefresh();
        }}
      />
    );
  }

  if (!catalogRatePlans.length) {
    return (
      <div
        className="rounded-xl p-10 text-center flex flex-col items-center gap-4"
        style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
      >
        <p className="text-lg font-semibold" style={{ color: C.textPrimary }}>
          No rate plans yet
        </p>
        <p className="text-sm max-w-md" style={{ color: C.textSecondary }}>
          Set up your first tuition rate plan to define annual tuition, payment
          schedules, and fees.
        </p>
        <button
          type="button"
          onClick={onStartSetup}
          style={getAdminButtonStyle(C, "primary")}
          className="px-4 py-2 text-sm font-medium"
        >
          Set up tuition rate plan
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
      <div
        className="rounded-lg p-3 flex flex-col gap-2"
        style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
      >
        {catalogRatePlans.map((plan) => (
          <button
            key={plan.id}
            type="button"
            onClick={() => onSelectPlan(plan.id)}
            className="text-left px-3 py-2 rounded-md text-sm"
            style={{
              backgroundColor:
                selectedPlanId === plan.id ? C.accentLight : "transparent",
              color: selectedPlanId === plan.id ? C.accent : C.textPrimary,
            }}
          >
            <span className="block font-medium">{plan.name}</span>
            <span className="text-xs" style={{ color: C.textTertiary }}>
              {plan.programName ?? "No program"} · {planTierRangeLabel(plan)}
            </span>
          </button>
        ))}
      </div>

      {activePlan ? (
        <div
          className="rounded-lg p-5 flex flex-col gap-5"
          style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
        >
          <div
            className="rounded-md px-4 py-3 text-sm"
            style={{ backgroundColor: C.bg, border: `1px solid ${C.border}`, color: C.textSecondary }}
          >
            <p className="font-medium" style={{ color: C.textPrimary }}>
              Editing rate plans
            </p>
            <p className="mt-1">
              Payment schedules can be updated inline below. For tuition tiers, fees,
              program dates, and full review, use <strong>Edit setup</strong> — that
              reopens the same wizard used during initial setup.
            </p>
          </div>

          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide" style={{ color: C.textTertiary }}>
                {activePlan.programName ?? "Program"}
              </p>
              <h3 className="text-base font-semibold" style={{ color: C.textPrimary }}>
                {activePlan.name}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setEditingPlanId(activePlan.id)}
              className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-md"
              style={{ backgroundColor: C.accentLight, color: C.accent }}
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit setup
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span style={{ color: C.textSecondary }}>Plan name</span>
              <input
                style={inputStyle(C)}
                value={activePlan.name}
                onChange={(e) =>
                  setLocalPlan((prev) =>
                    prev ? { ...prev, name: e.target.value } : prev,
                  )
                }
              />
            </label>
          </div>

          <div>
            <p className="text-sm font-medium mb-3" style={{ color: C.textPrimary }}>
              Tuition rates
            </p>
            {(activePlan.tiers.length ? activePlan.tiers : []).length ? (
              <div className="space-y-2">
                {activePlan.tiers.map((tier) => (
                  <div
                    key={tier.id}
                    className="flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm"
                    style={{ border: `1px solid ${C.border}`, backgroundColor: C.bg }}
                  >
                    <span style={{ color: C.textPrimary }}>
                      {tier.label}
                      {tier.isDefault ? (
                        <span
                          className="ml-2 text-xs px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: C.accentLight, color: C.accent }}
                        >
                          Default
                        </span>
                      ) : null}
                    </span>
                    <span style={{ color: C.textSecondary }}>
                      {formatTierDisplayAmount(tier.amountCents, activePlan.billingBasis)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm" style={{ color: C.textTertiary }}>
                {formatTierDisplayAmount(activePlan.amountCents, activePlan.billingBasis)}
              </p>
            )}
            <p className="text-xs mt-2" style={{ color: C.textTertiary }}>
              Use Edit setup to change tuition rates and tiers.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between gap-3 mb-3">
              <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
                Payment options
              </p>
              <button
                type="button"
                disabled={paymentCounts.length === 0}
                onClick={() => setPreviewModalOpen(true)}
                className="text-sm px-3 py-1.5 rounded-md font-medium shrink-0 disabled:opacity-50"
                style={getAdminButtonStyle(C, "secondary")}
              >
                Preview schedules
              </button>
            </div>
            {schoolYearMonths != null ? (
              <p className="text-xs mb-3" style={{ color: C.textTertiary }}>
                Based on your school year ({schoolYearMonths} months), installment
                schedules are limited to {schoolYearMonths} payments or fewer.
              </p>
            ) : null}
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                ...availableSuggestedSchedules,
                ...paymentCounts
                  .filter(
                    (count) =>
                      !availableSuggestedSchedules.some(
                        (schedule) => schedule.count === count,
                      ),
                  )
                  .map((count) => ({
                    count,
                    label: paymentScheduleLabel(count),
                    cadence: paymentScheduleCadence(count, schoolYearMonths),
                  })),
              ].map((schedule) => {
                const selected = paymentCounts.includes(schedule.count);
                const amountCents = Math.round(annualAmountCents / schedule.count);
                return (
                  <label
                    key={schedule.count}
                    className="flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm"
                    style={{
                      border: `1px solid ${selected ? C.accent : C.border}`,
                      backgroundColor: selected ? C.accentLight : C.bg,
                    }}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleCount(schedule.count)}
                      />
                      <span className="min-w-0">
                        <span
                          className="block font-medium"
                          style={{ color: C.textPrimary }}
                        >
                          {schedule.label}
                        </span>
                        <span className="block text-xs" style={{ color: C.textTertiary }}>
                          {schedule.cadence}
                        </span>
                      </span>
                    </span>
                    <span className="shrink-0" style={{ color: C.textSecondary }}>
                      {formatCents(amountCents)}
                    </span>
                  </label>
                );
              })}
            </div>
            <div className="flex items-center gap-2 mt-3">
              <input
                style={{ ...inputStyle(C), maxWidth: 120 }}
                type="number"
                min={1}
                max={
                  maxInstallments != null
                    ? Math.min(maxInstallments, MAX_PAYMENT_INSTALLMENT_COUNT)
                    : MAX_PAYMENT_INSTALLMENT_COUNT
                }
                placeholder="Custom"
                value={customCount}
                onChange={(e) => setCustomCount(e.target.value)}
              />
              <button
                type="button"
                onClick={addCustomCount}
                className="inline-flex items-center gap-1 text-sm px-3 py-2 rounded-md"
                style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}
              >
                <Plus className="w-3.5 h-3.5" />
                Add option
              </button>
            </div>
            <div className="mt-3">
              <p className="text-xs mb-2" style={{ color: C.textTertiary }}>
                Default payment option
              </p>
              <div className="flex flex-wrap gap-2">
                {paymentCounts.map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setDefaultPaymentCount(count)}
                    className="text-xs px-2 py-1 rounded"
                    style={{
                      backgroundColor:
                        defaultPaymentCount === count ? C.accent : C.bg,
                      color: defaultPaymentCount === count ? "#fff" : C.textSecondary,
                    }}
                  >
                    {paymentScheduleLabel(count)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2" style={{ color: C.textPrimary }}>
              Fee components
            </p>
            {activePlan.feeComponents.length ? (
              <div className="space-y-2">
                {activePlan.feeComponents.map((fee) => (
                  <p key={fee.id} className="text-sm" style={{ color: C.textSecondary }}>
                    {fee.label}: {formatCents(fee.amountCents)} ({fee.timing})
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-sm" style={{ color: C.textTertiary }}>
                No additional fees. Use Edit setup to add fees.
              </p>
            )}
          </div>

          {error ? (
            <p className="text-sm" style={{ color: C.error }}>
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => void handleSavePlan()}
            disabled={savingPlan || saving}
            style={getAdminButtonStyle(C, "primary")}
            className="self-start inline-flex items-center gap-2 px-4 py-2 text-sm font-medium"
          >
            {savingPlan ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save payment options
          </button>
        </div>
      ) : null}

      {activePlan && paymentCounts.length > 0 ? (
        <PaymentSchedulePreviewModal
          C={C}
          open={previewModalOpen}
          previews={selectedPreviews}
          defaultCount={defaultPaymentCount}
          annualAmountCents={annualAmountCents}
          effectiveStart={activePlan.effectiveStart}
          effectiveEnd={activePlan.effectiveEnd}
          schoolYearMonths={schoolYearMonths}
          onClose={() => setPreviewModalOpen(false)}
        />
      ) : null}
    </div>
  );
}
