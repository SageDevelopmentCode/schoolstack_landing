import type { SupabaseClient } from "@supabase/supabase-js";
import {
  createFeeComponent,
  createRatePlan,
  updateRatePlan,
  upsertPaymentPlansForRatePlan,
} from "./rate-plans";
import { slugifyTierCode, upsertTiersForRatePlan } from "./rate-tiers";
import type { FeeTiming, RatePlanWithDetails, TuitionFeeComponent, TuitionRatePlan } from "./types";
import {
  annualCentsFromTiers,
  formatCents,
  tuitionInputToAnnualCents,
  type TuitionInputMode,
} from "./pricing";

export type PaymentScheduleDefinition = {
  count: number;
  label: string;
  cadence: string;
};

export const SUGGESTED_PAYMENT_SCHEDULES: PaymentScheduleDefinition[] = [
  { count: 1, label: "Pay in full", cadence: "One-time payment" },
  { count: 2, label: "2 payments", cadence: "Semester / half-year" },
  { count: 4, label: "4 payments", cadence: "Quarterly" },
  { count: 9, label: "9 payments", cadence: "Monthly (9-month year)" },
  { count: 10, label: "10 payments", cadence: "Monthly (10-month year)" },
  { count: 12, label: "12 payments", cadence: "Monthly (12-month year)" },
];

export const SUGGESTED_PAYMENT_COUNTS = SUGGESTED_PAYMENT_SCHEDULES.map(
  (schedule) => schedule.count,
);

/** Initial wizard selection — empty; admin opts in on step 3. */
export const DEFAULT_PAYMENT_COUNTS: number[] = [];
export const DEFAULT_PAYMENT_COUNT = 10;
export const MAX_PAYMENT_INSTALLMENT_COUNT = 24;

export type PaymentOptionPreview = {
  count: number;
  label: string;
  amountCents: number;
  totalCents: number;
};

export type PaymentScheduleSummary = {
  count: number;
  label: string;
  cadence: string;
  amountCents: number;
  totalCents: number;
  perPaymentLabel: string;
  annualLabel: string;
};

export type WizardFeeInput = {
  code?: string;
  label: string;
  amountCents: number;
  timing?: FeeTiming;
};

export type WizardTierInput = {
  code?: string;
  label: string;
  amount: string;
  isDefault: boolean;
};

export type WizardSetupInput = {
  organizationId: string;
  programId: string;
  name: string;
  billingBasis?: TuitionInputMode;
  tiers: WizardTierInput[];
  effectiveStart?: string | null;
  effectiveEnd?: string | null;
  paymentCounts: number[];
  defaultPaymentCount?: number;
  fees?: WizardFeeInput[];
  ratePlanId?: string;
};

export type TuitionWizardMetadata = {
  wizardStepIndex: number;
  pricingMode: "single" | "multiple";
};

export type WizardPersistedState = {
  programId: string;
  planName: string;
  pricingMode: "single" | "multiple";
  tuitionInputMode: TuitionInputMode;
  tiers: WizardTierInput[];
  effectiveStart: string;
  effectiveEnd: string;
  paymentCounts: number[];
  defaultPaymentCount: number | null;
  fees: WizardFeeInput[];
  stepIndex: number;
};

export type WizardDraftSaveInput = WizardSetupInput & {
  stepIndex: number;
  pricingMode: "single" | "multiple";
  strict?: boolean;
  /** Highest step index that passed validation before this save. */
  validatedThroughStep?: number;
};

const WIZARD_STEP_COUNT = 5;

export function buildWizardMetadata(
  stepIndex: number,
  pricingMode: "single" | "multiple",
): TuitionWizardMetadata {
  return {
    wizardStepIndex: Math.max(0, Math.min(stepIndex, WIZARD_STEP_COUNT - 1)),
    pricingMode,
  };
}

export function parseWizardMetadata(
  metadata: Record<string, unknown> | null | undefined,
): TuitionWizardMetadata {
  const wizardStepIndex =
    typeof metadata?.wizardStepIndex === "number" &&
    Number.isFinite(metadata.wizardStepIndex)
      ? Math.max(0, Math.min(Math.floor(metadata.wizardStepIndex), WIZARD_STEP_COUNT - 1))
      : 0;
  const pricingMode =
    metadata?.pricingMode === "multiple" ? "multiple" : "single";
  return { wizardStepIndex, pricingMode };
}

export function serializeWizardState(state: WizardPersistedState): string {
  const normalizedTiers = state.tiers.map((tier) => ({
    code: tier.code ?? "",
    label: tier.label,
    amount: tier.amount,
    isDefault: tier.isDefault,
  }));
  const normalizedFees = state.fees.map((fee) => ({
    code: fee.code ?? "",
    label: fee.label,
    amountCents: fee.amountCents,
    timing: fee.timing ?? "enrollment",
  }));

  return JSON.stringify({
    programId: state.programId,
    planName: state.planName,
    pricingMode: state.pricingMode,
    tuitionInputMode: state.tuitionInputMode,
    tiers: normalizedTiers,
    effectiveStart: state.effectiveStart,
    effectiveEnd: state.effectiveEnd,
    paymentCounts: [...state.paymentCounts].sort((a, b) => a - b),
    defaultPaymentCount: state.defaultPaymentCount,
    fees: normalizedFees,
    stepIndex: state.stepIndex,
  });
}

export function paymentOptionLabel(count: number): string {
  return paymentScheduleLabel(count);
}

export function paymentScheduleLabel(count: number): string {
  const suggested = SUGGESTED_PAYMENT_SCHEDULES.find(
    (schedule) => schedule.count === count,
  );
  return suggested?.label ?? `${count} payments`;
}

export function paymentScheduleCadence(
  count: number,
  schoolYearMonths?: number | null,
): string {
  if (
    schoolYearMonths != null &&
    count > 1 &&
    count === schoolYearMonths
  ) {
    return "Monthly (matches your school year)";
  }

  const suggested = SUGGESTED_PAYMENT_SCHEDULES.find(
    (schedule) => schedule.count === count,
  );
  if (suggested) return suggested.cadence;
  if (count === 1) return "One-time payment";
  return `${count} equal installments`;
}

function parseIsoDate(iso: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

/** Inclusive calendar months between school year start and end. */
export function schoolYearMonthSpan(
  effectiveStart?: string | null,
  effectiveEnd?: string | null,
): number | null {
  if (!effectiveStart || !effectiveEnd) return null;
  const start = parseIsoDate(effectiveStart);
  const end = parseIsoDate(effectiveEnd);
  if (!start || !end || end < start) return null;

  const startYear = start.getUTCFullYear();
  const startMonth = start.getUTCMonth();
  const endYear = end.getUTCFullYear();
  const endMonth = end.getUTCMonth();

  return (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
}

export function maxInstallmentsForSchoolYear(
  effectiveStart?: string | null,
  effectiveEnd?: string | null,
): number | null {
  return schoolYearMonthSpan(effectiveStart, effectiveEnd);
}

export function isPaymentCountAllowed(
  count: number,
  maxInstallments: number | null,
): boolean {
  if (count === 1) return true;
  if (maxInstallments == null) {
    return count >= 1 && count <= MAX_PAYMENT_INSTALLMENT_COUNT;
  }
  return count >= 1 && count <= maxInstallments;
}

export function filterAllowedPaymentCounts(
  counts: number[],
  effectiveStart?: string | null,
  effectiveEnd?: string | null,
): number[] {
  const maxInstallments = maxInstallmentsForSchoolYear(effectiveStart, effectiveEnd);
  return counts.filter((count) => isPaymentCountAllowed(count, maxInstallments));
}

export function isSuggestedPaymentCount(count: number): boolean {
  return SUGGESTED_PAYMENT_SCHEDULES.some((schedule) => schedule.count === count);
}

export function validateCustomPaymentCount(
  count: number,
  existingCounts: number[],
  maxInstallments?: number | null,
): string | null {
  if (!Number.isFinite(count) || !Number.isInteger(count) || count < 1) {
    return "Enter a whole number of payments (1 or more).";
  }
  if (count > MAX_PAYMENT_INSTALLMENT_COUNT) {
    return `Payment schedules can have at most ${MAX_PAYMENT_INSTALLMENT_COUNT} installments.`;
  }
  if (
    maxInstallments != null &&
    count > 1 &&
    count > maxInstallments
  ) {
    return `Your school year is ${maxInstallments} months — schedules can have at most ${maxInstallments} installments.`;
  }
  if (existingCounts.includes(count)) {
    return "That payment schedule is already enabled.";
  }
  return null;
}

export function formatPaymentSchedulePreview(
  preview: PaymentOptionPreview,
  annualCents: number,
  schoolYearMonths?: number | null,
): PaymentScheduleSummary {
  return {
    count: preview.count,
    label: paymentScheduleLabel(preview.count),
    cadence: paymentScheduleCadence(preview.count, schoolYearMonths),
    amountCents: preview.amountCents,
    totalCents: preview.totalCents,
    perPaymentLabel: formatCents(preview.amountCents),
    annualLabel: formatCents(annualCents),
  };
}

export function schoolYearPreviewStartDate(
  effectiveStart?: string | null,
): Date {
  if (effectiveStart && /^\d{4}-\d{2}-\d{2}$/.test(effectiveStart)) {
    const [year, month, day] = effectiveStart.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  }

  const today = new Date();
  const year =
    today.getUTCMonth() >= 7 ? today.getUTCFullYear() : today.getUTCFullYear() - 1;
  return new Date(Date.UTC(year, 7, 1));
}

export function buildPaymentOptionPreviews(
  annualCents: number,
  counts: number[],
): PaymentOptionPreview[] {
  return counts
    .filter((count) => count >= 1)
    .sort((a, b) => a - b)
    .map((count) => {
      const amountCents = Math.round(annualCents / count);
      return {
        count,
        label: paymentScheduleLabel(count),
        amountCents,
        totalCents: amountCents * count,
      };
    });
}

export function suggestPlanNameFromProgram(programName: string): string {
  return programName.trim() || "School Year";
}

export function wizardTiersToAnnualCents(
  tiers: WizardTierInput[],
  billingBasis: TuitionInputMode,
): number {
  const annualTiers = tiers.map((tier) => ({
    amountCents: tuitionInputToAnnualCents(Number(tier.amount), billingBasis),
    isDefault: tier.isDefault,
  }));
  return annualCentsFromTiers(annualTiers);
}

export const DEFAULT_SINGLE_TIER_LABEL = "Standard";

export function normalizeWizardTiers(tiers: WizardTierInput[]): WizardTierInput[] {
  return tiers.map((tier, index) => ({
    ...tier,
    label:
      tiers.length === 1
        ? tier.label.trim() || DEFAULT_SINGLE_TIER_LABEL
        : tier.label,
    isDefault: index === 0,
  }));
}

export function collapseToSingleTier(tiers: WizardTierInput[]): WizardTierInput[] {
  if (tiers.length === 0) {
    return normalizeWizardTiers([
      { label: DEFAULT_SINGLE_TIER_LABEL, amount: "", isDefault: true },
    ]);
  }

  const tierWithAmount = tiers.find(
    (tier) => Number.isFinite(Number(tier.amount)) && Number(tier.amount) > 0,
  );
  const chosen = tierWithAmount ?? tiers[0];

  return normalizeWizardTiers([
    {
      ...chosen,
      label: chosen.label.trim() || DEFAULT_SINGLE_TIER_LABEL,
    },
  ]);
}

export function validateWizardTiers(tiers: WizardTierInput[]): string | null {
  const normalized = normalizeWizardTiers(tiers);
  if (normalized.length === 0) return "Add at least one tuition rate.";
  if (normalized.some((tier) => !tier.label.trim())) {
    return "Each tuition rate needs a name.";
  }
  if (
    normalized.some(
      (tier) => !Number.isFinite(Number(tier.amount)) || Number(tier.amount) <= 0,
    )
  ) {
    return "Each tuition rate needs an amount greater than zero.";
  }
  const defaultCount = normalized.filter((tier) => tier.isDefault).length;
  if (defaultCount !== 1) return "Select exactly one default tuition rate.";
  return null;
}

export function slugifyFeeCode(label: string, index = 0): string {
  return slugifyTierCode(label, index);
}

export function wizardFeesFromRatePlan(
  feeComponents: TuitionFeeComponent[],
): WizardFeeInput[] {
  return feeComponents.map((fee) => ({
    code: fee.code,
    label: fee.label,
    amountCents: fee.amountCents,
    timing: fee.timing,
  }));
}

export function validateWizardFees(fees: WizardFeeInput[]): string | null {
  for (const fee of fees) {
    const hasLabel = fee.label.trim().length > 0;
    const hasAmount = fee.amountCents > 0;

    if (hasLabel !== hasAmount) {
      if (!hasLabel) return "Each fee needs a label.";
      return "Each fee needs an amount greater than zero.";
    }

    if (fee.amountCents < 0) return "Fee amounts cannot be negative.";
  }

  const labels = fees
    .filter((fee) => fee.label.trim())
    .map((fee) => fee.label.trim().toLowerCase());
  if (new Set(labels).size !== labels.length) {
    return "Fee labels must be unique.";
  }

  return null;
}

function normalizeWizardFeesForSave(
  fees: WizardFeeInput[],
): Array<{
  code: string;
  label: string;
  amountCents: number;
  timing: FeeTiming;
}> {
  const usedCodes = new Set<string>();

  return fees
    .filter((fee) => fee.label.trim() && fee.amountCents > 0)
    .map((fee, index) => {
      const baseCode = fee.code?.trim() || slugifyFeeCode(fee.label, index);
      let code = baseCode;
      let suffix = 2;
      while (usedCodes.has(code)) {
        code = `${baseCode}_${suffix}`;
        suffix += 1;
      }
      usedCodes.add(code);

      return {
        code,
        label: fee.label.trim(),
        amountCents: fee.amountCents,
        timing: fee.timing ?? "enrollment",
      };
    });
}

function buildTierUpsertInputs(
  tiers: WizardTierInput[],
  billingBasis: TuitionInputMode,
): Array<{
  code: string;
  label: string;
  amountCents: number;
  sortOrder: number;
  isDefault: boolean;
}> {
  const usedCodes = new Set<string>();

  return tiers.map((tier, index) => {
    const baseCode = tier.code?.trim() || slugifyTierCode(tier.label, index);
    let code = baseCode;
    let suffix = 2;
    while (usedCodes.has(code)) {
      code = `${baseCode}_${suffix}`;
      suffix += 1;
    }
    usedCodes.add(code);

    const rawAmount = Number(tier.amount);
    const amountCents = Number.isFinite(rawAmount) && rawAmount > 0
      ? tuitionInputToAnnualCents(rawAmount, billingBasis)
      : 0;

    return {
      code,
      label: tier.label.trim() || DEFAULT_SINGLE_TIER_LABEL,
      amountCents,
      sortOrder: index,
      isDefault: tier.isDefault,
    };
  });
}

async function replaceFeeComponentsForRatePlan(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    ratePlanId: string;
    fees: WizardFeeInput[];
  },
): Promise<void> {
  const { data: existingFees } = await supabase
    .from("tuition_fee_components")
    .select("id")
    .eq("rate_plan_id", input.ratePlanId);

  if (existingFees?.length) {
    await supabase
      .from("tuition_fee_components")
      .delete()
      .eq("rate_plan_id", input.ratePlanId);
  }

  const feesToSave = normalizeWizardFeesForSave(input.fees);
  for (const fee of feesToSave) {
    await createFeeComponent(supabase, {
      organizationId: input.organizationId,
      ratePlanId: input.ratePlanId,
      code: fee.code,
      label: fee.label,
      amountCents: fee.amountCents,
      timing: fee.timing,
    });
  }
}

async function persistWizardChildren(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    ratePlanId: string;
    billingBasis: TuitionInputMode;
    tiers: WizardTierInput[];
    annualAmountCents: number;
    paymentCounts: number[];
    defaultPaymentCount: number | null;
    fees: WizardFeeInput[];
    allowEmptyPayments: boolean;
  },
): Promise<void> {
  const tiersToSave =
    input.tiers.length > 0
      ? input.tiers
      : [{ label: DEFAULT_SINGLE_TIER_LABEL, amount: "", isDefault: true }];

  await upsertTiersForRatePlan(supabase, {
    organizationId: input.organizationId,
    ratePlanId: input.ratePlanId,
    tiers: buildTierUpsertInputs(tiersToSave, input.billingBasis),
  });

  const previews = buildPaymentOptionPreviews(
    input.annualAmountCents,
    input.paymentCounts,
  );

  if (previews.length > 0) {
    const defaultCount =
      input.defaultPaymentCount ?? input.paymentCounts[0] ?? DEFAULT_PAYMENT_COUNT;
    await upsertPaymentPlansForRatePlan(supabase, {
      organizationId: input.organizationId,
      ratePlanId: input.ratePlanId,
      annualAmountCents: input.annualAmountCents,
      options: previews.map((preview) => ({
        installmentCount: preview.count,
        installmentAmountCents: preview.amountCents,
        isDefault: preview.count === defaultCount,
      })),
    });
  } else if (input.allowEmptyPayments) {
    const { data: existingPlans } = await supabase
      .from("tuition_payment_plans")
      .select("id")
      .eq("rate_plan_id", input.ratePlanId);

    if (existingPlans?.length) {
      await supabase
        .from("tuition_payment_plans")
        .delete()
        .eq("rate_plan_id", input.ratePlanId);
    }
  }

  await replaceFeeComponentsForRatePlan(supabase, {
    organizationId: input.organizationId,
    ratePlanId: input.ratePlanId,
    fees: input.fees,
  });
}

export async function saveWizardDraft(
  supabase: SupabaseClient,
  input: WizardDraftSaveInput,
): Promise<TuitionRatePlan> {
  if (!input.programId) {
    throw new Error("Select a program.");
  }

  const planName = input.name.trim() || "School Year";
  const billingBasis = input.billingBasis ?? "annual";
  const tiers = input.tiers.length > 0 ? input.tiers : DEFAULT_TIERS_FALLBACK();
  if (input.strict) {
    const validatedThroughStep = input.validatedThroughStep ?? input.stepIndex;
    if (validatedThroughStep >= 1) {
      const tierValidationError = validateWizardTiers(normalizeWizardTiers(tiers));
      if (tierValidationError) {
        throw new Error(tierValidationError);
      }
    }
    if (validatedThroughStep >= 2) {
      if (input.paymentCounts.length === 0) {
        throw new Error("Select at least one payment option.");
      }
      if (input.defaultPaymentCount == null) {
        throw new Error("Choose a default payment schedule.");
      }
    }
    if (validatedThroughStep >= 3) {
      const feesError = validateWizardFees(input.fees ?? []);
      if (feesError) {
        throw new Error(feesError);
      }
    }
  } else {
    const feeValidationError = validateWizardFees(input.fees ?? []);
    if (feeValidationError) {
      throw new Error(feeValidationError);
    }
  }

  const annualAmountCents = wizardTiersToAnnualCents(
    normalizeWizardTiers(tiers),
    billingBasis,
  );
  const metadata = buildWizardMetadata(input.stepIndex, input.pricingMode);

  let ratePlan: TuitionRatePlan;

  if (input.ratePlanId) {
    ratePlan = await updateRatePlan(supabase, input.ratePlanId, {
      name: planName,
      programId: input.programId,
      amountCents: annualAmountCents,
      billingBasis,
      effectiveStart: input.effectiveStart ?? null,
      effectiveEnd: input.effectiveEnd ?? null,
      status: "draft",
      metadata,
    });
  } else {
    ratePlan = await createRatePlan(supabase, {
      organizationId: input.organizationId,
      programId: input.programId,
      name: planName,
      amountCents: annualAmountCents,
      billingBasis,
      effectiveStart: input.effectiveStart ?? null,
      effectiveEnd: input.effectiveEnd ?? null,
      status: "draft",
      metadata,
    });
  }

  await persistWizardChildren(supabase, {
    organizationId: input.organizationId,
    ratePlanId: ratePlan.id,
    billingBasis,
    tiers,
    annualAmountCents,
    paymentCounts: input.paymentCounts,
    defaultPaymentCount: input.defaultPaymentCount ?? null,
    fees: input.fees ?? [],
    allowEmptyPayments: input.paymentCounts.length === 0,
  });

  return ratePlan;
}

function DEFAULT_TIERS_FALLBACK(): WizardTierInput[] {
  return [{ label: DEFAULT_SINGLE_TIER_LABEL, amount: "", isDefault: true }];
}

export async function createRatePlanFromWizard(
  supabase: SupabaseClient,
  input: WizardSetupInput,
): Promise<TuitionRatePlan> {
  const billingBasis = input.billingBasis ?? "annual";
  const tiers = normalizeWizardTiers(input.tiers);
  const tierValidationError = validateWizardTiers(tiers);
  if (tierValidationError) {
    throw new Error(tierValidationError);
  }

  const feeValidationError = validateWizardFees(input.fees ?? []);
  if (feeValidationError) {
    throw new Error(feeValidationError);
  }

  const annualAmountCents = wizardTiersToAnnualCents(tiers, billingBasis);
  const defaultCount = input.defaultPaymentCount ?? DEFAULT_PAYMENT_COUNT;
  const previews = buildPaymentOptionPreviews(
    annualAmountCents,
    input.paymentCounts,
  );

  if (previews.length === 0) {
    throw new Error("Select at least one payment option.");
  }

  let ratePlan: TuitionRatePlan;

  if (input.ratePlanId) {
    ratePlan = await updateRatePlan(supabase, input.ratePlanId, {
      name: input.name,
      programId: input.programId,
      amountCents: annualAmountCents,
      billingBasis,
      effectiveStart: input.effectiveStart ?? null,
      effectiveEnd: input.effectiveEnd ?? null,
      status: "active",
      metadata: {},
    });
  } else {
    ratePlan = await createRatePlan(supabase, {
      organizationId: input.organizationId,
      programId: input.programId,
      name: input.name,
      amountCents: annualAmountCents,
      billingBasis,
      effectiveStart: input.effectiveStart ?? null,
      effectiveEnd: input.effectiveEnd ?? null,
      status: "active",
      metadata: {},
    });
  }

  await persistWizardChildren(supabase, {
    organizationId: input.organizationId,
    ratePlanId: ratePlan.id,
    billingBasis,
    tiers: input.tiers,
    annualAmountCents,
    paymentCounts: input.paymentCounts,
    defaultPaymentCount: defaultCount,
    fees: input.fees ?? [],
    allowEmptyPayments: false,
  });

  return ratePlan;
}

export function wizardStateFromRatePlan(
  plan: RatePlanWithDetails,
): Pick<
  WizardSetupInput,
  | "name"
  | "billingBasis"
  | "tiers"
  | "effectiveStart"
  | "effectiveEnd"
  | "paymentCounts"
  | "defaultPaymentCount"
  | "fees"
> & {
  pricingMode: "single" | "multiple";
  wizardStepIndex: number;
} {
  const paymentCounts = plan.paymentPlans.map((p) => p.installmentCount);
  const defaultPlan =
    plan.paymentPlans.find((p) => p.isDefault) ?? plan.paymentPlans[0];
  const billingBasis: TuitionInputMode =
    plan.billingBasis === "monthly" ? "monthly" : "annual";
  const isDraft = plan.status === "draft";
  const wizardMeta = parseWizardMetadata(plan.metadata);

  const tiers: WizardTierInput[] =
    plan.tiers.length > 0
      ? normalizeWizardTiers(
          plan.tiers.map((tier) => ({
          code: tier.code,
          label: tier.label,
          amount: String(
            billingBasis === "monthly"
              ? Math.round(tier.amountCents / 12) / 100
              : tier.amountCents / 100,
          ),
          isDefault: tier.isDefault,
        })),
        )
      : [
          {
            code: "default",
            label: "Standard",
            amount: String(
              billingBasis === "monthly"
                ? Math.round(plan.amountCents / 12) / 100
                : plan.amountCents / 100,
            ),
            isDefault: true,
          },
        ];

  return {
    name: plan.name,
    billingBasis,
    tiers,
    effectiveStart: plan.effectiveStart,
    effectiveEnd: plan.effectiveEnd,
    paymentCounts: paymentCounts.length
      ? paymentCounts
      : isDraft
        ? []
        : [DEFAULT_PAYMENT_COUNT],
    defaultPaymentCount: defaultPlan?.installmentCount ?? (isDraft ? null : DEFAULT_PAYMENT_COUNT),
    fees: wizardFeesFromRatePlan(plan.feeComponents),
    pricingMode: wizardMeta.pricingMode,
    wizardStepIndex: wizardMeta.wizardStepIndex,
  };
}
