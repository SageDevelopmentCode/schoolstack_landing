"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowRight, CircleCheck } from "lucide-react";
import {
  CalculatorCountField,
  CalculatorMoneyField,
} from "@/components/marketing/enrollment-calculator/CalculatorFields";
import CalculatorInfoTip from "@/components/marketing/enrollment-calculator/CalculatorInfoTip";
import ExpenseEstimator, {
  type ExpenseCategory,
} from "@/components/marketing/enrollment-calculator/ExpenseEstimator";
import {
  buildEnrollmentQuestionSteps,
  type EnrollmentQuestionKind,
} from "@/components/marketing/enrollment-calculator/enrollment-question-steps";
import {
  CALCULATOR_COPY,
  ENROLLMENT_VIEW_RESULTS_BUTTON,
  ENROLLMENT_WIZARD_DONE_KICKER,
  ENROLLMENT_WIZARD_DONE_TITLE,
  enrollmentDoneTeaser,
  enrollmentQuestionEnrollmentAll,
  enrollmentQuestionOperating,
  enrollmentQuestionOwnerPay,
  enrollmentQuestionTuition,
  enrollmentQuestionVariable,
} from "@/components/marketing/enrollment-calculator/enrollment-copy";
import MarketingTuitionGroupsStep, {
  enrollmentFieldLabel,
} from "@/components/marketing/shared/MarketingTuitionGroupsStep";
import { MarketingWizardStepMotion } from "@/components/marketing/shared/marketing-wizard-motion";
import { plannerFocusClass } from "@/components/marketing/tuition-planner/planner-theme";
import {
  formatCalculatorMoney,
  MAX_CALCULATOR_ENROLLMENT,
  type EnrollmentEstimate,
} from "@/lib/marketing/enrollment-calculator";
import type { EnrollmentTuitionGroup } from "@/lib/marketing/enrollment-tuition-groups";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type EnrollmentQuestionFlowProps = {
  theme: ParentThemeTokens;
  stepIndex: number;
  onStepIndexChange: (index: number) => void;
  tuitionGroups: EnrollmentTuitionGroup[];
  onUpdateTuitionGroup: (
    groupId: string,
    patch: Partial<Pick<EnrollmentTuitionGroup, "label" | "tuitionCents" | "enrollment">>,
  ) => void;
  onAddTuitionGroup: () => void;
  onRemoveTuitionGroup: (groupId: string) => void;
  variableCents: number;
  onVariableCents: (cents: number) => void;
  showMarginWarning: boolean;
  expenseMode: "manual" | "estimated";
  onExpenseModeChange: (mode: "manual" | "estimated") => void;
  manualFixedCents: number;
  onManualFixedCents: (cents: number) => void;
  categories: ExpenseCategory[];
  onCategoriesChange: (categories: ExpenseCategory[]) => void;
  estimatorOpen: boolean;
  onEstimatorOpenChange: (open: boolean) => void;
  categoryTotal: number;
  ownerCents: number;
  onOwnerCents: (cents: number) => void;
  enrollmentSliderMax: number;
  estimate: EnrollmentEstimate;
  onViewResults: () => void;
};

export default function EnrollmentQuestionFlow(props: EnrollmentQuestionFlowProps) {
  const {
    theme,
    stepIndex,
    onStepIndexChange,
    tuitionGroups,
    onUpdateTuitionGroup,
    onAddTuitionGroup,
    onRemoveTuitionGroup,
    variableCents,
    onVariableCents,
    showMarginWarning,
    expenseMode,
    onExpenseModeChange,
    manualFixedCents,
    onManualFixedCents,
    categories,
    onCategoriesChange,
    estimatorOpen,
    onEstimatorOpenChange,
    categoryTotal,
    ownerCents,
    onOwnerCents,
    enrollmentSliderMax,
    estimate,
    onViewResults,
  } = props;

  const steps = useMemo(() => buildEnrollmentQuestionSteps(), []);
  const safeIndex = Math.min(Math.max(0, stepIndex), steps.length - 1);
  const step = steps[safeIndex] ?? steps[0];
  const stepRef = useRef<HTMLDivElement>(null);
  const multiGroup = tuitionGroups.length > 1;

  useEffect(() => {
    if (safeIndex !== stepIndex) onStepIndexChange(safeIndex);
  }, [safeIndex, stepIndex, onStepIndexChange]);

  useEffect(() => {
    const node = stepRef.current;
    if (!node) return;
    const focusable = node.querySelector<HTMLElement>(
      "input:not([disabled]), select:not([disabled]), button[data-planner-focus]:not([disabled])",
    );
    focusable?.focus({ preventScroll: true });
  }, [safeIndex, step?.kind]);

  const questionTitle = questionTitleForStep(step?.kind, multiGroup);
  const questionTip = questionTipForStep(step?.kind);

  const goBack = () => onStepIndexChange(Math.max(0, safeIndex - 1));
  const goNext = () => onStepIndexChange(Math.min(steps.length - 1, safeIndex + 1));
  const enrollmentStepIndex = steps.findIndex((item) => item.kind === "enrollment_all");

  if (!step) return null;

  return (
    <div className="mt-2">
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-[11px] font-bold tabular-nums" style={{ color: theme.muted, fontFamily: theme.fontBody }}>
          Question {safeIndex + 1} of {steps.length}
        </p>
        <div className="flex gap-1" aria-hidden="true">
          {steps.map((_, index) => (
            <span
              key={index}
              className="h-1.5 w-1.5 rounded-full motion-safe:transition-all motion-safe:duration-300"
              style={{
                backgroundColor: index === safeIndex ? theme.primary : "#DCE4DC",
                transform: index === safeIndex ? "scale(1.35)" : undefined,
              }}
            />
          ))}
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {step.kind === "done" ? ENROLLMENT_WIZARD_DONE_TITLE : questionTitle}
      </p>

      <MarketingWizardStepMotion stepKey={`${step.kind}-${safeIndex}`}>
        {step.kind !== "done" ? (
          <QuestionHeading theme={theme} title={questionTitle} tip={questionTip} tipLabel={questionTitle} />
        ) : null}

        <div ref={stepRef} className="min-h-[140px] py-2">
          {step.kind === "tuition_all" ? (
            <MarketingTuitionGroupsStep
              theme={theme}
              fieldIdPrefix="enrollment-calculator"
              groups={tuitionGroups.map((group) => ({
                id: group.id,
                label: group.label,
                monthlyTuitionCents: group.tuitionCents,
              }))}
              onUpdateGroup={(groupId, patch) =>
                onUpdateTuitionGroup(groupId, {
                  ...(patch.label !== undefined ? { label: patch.label } : {}),
                  ...(patch.monthlyTuitionCents !== undefined
                    ? { tuitionCents: patch.monthlyTuitionCents }
                    : {}),
                })
              }
              onAddGroup={onAddTuitionGroup}
              onRemoveGroup={onRemoveTuitionGroup}
            />
          ) : null}

          {step.kind === "variable_cost" ? (
            <CalculatorMoneyField
              theme={theme}
              dense
              hideLabel
              id="enrollment-variable-cost"
              label={CALCULATOR_COPY.inputs.variableCost}
              description={CALCULATOR_COPY.help.studentCosts}
              suffix={CALCULATOR_COPY.monthSuffix}
              valueCents={variableCents}
              onChangeCents={onVariableCents}
            />
          ) : null}

          {step.kind === "operating_cost" ? (
            <OperatingCostStep
              theme={theme}
              expenseMode={expenseMode}
              onExpenseModeChange={onExpenseModeChange}
              manualFixedCents={manualFixedCents}
              onManualFixedCents={onManualFixedCents}
              categories={categories}
              onCategoriesChange={onCategoriesChange}
              estimatorOpen={estimatorOpen}
              onEstimatorOpenChange={onEstimatorOpenChange}
              categoryTotal={categoryTotal}
            />
          ) : null}

          {step.kind === "owner_pay" ? (
            <CalculatorMoneyField
              theme={theme}
              dense
              hideLabel
              id="enrollment-owner-pay"
              label={CALCULATOR_COPY.inputs.ownerPay}
              description={CALCULATOR_COPY.help.pay}
              unit={CALCULATOR_COPY.perMonth}
              valueCents={ownerCents}
              onChangeCents={onOwnerCents}
            />
          ) : null}

          {step.kind === "enrollment_all" ? (
            <div className="space-y-4">
              {tuitionGroups.map((group) => (
                <CalculatorCountField
                  key={group.id}
                  theme={theme}
                  dense={!multiGroup}
                  hideLabel={!multiGroup}
                  id={`enrollment-${group.id}-count`}
                  label={multiGroup ? enrollmentFieldLabel(group.label) : "Enrolled students"}
                  description={CALCULATOR_COPY.help.current}
                  suffix="students"
                  rangeNoun="students"
                  value={group.enrollment}
                  max={enrollmentSliderMax}
                  inputMax={MAX_CALCULATOR_ENROLLMENT}
                  onChange={(enrollment) => onUpdateTuitionGroup(group.id, { enrollment })}
                />
              ))}
            </div>
          ) : null}

          {step.kind === "done" ? (
            <EnrollmentDoneStep
              theme={theme}
              estimate={estimate}
              onViewResults={onViewResults}
              onEditEnrollment={() => onStepIndexChange(enrollmentStepIndex)}
            />
          ) : null}

          {showMarginWarning && step.kind === "variable_cost" ? (
            <p
              className="mt-2 text-[13px] leading-relaxed"
              style={{ color: theme.alert, fontFamily: theme.fontBody }}
              role="status"
            >
              {CALCULATOR_COPY.tuitionTooLow}
            </p>
          ) : null}
        </div>
      </MarketingWizardStepMotion>

      <div
        className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t pt-5"
        style={{ borderColor: theme.line }}
      >
        <button
          type="button"
          onClick={goBack}
          disabled={safeIndex === 0}
          className={`rounded-xl border px-4 py-2.5 text-[12px] font-bold disabled:opacity-40 ${plannerFocusClass}`}
          style={{
            borderColor: theme.line,
            color: theme.primary,
            backgroundColor: theme.white,
            fontFamily: theme.fontBody,
          }}
        >
          Back
        </button>
        <div className="flex gap-2">
          {safeIndex < steps.length - 1 ? (
            <button
              type="button"
              onClick={goNext}
              className={`rounded-xl px-4 py-2.5 text-[12px] font-bold ${plannerFocusClass}`}
              style={{
                backgroundColor: theme.primary,
                color: "#fff",
                fontFamily: theme.fontBody,
              }}
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onStepIndexChange(0)}
              className={`rounded-xl px-4 py-2.5 text-[12px] font-bold ${plannerFocusClass}`}
              style={{
                backgroundColor: theme.primary,
                color: "#fff",
                fontFamily: theme.fontBody,
              }}
            >
              Review from start
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function questionTitleForStep(kind: EnrollmentQuestionKind | undefined, multiGroup: boolean): string {
  switch (kind) {
    case "tuition_all":
      return enrollmentQuestionTuition();
    case "variable_cost":
      return enrollmentQuestionVariable();
    case "operating_cost":
      return enrollmentQuestionOperating();
    case "owner_pay":
      return enrollmentQuestionOwnerPay();
    case "enrollment_all":
      return enrollmentQuestionEnrollmentAll(multiGroup);
    default:
      return "";
  }
}

function questionTipForStep(kind: EnrollmentQuestionKind | undefined): string | null {
  switch (kind) {
    case "tuition_all":
      return CALCULATOR_COPY.inputsSubtitle;
    case "variable_cost":
      return CALCULATOR_COPY.help.studentCosts;
    case "operating_cost":
      return CALCULATOR_COPY.help.operating;
    case "owner_pay":
      return CALCULATOR_COPY.help.pay;
    case "enrollment_all":
      return CALCULATOR_COPY.help.current;
    default:
      return null;
  }
}

function QuestionHeading({
  theme,
  title,
  tip,
  tipLabel,
}: {
  theme: ParentThemeTokens;
  title: string;
  tip: string | null;
  tipLabel: string;
}) {
  return (
    <div className="mb-5 flex items-start gap-2">
      <h4
        className="text-[22px] font-medium leading-snug tracking-[-0.035em] max-[480px]:text-[20px]"
        style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
      >
        {title}
      </h4>
      {tip ? (
        <CalculatorInfoTip theme={theme} content={tip} label={tipLabel} placement="above" align="start" />
      ) : null}
    </div>
  );
}

function OperatingCostStep({
  theme,
  expenseMode,
  onExpenseModeChange,
  manualFixedCents,
  onManualFixedCents,
  categories,
  onCategoriesChange,
  estimatorOpen,
  onEstimatorOpenChange,
  categoryTotal,
}: {
  theme: ParentThemeTokens;
  expenseMode: "manual" | "estimated";
  onExpenseModeChange: (mode: "manual" | "estimated") => void;
  manualFixedCents: number;
  onManualFixedCents: (cents: number) => void;
  categories: ExpenseCategory[];
  onCategoriesChange: (categories: ExpenseCategory[]) => void;
  estimatorOpen: boolean;
  onEstimatorOpenChange: (open: boolean) => void;
  categoryTotal: number;
}) {
  return (
    <div>
      {expenseMode === "estimated" ? (
        <div className="mb-4">
          <p className="text-[12px]" style={{ color: theme.muted, fontFamily: theme.fontBody }}>
            {CALCULATOR_COPY.help.fromList}
          </p>
          <p
            className="mt-2 font-heading text-[2rem] font-semibold leading-none tabular-nums"
            style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
          >
            {formatCalculatorMoney(categoryTotal)}
          </p>
        </div>
      ) : (
        <CalculatorMoneyField
          theme={theme}
          dense
          hideLabel
          id="enrollment-fixed-expenses"
          label={CALCULATOR_COPY.inputs.fixedExpenses}
          description={CALCULATOR_COPY.help.operating}
          unit={CALCULATOR_COPY.perMonth}
          valueCents={manualFixedCents}
          onChangeCents={onManualFixedCents}
        />
      )}
      <ExpenseEstimator
        theme={theme}
        open={estimatorOpen}
        onOpenChange={onEstimatorOpenChange}
        mode={expenseMode}
        onModeChange={onExpenseModeChange}
        categories={categories}
        onCategoriesChange={onCategoriesChange}
      />
    </div>
  );
}

function EnrollmentDoneStep({
  theme,
  estimate,
  onViewResults,
  onEditEnrollment,
}: {
  theme: ParentThemeTokens;
  estimate: EnrollmentEstimate;
  onViewResults: () => void;
  onEditEnrollment: () => void;
}) {
  const teaser = estimate.viable ? enrollmentDoneTeaser(estimate.compensationTarget) : null;

  return (
    <div
      className="rounded-2xl border px-5 py-5"
      style={{
        background: "linear-gradient(135deg, #EAF2EB, #F4F7EE)",
        borderColor: "#C7DFCB",
      }}
    >
      <div className="flex items-start gap-3">
        <CircleCheck className="mt-0.5 h-7 w-7 shrink-0" style={{ color: theme.primary }} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p
            className="text-[10px] font-extrabold uppercase tracking-[0.13em]"
            style={{ color: "#729077", fontFamily: theme.fontBody }}
          >
            {ENROLLMENT_WIZARD_DONE_KICKER}
          </p>
          <h4
            className="mt-1.5 text-[24px] font-medium leading-snug tracking-[-0.035em]"
            style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
          >
            {ENROLLMENT_WIZARD_DONE_TITLE}
          </h4>
          {teaser ? (
            <p className="mt-3 text-[15px] font-bold" style={{ color: theme.primary, fontFamily: theme.fontBody }}>
              {teaser}
            </p>
          ) : null}
          <button
            type="button"
            onClick={onEditEnrollment}
            className={`mt-5 inline-flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-[13px] font-bold ${plannerFocusClass}`}
            style={{
              borderColor: "#B9CDBD",
              color: theme.primary,
              backgroundColor: "#FFFDF7",
              fontFamily: theme.fontBody,
            }}
          >
            {CALCULATOR_COPY.scenarioTitle}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            data-planner-focus=""
            onClick={onViewResults}
            className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-[13px] font-bold lg:hidden ${plannerFocusClass}`}
            style={{
              backgroundColor: theme.primary,
              color: "#fff",
              fontFamily: theme.fontBody,
            }}
          >
            {ENROLLMENT_VIEW_RESULTS_BUTTON}
            <ArrowDown className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
