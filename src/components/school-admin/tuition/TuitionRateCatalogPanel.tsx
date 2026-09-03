"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Loader2, Pencil, Plus, Save, Trash2 } from "lucide-react";
import PaymentSchedulePreviewModal from "@/components/school-admin/tuition/PaymentSchedulePreviewModal";
import {
  tabPanelTransition,
  tabPanelVariants,
} from "@/lib/school-admin/admin-modal-motion";
import TuitionSubTabBar from "@/components/school-admin/tuition/TuitionSubTabBar";
import {
  DEFAULT_TUITION_RATE_CATALOG_TAB,
  TUITION_RATE_CATALOG_TABS,
  type TuitionRateCatalogTabId,
} from "@/components/school-admin/tuition/tuition-rate-catalog-tabs";
import {
  AddScheduleCard,
  AdminScheduleCard,
  ScheduleCardShell,
} from "@/components/school-admin/tuition/TuitionPaymentScheduleCards";
import TuitionSetupWizardModal from "@/components/school-admin/tuition/TuitionSetupWizardModal";
import {
  TUITION_WIZARD_STEP_FEES,
  TUITION_WIZARD_STEP_PROGRAM,
  TUITION_WIZARD_STEP_TIERS,
} from "@/components/school-admin/tuition/TuitionSetupWizard";
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
  isSuggestedPaymentCount,
  MAX_PAYMENT_INSTALLMENT_COUNT,
  maxInstallmentsForSchoolYear,
  paymentScheduleCadence,
  paymentScheduleLabel,
  schoolYearMonthSpan,
  SUGGESTED_PAYMENT_SCHEDULES,
  validateCustomPaymentCount,
} from "@/lib/tuition/setup-wizard";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { parentThemeToAdminCompat } from "@/lib/organization-settings/parent-theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
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

type WizardLaunch = {
  planId: string;
  initialStepIndex: number;
};

function inputStyle(theme: ParentThemeTokens): React.CSSProperties {
  return {
    backgroundColor: theme.white,
    border: "1px solid #DCE4DC",
    color: theme.ink,
    borderRadius: "10px",
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

function savedPaymentOptionsFromPlan(plan: RatePlanWithDetails) {
  const counts = plan.paymentPlans.length
    ? plan.paymentPlans.map((p) => p.installmentCount)
    : [DEFAULT_PAYMENT_COUNT];
  const allowedCounts = filterAllowedPaymentCounts(
    counts,
    plan.effectiveStart,
    plan.effectiveEnd,
  )
    .slice()
    .sort((a, b) => a - b);
  const defaultPlan =
    plan.paymentPlans.find((p) => p.isDefault) ?? plan.paymentPlans[0];
  const defaultCount = defaultPlan?.installmentCount ?? DEFAULT_PAYMENT_COUNT;
  const resolvedDefault = allowedCounts.includes(defaultCount)
    ? defaultCount
    : (allowedCounts[0] ?? DEFAULT_PAYMENT_COUNT);
  return { counts: allowedCounts, defaultPaymentCount: resolvedDefault };
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
  void branding;
  const { theme } = useSchoolAdminStoryTheme();
  const C = useMemo(() => parentThemeToAdminCompat(theme), [theme]);
  const supabase = useMemo(() => createClient(), []);
  const reducedMotion = useReducedMotion() ?? false;
  const selectedPlanIdRef = useRef<string | null>(selectedPlanId);

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
  const [addCardExpanded, setAddCardExpanded] = useState(false);
  const [customPaymentError, setCustomPaymentError] = useState<string | null>(null);
  const [savingPlan, setSavingPlan] = useState(false);
  const [wizardLaunch, setWizardLaunch] = useState<WizardLaunch | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCatalogTab, setActiveCatalogTab] = useState<TuitionRateCatalogTabId>(
    DEFAULT_TUITION_RATE_CATALOG_TAB,
  );

  const activePlan = localPlan ?? selectedPlan;

  function openSetupWizard(stepIndex: number) {
    if (!activePlan) return;
    setWizardLaunch({ planId: activePlan.id, initialStepIndex: stepIndex });
  }

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

  const customOnlyCounts = useMemo(
    () =>
      paymentCounts
        .filter((count) => !isSuggestedPaymentCount(count))
        .sort((a, b) => a - b),
    [paymentCounts],
  );

  const customInputMax =
    maxInstallments != null
      ? Math.min(maxInstallments, MAX_PAYMENT_INSTALLMENT_COUNT)
      : MAX_PAYMENT_INSTALLMENT_COUNT;

  const showDefaultControls = paymentCounts.length > 1;

  const selectedPreviews = buildPaymentOptionPreviews(
    annualAmountCents,
    paymentCounts,
  );

  const isPaymentOptionsDirty = useMemo(() => {
    if (!selectedPlan) return false;
    const saved = savedPaymentOptionsFromPlan(selectedPlan);
    const currentCounts = [...paymentCounts].sort((a, b) => a - b);
    if (currentCounts.length !== saved.counts.length) return true;
    if (currentCounts.some((count, index) => count !== saved.counts[index])) {
      return true;
    }
    return defaultPaymentCount !== saved.defaultPaymentCount;
  }, [selectedPlan, paymentCounts, defaultPaymentCount]);

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
    queueMicrotask(() => {
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
    });
  }, [activePlan?.effectiveStart, activePlan?.effectiveEnd, activePlan?.id]);

  useEffect(() => {
    queueMicrotask(() => {
      syncLocalFromSelected(selectedPlan);
    });
  }, [selectedPlan?.id, selectedPlan?.updatedAt]);

  useEffect(() => {
    if (selectedPlanIdRef.current === selectedPlanId) return;
    selectedPlanIdRef.current = selectedPlanId;
    setActiveCatalogTab(DEFAULT_TUITION_RATE_CATALOG_TAB);
  }, [selectedPlanId]);

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
      setCustomPaymentError(validationError);
      return;
    }
    setPaymentCounts((prev) => [...prev, count].sort((a, b) => a - b));
    setCustomCount("");
    setCustomPaymentError(null);
    setAddCardExpanded(false);
  };

  const closeAddCard = () => {
    setAddCardExpanded(false);
    setCustomCount("");
    setCustomPaymentError(null);
  };

  const removeCustomCount = (count: number) => {
    setPaymentCounts((prev) => {
      const next = prev.filter((value) => value !== count);
      if (defaultPaymentCount === count) {
        setDefaultPaymentCount(next[0] ?? DEFAULT_PAYMENT_COUNT);
      }
      return next;
    });
  };

  const handleSavePlan = async () => {
    if (!activePlan || !isPaymentOptionsDirty) return;
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

  if (!catalogRatePlans.length) {
    return (
      <AdminCard theme={theme} padding="canvas" className="text-center">
        <p className="text-lg font-semibold font-heading" style={{ color: theme.ink }}>
          No rate plans yet
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm" style={{ color: theme.muted }}>
          Set up your first tuition rate plan to define annual tuition, payment
          schedules, and fees.
        </p>
        <AdminButton theme={theme} className="mt-4" onClick={onStartSetup}>
          Set up tuition rate plan
        </AdminButton>
      </AdminCard>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[280px_1fr]">
      <AdminCard theme={theme} padding="none" className="p-2">
        {catalogRatePlans.map((plan) => (
          <button
            key={plan.id}
            type="button"
            onClick={() => onSelectPlan(plan.id)}
            className="mb-[3px] w-full rounded-[11px] border px-[11px] py-[11px] text-left text-sm transition-colors"
            style={
              selectedPlanId === plan.id
                ? {
                    backgroundColor: "#EDF5EE",
                    borderColor: "#CCE0CF",
                    color: theme.primary,
                  }
                : {
                    backgroundColor: "transparent",
                    borderColor: "transparent",
                    color: theme.ink,
                  }
            }
          >
            <span className="block font-bold">{plan.name}</span>
            <span className="text-[10px]" style={{ color: theme.muted }}>
              {plan.programName ?? "No program"} · {planTierRangeLabel(plan)}
            </span>
          </button>
        ))}
      </AdminCard>

      {activePlan ? (
        <AdminCard theme={theme} padding="canvas" className="flex flex-col gap-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide" style={{ color: C.textTertiary }}>
                {activePlan.programName ?? "Program"}
              </p>
              <h3 className="text-base font-semibold" style={{ color: C.textPrimary }}>
                {activePlan.name}
              </h3>
            </div>
            <AdminButton
              theme={theme}
              variant="soft"
              size="compact"
              onClick={() => openSetupWizard(TUITION_WIZARD_STEP_PROGRAM)}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit setup
            </AdminButton>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span style={{ color: C.textSecondary }}>Plan name</span>
              <input
                style={inputStyle(theme)}
                value={activePlan.name}
                onChange={(e) =>
                  setLocalPlan((prev) =>
                    prev ? { ...prev, name: e.target.value } : prev,
                  )
                }
              />
            </label>
          </div>

          <TuitionSubTabBar
            theme={theme}
            tabs={TUITION_RATE_CATALOG_TABS}
            activeTab={activeCatalogTab}
            onTabChange={setActiveCatalogTab}
            ariaLabel="Rate plan sections"
            testIdPrefix="tuition-rate-catalog"
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={activeCatalogTab}
              variants={tabPanelVariants(reducedMotion)}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={tabPanelTransition(reducedMotion)}
            >
              {activeCatalogTab === "tuition_rates" ? (
                <div
                  className="flex flex-col gap-4"
                  id="tuition-rate-catalog-panel-tuition_rates"
                  role="tabpanel"
                  aria-labelledby="tuition-rate-catalog-tab-tuition_rates"
                  data-testid="tuition-rate-catalog-panel-tuition_rates"
                >
                  <div className="space-y-2">
                    {activePlan.tiers.length ? (
                      activePlan.tiers.map((tier) => (
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
                          <div className="flex items-center gap-2 shrink-0">
                            <span style={{ color: C.textSecondary }}>
                              {formatTierDisplayAmount(tier.amountCents, activePlan.billingBasis)}
                            </span>
                            <button
                              type="button"
                              onClick={() => openSetupWizard(TUITION_WIZARD_STEP_TIERS)}
                              className="p-1.5 rounded-md"
                              style={{ color: C.textTertiary }}
                              aria-label={`Edit ${tier.label} tuition rate`}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div
                        className="flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm"
                        style={{ border: `1px solid ${C.border}`, backgroundColor: C.bg }}
                      >
                        <span style={{ color: C.textPrimary }}>Standard</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span style={{ color: C.textSecondary }}>
                            {formatTierDisplayAmount(
                              activePlan.amountCents,
                              activePlan.billingBasis,
                            )}
                          </span>
                          <button
                            type="button"
                            onClick={() => openSetupWizard(TUITION_WIZARD_STEP_TIERS)}
                            className="p-1.5 rounded-md"
                            style={{ color: C.textTertiary }}
                            aria-label="Edit Standard tuition rate"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => openSetupWizard(TUITION_WIZARD_STEP_TIERS)}
                      className="flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-sm"
                      style={{
                        border: `1px dashed ${C.borderStrong}`,
                        color: C.textTertiary,
                        backgroundColor: C.surface,
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      Add tuition rate
                    </button>
                  </div>
                </div>
              ) : null}

              {activeCatalogTab === "payment_options" ? (
                <div
                  className="flex flex-col gap-4"
                  id="tuition-rate-catalog-panel-payment_options"
                  role="tabpanel"
                  aria-labelledby="tuition-rate-catalog-tab-payment_options"
                  data-testid="tuition-rate-catalog-panel-payment_options"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
                      Payment options
                    </p>
                    <AdminButton
                      theme={theme}
                      variant="soft"
                      size="compact"
                      className="shrink-0"
                      disabled={paymentCounts.length === 0}
                      onClick={() => setPreviewModalOpen(true)}
                    >
                      Preview schedules
                    </AdminButton>
                  </div>
                  {schoolYearMonths != null ? (
                    <p className="text-xs" style={{ color: C.textTertiary }}>
                      Based on your school year ({schoolYearMonths} months), installment
                      schedules are limited to {schoolYearMonths} payments or fewer.
                    </p>
                  ) : null}
                  <div className="grid gap-3 sm:grid-cols-2">
                    {availableSuggestedSchedules.map((schedule) => {
                      const preview = buildPaymentOptionPreviews(annualAmountCents, [
                        schedule.count,
                      ])[0];
                      const selected = paymentCounts.includes(schedule.count);
                      const isDefault = defaultPaymentCount === schedule.count;
                      return (
                        <ScheduleCardShell
                          key={schedule.count}
                          C={C}
                          selected={selected}
                        >
                          <AdminScheduleCard
                            C={C}
                            selected={selected}
                            label={schedule.label}
                            cadence={paymentScheduleCadence(schedule.count, schoolYearMonths)}
                            perPayment={preview ? formatCents(preview.amountCents) : "—"}
                            annualTotal={formatCents(annualAmountCents)}
                            onToggle={() => toggleCount(schedule.count)}
                            isDefault={selected && isDefault}
                            showDefaultControl={
                              selected && showDefaultControls && !isDefault
                            }
                            onSetDefault={() => setDefaultPaymentCount(schedule.count)}
                          />
                        </ScheduleCardShell>
                      );
                    })}

                    {customOnlyCounts.map((count) => {
                      const preview = buildPaymentOptionPreviews(annualAmountCents, [
                        count,
                      ])[0];
                      const selected = paymentCounts.includes(count);
                      const isDefault = defaultPaymentCount === count;
                      return (
                        <ScheduleCardShell key={count} C={C} selected={selected}>
                          <div className="flex items-center gap-2">
                            <AdminScheduleCard
                              C={C}
                              selected={selected}
                              label={paymentScheduleLabel(count)}
                              cadence={paymentScheduleCadence(count, schoolYearMonths)}
                              perPayment={preview ? formatCents(preview.amountCents) : "—"}
                              annualTotal={formatCents(annualAmountCents)}
                              onToggle={() => toggleCount(count)}
                              compact
                              isDefault={selected && isDefault}
                              showDefaultControl={
                                selected && showDefaultControls && !isDefault
                              }
                              onSetDefault={() => setDefaultPaymentCount(count)}
                            />
                            <button
                              type="button"
                              onClick={() => removeCustomCount(count)}
                              className="p-1.5 rounded-md shrink-0"
                              style={{ color: C.textTertiary }}
                              aria-label={`Remove ${count} payment schedule`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </ScheduleCardShell>
                      );
                    })}

                    <AddScheduleCard
                      C={C}
                      expanded={addCardExpanded}
                      customCount={customCount}
                      customInputMax={customInputMax}
                      maxInstallments={maxInstallments}
                      onExpand={() => setAddCardExpanded(true)}
                      onCollapse={closeAddCard}
                      onCustomCountChange={(value) => {
                        setCustomCount(value);
                        setCustomPaymentError(null);
                      }}
                      onAdd={addCustomCount}
                    />
                  </div>
                  {customPaymentError ? (
                    <p className="text-sm" style={{ color: C.error }}>
                      {customPaymentError}
                    </p>
                  ) : null}
                  <div>
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

                  {error ? (
                    <p className="text-sm" style={{ color: C.error }}>
                      {error}
                    </p>
                  ) : null}

                  <AdminButton
                    theme={theme}
                    className="self-start"
                    onClick={() => void handleSavePlan()}
                    disabled={savingPlan || saving || !isPaymentOptionsDirty}
                  >
                    {savingPlan ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save payment options
                  </AdminButton>
                </div>
              ) : null}

              {activeCatalogTab === "fees" ? (
                <div
                  className="flex flex-col gap-4"
                  id="tuition-rate-catalog-panel-fees"
                  role="tabpanel"
                  aria-labelledby="tuition-rate-catalog-tab-fees"
                  data-testid="tuition-rate-catalog-panel-fees"
                >
                  <div className="space-y-2">
                    {activePlan.feeComponents.map((fee) => (
                      <div
                        key={fee.id}
                        className="flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm"
                        style={{ border: `1px solid ${C.border}`, backgroundColor: C.bg }}
                      >
                        <span style={{ color: C.textSecondary }}>
                          {fee.label}: {formatCents(fee.amountCents)} ({fee.timing})
                        </span>
                        <button
                          type="button"
                          onClick={() => openSetupWizard(TUITION_WIZARD_STEP_FEES)}
                          className="p-1.5 rounded-md shrink-0"
                          style={{ color: C.textTertiary }}
                          aria-label={`Edit ${fee.label} fee`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => openSetupWizard(TUITION_WIZARD_STEP_FEES)}
                      className="flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-sm"
                      style={{
                        border: `1px dashed ${C.borderStrong}`,
                        color: C.textTertiary,
                        backgroundColor: C.surface,
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      Add fee
                    </button>
                  </div>
                </div>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </AdminCard>
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

      {wizardLaunch ? (
        <TuitionSetupWizardModal
          open
          organizationId={organizationId}
          branding={branding}
          editRatePlanId={wizardLaunch.planId}
          initialStepIndex={wizardLaunch.initialStepIndex}
          onClose={() => setWizardLaunch(null)}
          onComplete={() => {
            setWizardLaunch(null);
            onRefresh();
          }}
        />
      ) : null}
    </div>
  );
}
