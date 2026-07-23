"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { BuilderSectionIntro } from "@/components/school-admin/admissions/builder-question-card";
import TuitionFeesStep from "@/components/school-admin/tuition/TuitionFeesStep";
import TuitionPaymentOptionsStep from "@/components/school-admin/tuition/TuitionPaymentOptionsStep";
import TuitionReviewStep from "@/components/school-admin/tuition/TuitionReviewStep";
import TuitionTiersStep from "@/components/school-admin/tuition/TuitionTiersStep";
import SchoolAdminSelect from "@/components/school-admin/ui/SchoolAdminSelect";
import SchoolAdminDatePicker, {
  schoolAdminDateRangeBounds,
} from "@/components/school-admin/ui/SchoolAdminDatePicker";
import { listProgramsDetailed, type Program } from "@/lib/admissions/programs";
import type { TuitionInputMode } from "@/lib/tuition/pricing";
import {
  createRatePlanFromWizard,
  DEFAULT_PAYMENT_COUNT,
  DEFAULT_PAYMENT_COUNTS,
  filterAllowedPaymentCounts,
  suggestPlanNameFromProgram,
  validateWizardFees,
  validateWizardTiers,
  wizardStateFromRatePlan,
  wizardTiersToAnnualCents,
  type WizardFeeInput,
  type WizardTierInput,
} from "@/lib/tuition/setup-wizard";
import { getRatePlanWithDetails } from "@/lib/tuition/rate-plans";
import type { RatePlanWithDetails } from "@/lib/tuition/types";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { createClient } from "@/utils/supabase/client";

type TuitionSetupWizardProps = {
  organizationId: string;
  branding: OrganizationBranding;
  onComplete: () => void;
  editRatePlanId?: string | null;
  onCancelEdit?: () => void;
};

const STEPS = [
  { id: "program", title: "Program & schedule" },
  { id: "tiers", title: "Tuition rates" },
  { id: "payments", title: "Payment options" },
  { id: "fees", title: "Additional fees" },
  { id: "review", title: "Review & activate" },
] as const;

const DEFAULT_TIERS: WizardTierInput[] = [
  { label: "Standard", amount: "", isDefault: true },
];

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

export default function TuitionSetupWizard({
  organizationId,
  branding,
  onComplete,
  editRatePlanId,
  onCancelEdit,
}: TuitionSetupWizardProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const supabase = useMemo(() => createClient(), []);
  const isEditMode = Boolean(editRatePlanId);

  const [stepIndex, setStepIndex] = useState(0);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activated, setActivated] = useState(false);

  const [programId, setProgramId] = useState("");
  const [planName, setPlanName] = useState("");
  const [pricingMode, setPricingMode] = useState<"single" | "multiple">("single");
  const [tuitionInputMode, setTuitionInputMode] = useState<TuitionInputMode>("annual");
  const [tiers, setTiers] = useState<WizardTierInput[]>(DEFAULT_TIERS);
  const [effectiveStart, setEffectiveStart] = useState("");
  const [effectiveEnd, setEffectiveEnd] = useState("");
  const [paymentCounts, setPaymentCounts] = useState<number[]>([
    ...DEFAULT_PAYMENT_COUNTS,
  ]);
  const [defaultPaymentCount, setDefaultPaymentCount] = useState<number | null>(
    null,
  );
  const [fees, setFees] = useState<WizardFeeInput[]>([]);

  useEffect(() => {
    void (async () => {
      setLoadingPrograms(true);
      try {
        const rows = await listProgramsDetailed(supabase, organizationId);
        setPrograms(rows);
        if (!editRatePlanId && rows[0]) {
          setProgramId((current) => current || rows[0].id);
          setPlanName((current) => current || suggestPlanNameFromProgram(rows[0].name));
          setEffectiveStart((current) => current || rows[0].start_date || "");
          setEffectiveEnd((current) => current || rows[0].end_date || "");
        }
      } finally {
        setLoadingPrograms(false);
      }
    })();
  }, [organizationId, supabase, editRatePlanId]);

  useEffect(() => {
    if (!editRatePlanId) return;
    void (async () => {
      const plan = await getRatePlanWithDetails(supabase, editRatePlanId);
      if (!plan) return;
      applyPlanToState(plan);
    })();
  }, [editRatePlanId, supabase]);

  useEffect(() => {
    setPaymentCounts((prev) => {
      const filtered = filterAllowedPaymentCounts(
        prev,
        effectiveStart,
        effectiveEnd,
      );
      if (filtered.length === prev.length) return prev;

      setDefaultPaymentCount((current) => {
        if (current != null && filtered.includes(current)) return current;
        return filtered[0] ?? null;
      });
      return filtered;
    });
  }, [effectiveStart, effectiveEnd]);

  function applyPlanToState(plan: RatePlanWithDetails) {
    const state = wizardStateFromRatePlan(plan);
    setProgramId(plan.programId ?? "");
    setPlanName(state.name);
    const billingBasis = state.billingBasis ?? "annual";
    setTuitionInputMode(billingBasis);
    setTiers(state.tiers);
    setPricingMode(state.tiers.length > 1 ? "multiple" : "single");
    setEffectiveStart(state.effectiveStart ?? "");
    setEffectiveEnd(state.effectiveEnd ?? "");
    setPaymentCounts(state.paymentCounts);
    setDefaultPaymentCount(state.defaultPaymentCount ?? DEFAULT_PAYMENT_COUNT);
    setFees(state.fees ?? []);
  }

  const selectedProgram = programs.find((p) => p.id === programId) ?? null;
  const annualAmountCents = wizardTiersToAnnualCents(tiers, tuitionInputMode);
  const schoolYearDateBounds = useMemo(() => schoolAdminDateRangeBounds(), []);
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  const handleProgramChange = (nextProgramId: string) => {
    setProgramId(nextProgramId);
    const program = programs.find((p) => p.id === nextProgramId);
    if (!program) return;
    if (!planName || planName === suggestPlanNameFromProgram(selectedProgram?.name ?? "")) {
      setPlanName(suggestPlanNameFromProgram(program.name));
    }
    if (!effectiveStart) setEffectiveStart(program.start_date ?? "");
    if (!effectiveEnd) setEffectiveEnd(program.end_date ?? "");
  };

  const togglePaymentCount = (count: number) => {
    setPaymentCounts((prev) => {
      if (prev.includes(count)) {
        const next = prev.filter((value) => value !== count);
        if (defaultPaymentCount === count) {
          setDefaultPaymentCount(next[0] ?? null);
        }
        return next;
      }
      if (prev.length === 0) {
        setDefaultPaymentCount(count);
      }
      return [...prev, count].sort((a, b) => a - b);
    });
  };

  const addCustomPaymentCount = (count: number) => {
    setPaymentCounts((prev) => {
      if (prev.includes(count)) return prev;
      if (prev.length === 0) {
        setDefaultPaymentCount(count);
      }
      return [...prev, count].sort((a, b) => a - b);
    });
  };

  const removeCustomPaymentCount = (count: number) => {
    setPaymentCounts((prev) => {
      const next = prev.filter((value) => value !== count);
      if (defaultPaymentCount === count) {
        setDefaultPaymentCount(next[0] ?? null);
      }
      return next;
    });
  };

  const validateStep = (): string | null => {
    if (stepIndex === 0) {
      if (!programId) return "Select a program.";
      if (!planName.trim()) return "Enter a plan name.";
    }
    if (stepIndex === 1) {
      return validateWizardTiers(tiers);
    }
    if (stepIndex === 2 && paymentCounts.length === 0) {
      return "Select at least one payment option.";
    }
    if (stepIndex === 2 && defaultPaymentCount == null) {
      return "Choose a default payment schedule.";
    }
    if (stepIndex === 3) {
      return validateWizardFees(fees);
    }
    return null;
  };

  const goNext = () => {
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setStepIndex((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setError(null);
    setStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const goToStep = (index: number) => {
    setError(null);
    setStepIndex(index);
  };

  const handleActivate = async () => {
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await createRatePlanFromWizard(supabase, {
        organizationId,
        programId,
        name: planName.trim(),
        billingBasis: tuitionInputMode,
        tiers,
        effectiveStart: effectiveStart || null,
        effectiveEnd: effectiveEnd || null,
        paymentCounts,
        defaultPaymentCount:
          defaultPaymentCount ?? paymentCounts[0] ?? DEFAULT_PAYMENT_COUNT,
        fees,
        ratePlanId: editRatePlanId ?? undefined,
      });
      setActivated(true);
      window.setTimeout(() => {
        onComplete();
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save rate plan.");
    } finally {
      setSaving(false);
    }
  };

  if (loadingPrograms) {
    return (
      <div className="flex items-center justify-center min-h-[480px] p-6">
        <Loader2 className="w-5 h-5 animate-spin" style={{ color: C.textSecondary }} />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-120px)] p-6">
      <div
        className="w-full max-w-3xl rounded-2xl overflow-hidden"
        style={{
          backgroundColor: C.surface,
          border: `1px solid ${C.border}`,
          boxShadow: "0 12px 40px rgba(0,0,0,0.06)",
        }}
      >
        <div className="px-6 pt-6 pb-4" style={{ borderBottom: `1px solid ${C.border}` }}>
          <BuilderSectionIntro
            C={C}
            eyebrow={isEditMode ? "Edit rate plan" : "Get started"}
            title={
              isEditMode ? "Update your tuition rate plan" : "Set up your tuition rate plan"
            }
            subtitle={
              isEditMode
                ? "Adjust your program tuition, payment options, and fees."
                : "A quick guided setup so families know what to pay and how they can pay it."
            }
          />
          <div className="mt-4 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: C.bg }}>
            <div
              className="h-full transition-all duration-300"
              style={{ width: `${progress}%`, backgroundColor: C.accent }}
            />
          </div>
          <p className="text-xs mt-2" style={{ color: C.textTertiary }}>
            Step {stepIndex + 1} of {STEPS.length}: {STEPS[stepIndex].title}
          </p>
        </div>

        <div className="px-6 py-5 min-h-[360px]">
          {activated ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <CheckCircle2 className="w-12 h-12" style={{ color: C.success }} />
              <p className="text-lg font-semibold" style={{ color: C.textPrimary }}>
                {isEditMode ? "Rate plan updated" : "Tuition rate plan activated"}
              </p>
              <p className="text-sm" style={{ color: C.textSecondary }}>
                Families can now be assigned billing when students enroll.
              </p>
            </div>
          ) : stepIndex === 0 ? (
            <div className="grid gap-4">
              {!programs.length ? (
                <div
                  className="rounded-lg p-4 text-sm"
                  style={{ backgroundColor: C.warningBg, border: `1px solid ${C.warningBorder}` }}
                >
                  Create a program under Admissions → Programs before setting up tuition.
                </div>
              ) : null}
              <label className="flex flex-col gap-1 text-sm">
                <span style={{ color: C.textSecondary }}>Program</span>
                <SchoolAdminSelect
                  C={C}
                  value={programId}
                  onChange={handleProgramChange}
                  options={programs.map((program) => ({
                    value: program.id,
                    label: program.name,
                  }))}
                  placeholder="Select a program"
                  ariaLabel="Program"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span style={{ color: C.textSecondary }}>Rate plan name</span>
                <input
                  style={inputStyle(C)}
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="School Year 2026–27"
                />
              </label>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm">
                  <span style={{ color: C.textSecondary }}>School year starts</span>
                  <SchoolAdminDatePicker
                    id="tuition-effective-start"
                    C={C}
                    value={effectiveStart}
                    onChange={setEffectiveStart}
                    minDate={schoolYearDateBounds.minDate}
                    maxDate={
                      effectiveEnd || schoolYearDateBounds.maxDate
                    }
                    placeholder="Select start date"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span style={{ color: C.textSecondary }}>School year ends</span>
                  <SchoolAdminDatePicker
                    id="tuition-effective-end"
                    C={C}
                    value={effectiveEnd}
                    onChange={setEffectiveEnd}
                    minDate={effectiveStart || schoolYearDateBounds.minDate}
                    maxDate={schoolYearDateBounds.maxDate}
                    placeholder="Select end date"
                  />
                </label>
              </div>
            </div>
          ) : null}

          {!activated && stepIndex === 1 ? (
            <TuitionTiersStep
              C={C}
              pricingMode={pricingMode}
              onPricingModeChange={setPricingMode}
              inputMode={tuitionInputMode}
              onInputModeChange={setTuitionInputMode}
              tiers={tiers}
              onTiersChange={setTiers}
            />
          ) : null}

          {!activated && stepIndex === 2 ? (
            <TuitionPaymentOptionsStep
              C={C}
              annualAmountCents={annualAmountCents}
              billingBasis={tuitionInputMode}
              tiers={tiers}
              effectiveStart={effectiveStart || null}
              effectiveEnd={effectiveEnd || null}
              selectedCounts={paymentCounts}
              defaultCount={defaultPaymentCount}
              onToggleCount={togglePaymentCount}
              onSetDefault={setDefaultPaymentCount}
              onAddCustomCount={addCustomPaymentCount}
              onRemoveCustomCount={removeCustomPaymentCount}
            />
          ) : null}

          {!activated && stepIndex === 3 ? (
            <TuitionFeesStep C={C} fees={fees} onFeesChange={setFees} />
          ) : null}

          {!activated && stepIndex === 4 ? (
            <TuitionReviewStep
              C={C}
              programName={selectedProgram?.name ?? ""}
              planName={planName}
              effectiveStart={effectiveStart || null}
              effectiveEnd={effectiveEnd || null}
              tuitionInputMode={tuitionInputMode}
              tiers={tiers}
              annualAmountCents={annualAmountCents}
              paymentCounts={paymentCounts}
              defaultPaymentCount={defaultPaymentCount}
              fees={fees}
              onGoToStep={goToStep}
            />
          ) : null}

          {error ? (
            <p className="text-sm mt-4" style={{ color: C.error }}>
              {error}
            </p>
          ) : null}
        </div>

        {!activated ? (
          <div
            className="px-6 py-4 flex items-center justify-between gap-3"
            style={{ borderTop: `1px solid ${C.border}` }}
          >
            <div>
              {stepIndex > 0 ? (
                <button
                  type="button"
                  onClick={goBack}
                  className="text-sm px-4 py-2 rounded-md"
                  style={{ color: C.textSecondary }}
                >
                  Back
                </button>
              ) : isEditMode && onCancelEdit ? (
                <button
                  type="button"
                  onClick={onCancelEdit}
                  className="text-sm px-4 py-2 rounded-md"
                  style={{ color: C.textSecondary }}
                >
                  Cancel
                </button>
              ) : null}
            </div>
            <div className="flex gap-2">
              {stepIndex < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={goNext}
                  style={getAdminButtonStyle(C, "primary")}
                  className="px-4 py-2 text-sm font-medium"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void handleActivate()}
                  disabled={saving}
                  style={getAdminButtonStyle(C, "primary")}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {isEditMode ? "Save changes" : "Activate rate plan"}
                </button>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
