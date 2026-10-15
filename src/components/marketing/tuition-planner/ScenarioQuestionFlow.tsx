"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ChevronDown, CircleCheck } from "lucide-react";
import {
  CalculatorCountField,
  CalculatorMoneyField,
  calculatorFocusClass,
} from "@/components/marketing/enrollment-calculator/CalculatorFields";
import CalculatorInfoTip from "@/components/marketing/enrollment-calculator/CalculatorInfoTip";
import {
  BREAKDOWN_ORDER,
  ENROLLMENT_HELP,
  MONTHS_HELP,
  PARTITION_NOTE,
  QUESTION_DONE_BODY,
  QUESTION_DONE_DESKTOP_HINT,
  QUESTION_DONE_KICKER,
  QUESTION_DONE_TITLE,
  VIEW_RESULTS_BUTTON,
  questionDoneRevenueTeaser,
  SCHOLARSHIP_HELP,
  SIBLING_HELP,
  TUITION_GROUPS_HELP,
  TUITION_HELP,
  questionBillingMonths,
  questionEnrollment,
  questionEnrollmentAll,
  questionScholarship,
  questionScholarshipDetails,
  questionSiblingDetails,
  questionSiblingDiscount,
  questionTuitionAll,
} from "@/components/marketing/tuition-planner/planner-copy";
import {
  buildPlannerQuestionSteps,
  findGroup,
} from "@/components/marketing/tuition-planner/planner-question-steps";
import { plannerFocusClass } from "@/components/marketing/tuition-planner/planner-theme";
import { formatCalculatorMoney } from "@/lib/marketing/enrollment-calculator";
import MarketingTuitionGroupsStep, {
  enrollmentFieldLabel,
} from "@/components/marketing/shared/MarketingTuitionGroupsStep";
import { MarketingWizardStepMotion } from "@/components/marketing/shared/marketing-wizard-motion";
import {
  DEFAULT_BILLING_MONTHS,
  ENROLLMENT_SLIDER_MAX,
  MAX_BILLING_MONTHS,
  MAX_PLANNER_ENROLLMENT,
  MIN_BILLING_MONTHS,
  clampPercentHundredths,
  type GroupAdjustment,
  type ProgramGroup,
  type Scenario,
  type ScenarioComputation,
} from "@/lib/marketing/tuition-scenario-planner";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type AdjustmentKind = "siblingDiscount" | "scholarship";

type ScenarioQuestionFlowProps = {
  theme: ParentThemeTokens;
  scenario: Scenario;
  result: ScenarioComputation;
  stepIndex: number;
  onStepIndexChange: (index: number) => void;
  onUpdateGroup: (
    groupId: string,
    patch: Partial<Pick<ProgramGroup, "monthlyTuitionCents" | "enrollment" | "billingMonths" | "label">>,
  ) => void;
  onAddGroup: () => void;
  onRemoveGroup: (groupId: string) => void;
  onUpdateAllBillingMonths: (billingMonths: number) => void;
  onToggleAdjustment: (kind: AdjustmentKind, enabled: boolean) => void;
  onUpdateAdjustment: (
    kind: AdjustmentKind,
    patch: Partial<Pick<GroupAdjustment, "mode" | "percentHundredths" | "amountCents" | "recipientCount">>,
  ) => void;
  onViewResults: () => void;
};

export default function ScenarioQuestionFlow({
  theme,
  scenario,
  result,
  stepIndex,
  onStepIndexChange,
  onUpdateGroup,
  onAddGroup,
  onRemoveGroup,
  onUpdateAllBillingMonths,
  onToggleAdjustment,
  onUpdateAdjustment,
  onViewResults,
}: ScenarioQuestionFlowProps) {
  const steps = useMemo(() => buildPlannerQuestionSteps(scenario), [scenario]);
  const safeIndex = Math.min(Math.max(0, stepIndex), steps.length - 1);
  const step = steps[safeIndex] ?? steps[0];
  const stepRef = useRef<HTMLDivElement>(null);
  const [breakdownOpen, setBreakdownOpen] = useState(false);

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
  }, [safeIndex, step?.kind, step?.groupId]);

  const multiGroup = scenario.groups.length > 1;
  const group = findGroup(scenario, step?.groupId);
  const totalEnrollment = scenario.groups.reduce((sum, item) => sum + item.enrollment, 0);
  const sharedBillingMonths = scenario.groups[0]?.billingMonths ?? DEFAULT_BILLING_MONTHS;

  const questionTitle = (() => {
    if (!step || step.kind === "done") return QUESTION_DONE_TITLE;
    switch (step.kind) {
      case "tuition_all":
        return questionTuitionAll();
      case "enrollment_all":
        return multiGroup ? questionEnrollmentAll() : questionEnrollment();
      case "months":
        return questionBillingMonths();
      case "sibling_toggle":
        return questionSiblingDiscount();
      case "sibling_details":
        return questionSiblingDetails();
      case "scholarship_toggle":
        return questionScholarship();
      case "scholarship_details":
        return questionScholarshipDetails();
      default:
        return "";
    }
  })();

  const questionTip = (() => {
    if (step?.kind === "sibling_toggle" || step?.kind === "sibling_details") return SIBLING_HELP;
    if (step?.kind === "scholarship_toggle" || step?.kind === "scholarship_details") {
      return `${SCHOLARSHIP_HELP} ${PARTITION_NOTE}`;
    }
    if (step?.kind === "tuition_all") return multiGroup ? TUITION_GROUPS_HELP : TUITION_HELP;
    if (step?.kind === "enrollment_all") return ENROLLMENT_HELP;
    if (step?.kind === "months") return MONTHS_HELP;
    return null;
  })();

  const goBack = () => onStepIndexChange(Math.max(0, safeIndex - 1));
  const goNext = () => onStepIndexChange(Math.min(steps.length - 1, safeIndex + 1));

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
        {questionTitle}
      </p>

      <MarketingWizardStepMotion stepKey={`${step.kind}-${step.groupId ?? ""}-${safeIndex}`}>
        {step.kind !== "done" ? (
          <QuestionHeading theme={theme} title={questionTitle} tip={questionTip} tipLabel={questionTitle} />
        ) : null}

        <div ref={stepRef} className="min-h-[140px] py-2">
        {step.kind === "done" ? (
          <PlannerDoneStep
            theme={theme}
            scenario={scenario}
            result={result}
            breakdownOpen={breakdownOpen}
            onToggleBreakdown={() => setBreakdownOpen((open) => !open)}
            onViewResults={onViewResults}
          />
        ) : null}

        {step.kind === "tuition_all" ? (
          <MarketingTuitionGroupsStep
            theme={theme}
            fieldIdPrefix={scenario.id}
            groups={scenario.groups}
            onUpdateGroup={onUpdateGroup}
            onAddGroup={onAddGroup}
            onRemoveGroup={onRemoveGroup}
          />
        ) : null}

        {step.kind === "enrollment_all" ? (
          <div className="space-y-4">
            {scenario.groups.map((item) => (
              <CalculatorCountField
                key={item.id}
                theme={theme}
                dense={!multiGroup}
                hideLabel={!multiGroup}
                id={`${scenario.id}-${item.id}-enrollment`}
                label={multiGroup ? enrollmentFieldLabel(item.label) : "Enrolled students"}
                description={ENROLLMENT_HELP}
                suffix="students"
                rangeNoun="students"
                value={item.enrollment}
                max={ENROLLMENT_SLIDER_MAX}
                inputMax={MAX_PLANNER_ENROLLMENT}
                onChange={(enrollment) => onUpdateGroup(item.id, { enrollment })}
              />
            ))}
          </div>
        ) : null}

        {step.kind === "months" ? (
          <MonthStepper
            theme={theme}
            id={`${scenario.id}-months`}
            value={sharedBillingMonths}
            onChange={onUpdateAllBillingMonths}
          />
        ) : null}

        {group && step.kind === "sibling_toggle" ? (
          <YesNoChoice
            theme={theme}
            value={group.siblingDiscount.enabled}
            onChange={(enabled) => onToggleAdjustment("siblingDiscount", enabled)}
          />
        ) : null}

        {group && step.kind === "sibling_details" ? (
          <DiscountDetailsFields
            theme={theme}
            idPrefix={`${scenario.id}-${group.id}-sibling`}
            enrollment={totalEnrollment}
            adjustment={group.siblingDiscount}
            onChange={(patch) => onUpdateAdjustment("siblingDiscount", patch)}
          />
        ) : null}

        {group && step.kind === "scholarship_toggle" ? (
          <YesNoChoice
            theme={theme}
            value={group.scholarship.enabled}
            onChange={(enabled) => onToggleAdjustment("scholarship", enabled)}
          />
        ) : null}

        {group && step.kind === "scholarship_details" ? (
          <DiscountDetailsFields
            theme={theme}
            idPrefix={`${scenario.id}-${group.id}-scholarship`}
            enrollment={totalEnrollment}
            adjustment={group.scholarship}
            onChange={(patch) => onUpdateAdjustment("scholarship", patch)}
          />
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
          {(step.kind === "sibling_toggle" && group && !group.siblingDiscount.enabled) ||
          (step.kind === "scholarship_toggle" && group && !group.scholarship.enabled) ? (
            <button
              type="button"
              onClick={goNext}
              className={`rounded-xl px-4 py-2.5 text-[12px] font-bold ${plannerFocusClass}`}
              style={{ color: theme.muted, fontFamily: theme.fontBody }}
            >
              Skip
            </button>
          ) : null}
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

function YesNoChoice({
  theme,
  value,
  onChange,
}: {
  theme: ParentThemeTokens;
  value: boolean;
  onChange: (enabled: boolean) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 pt-1" role="group" aria-label="Yes or no">
      {(
        [
          { label: "No", enabled: false },
          { label: "Yes", enabled: true },
        ] as const
      ).map((option) => {
        const selected = value === option.enabled;
        return (
          <button
            key={option.label}
            type="button"
            data-planner-focus=""
            aria-pressed={selected}
            onClick={() => onChange(option.enabled)}
            className={`rounded-xl border px-4 py-3.5 text-[14px] font-bold ${plannerFocusClass}`}
            style={{
              borderColor: selected ? theme.primary : theme.line,
              backgroundColor: selected ? theme.primary : theme.cream,
              color: selected ? "#fff" : theme.ink,
              fontFamily: theme.fontBody,
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function MonthStepper({
  theme,
  id,
  value,
  onChange,
}: {
  theme: ParentThemeTokens;
  id: string;
  value: number;
  onChange: (value: number) => void;
}) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState(String(value));

  const commit = (nextDraft: string) => {
    const digits = nextDraft.replace(/\D/g, "");
    if (!digits) {
      setDraft("");
      return;
    }
    const parsed = Number.parseInt(digits, 10);
    if (!Number.isFinite(parsed)) return;
    const next = Math.min(MAX_BILLING_MONTHS, Math.max(MIN_BILLING_MONTHS, parsed));
    setDraft(String(next));
    onChange(next);
  };

  return (
    <div
      className="flex h-12 items-center overflow-hidden"
      style={{
        border: `1px solid ${focused ? theme.primary : theme.line}`,
        borderRadius: theme.radiusButton,
        backgroundColor: theme.cream,
        boxShadow: focused ? `0 0 0 3px ${theme.primarySoft}` : undefined,
      }}
    >
      <button
        type="button"
        aria-label="One fewer billing month"
        disabled={value <= MIN_BILLING_MONTHS}
        onClick={() => onChange(value - 1)}
        className={`px-4 text-[16px] font-extrabold disabled:opacity-40 ${plannerFocusClass}`}
        style={{ color: theme.primary, fontFamily: theme.fontBody }}
      >
        −
      </button>
      <input
        id={id}
        inputMode="numeric"
        autoComplete="off"
        value={focused ? draft : String(value)}
        onFocus={() => {
          setFocused(true);
          setDraft(String(value));
        }}
        onChange={(event) => commit(event.target.value)}
        onBlur={() => {
          if (!draft) onChange(value);
          setFocused(false);
        }}
        className={`min-w-0 flex-1 border-0 bg-transparent text-center text-[15px] font-medium tabular-nums outline-none ${calculatorFocusClass}`}
        style={{ color: theme.ink, fontFamily: theme.fontBody }}
      />
      <span className="text-[11px]" style={{ color: theme.muted, fontFamily: theme.fontBody }}>
        months
      </span>
      <button
        type="button"
        aria-label="One more billing month"
        disabled={value >= MAX_BILLING_MONTHS}
        onClick={() => onChange(value + 1)}
        className={`px-4 text-[16px] font-extrabold disabled:opacity-40 ${plannerFocusClass}`}
        style={{ color: theme.primary, fontFamily: theme.fontBody }}
      >
        +
      </button>
    </div>
  );
}

function DiscountDetailsFields({
  theme,
  idPrefix,
  enrollment,
  adjustment,
  onChange,
}: {
  theme: ParentThemeTokens;
  idPrefix: string;
  enrollment: number;
  adjustment: GroupAdjustment;
  onChange: (
    patch: Partial<Pick<GroupAdjustment, "mode" | "percentHundredths" | "amountCents" | "recipientCount">>,
  ) => void;
}) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{ backgroundColor: "#F7FAF6", borderColor: theme.line }}
    >
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label
            htmlFor={`${idPrefix}-mode`}
            className="mb-2 block text-[12px] font-bold"
            style={{ color: theme.ink, fontFamily: theme.fontBody }}
          >
            Discount format
          </label>
          <select
            id={`${idPrefix}-mode`}
            value={adjustment.mode}
            onChange={(event) => onChange({ mode: event.target.value === "fixed" ? "fixed" : "percent" })}
            className={`h-12 w-full rounded-xl border bg-white px-3 text-[14px] ${plannerFocusClass}`}
            style={{ borderColor: "#DDE4DA", color: theme.ink, fontFamily: theme.fontBody }}
          >
            <option value="percent">Percentage off tuition</option>
            <option value="fixed">Dollars off each month</option>
          </select>
        </div>
        {adjustment.mode === "percent" ? (
          <PercentField
            theme={theme}
            id={`${idPrefix}-percent`}
            label="Discount per student"
            hundredths={adjustment.percentHundredths}
            onChange={(percentHundredths) => onChange({ percentHundredths })}
          />
        ) : (
          <CalculatorMoneyField
            theme={theme}
            dense
            id={`${idPrefix}-amount`}
            label="Discount per student"
            description="Subtracted from this student's monthly tuition."
            suffix="/ month"
            valueCents={adjustment.amountCents}
            onChangeCents={(amountCents) => onChange({ amountCents })}
          />
        )}
        <RecipientField
          theme={theme}
          id={`${idPrefix}-recipients`}
          value={adjustment.recipientCount}
          enrollment={enrollment}
          onChange={(recipientCount) => onChange({ recipientCount })}
        />
      </div>
    </div>
  );
}

function PercentField({
  theme,
  id,
  label,
  hundredths,
  onChange,
}: {
  theme: ParentThemeTokens;
  id: string;
  label: string;
  hundredths: number;
  onChange: (hundredths: number) => void;
}) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState(formatPercentHundredths(hundredths));
  const resting = formatPercentHundredths(hundredths);

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[12px] font-bold" style={{ color: theme.ink, fontFamily: theme.fontBody }}>
        {label}
      </label>
      <div
        className="flex h-12 items-center overflow-hidden"
        style={{
          border: `1px solid ${focused ? theme.primary : "#DDE4DA"}`,
          borderRadius: theme.radiusButton,
          backgroundColor: theme.white,
          boxShadow: focused ? `0 0 0 2px ${theme.primary}` : undefined,
        }}
      >
        <input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          value={focused ? draft : resting}
          onFocus={() => {
            setFocused(true);
            setDraft(resting);
          }}
          onChange={(event) => {
            const next = sanitizePercentDraft(event.target.value);
            setDraft(next);
            const parsed = parsePercentDraft(next);
            if (parsed !== null) onChange(parsed);
          }}
          onBlur={() => {
            const parsed = parsePercentDraft(draft);
            onChange(parsed ?? hundredths);
            setFocused(false);
          }}
          className={`min-w-0 flex-1 border-0 bg-transparent px-3 text-[15px] tabular-nums outline-none ${calculatorFocusClass}`}
          style={{ color: theme.ink, fontFamily: theme.fontBody }}
        />
        <span className="pr-3 text-[11px]" style={{ color: theme.muted }} aria-hidden="true">
          %
        </span>
      </div>
    </div>
  );
}

function RecipientField({
  theme,
  id,
  value,
  enrollment,
  onChange,
}: {
  theme: ParentThemeTokens;
  id: string;
  value: number;
  enrollment: number;
  onChange: (value: number) => void;
}) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState(String(value));

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[12px] font-bold" style={{ color: theme.ink, fontFamily: theme.fontBody }}>
        Students receiving this discount
      </label>
      <div
        className="flex h-12 items-center overflow-hidden"
        style={{
          border: `1px solid ${focused ? theme.primary : "#DDE4DA"}`,
          borderRadius: theme.radiusButton,
          backgroundColor: theme.white,
        }}
      >
        <input
          id={id}
          inputMode="numeric"
          autoComplete="off"
          value={focused ? draft : String(value)}
          onFocus={() => {
            setFocused(true);
            setDraft(value === 0 ? "" : String(value));
          }}
          onChange={(event) => {
            const digits = event.target.value.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
            setDraft(digits);
            if (!digits) {
              onChange(0);
              return;
            }
            const parsed = Number.parseInt(digits, 10);
            if (Number.isFinite(parsed)) onChange(Math.min(MAX_PLANNER_ENROLLMENT, parsed));
          }}
          onBlur={() => {
            if (!draft) onChange(0);
            setFocused(false);
          }}
          className={`min-w-0 flex-1 border-0 bg-transparent px-3 text-[15px] tabular-nums outline-none ${calculatorFocusClass}`}
          style={{ color: theme.ink, fontFamily: theme.fontBody }}
        />
        <span className="pr-3 text-[11px] whitespace-nowrap" style={{ color: theme.muted, fontFamily: theme.fontBody }}>
          of {enrollment} students
        </span>
      </div>
    </div>
  );
}

function PlannerDoneStep({
  theme,
  scenario,
  result,
  breakdownOpen,
  onToggleBreakdown,
  onViewResults,
}: {
  theme: ParentThemeTokens;
  scenario: Scenario;
  result: ScenarioComputation;
  breakdownOpen: boolean;
  onToggleBreakdown: () => void;
  onViewResults: () => void;
}) {
  const showRevenueTeaser = result.valid && result.netCents !== null;

  return (
    <div>
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
              {QUESTION_DONE_KICKER}
            </p>
            <h4
              className="mt-1.5 text-[24px] font-medium leading-snug tracking-[-0.035em]"
              style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
            >
              {QUESTION_DONE_TITLE}
            </h4>
            <p className="mt-2 text-[14px] leading-relaxed" style={{ color: theme.muted, fontFamily: theme.fontBody }}>
              {QUESTION_DONE_BODY}
            </p>
            {showRevenueTeaser ? (
              <p
                className="mt-3 text-[15px] font-bold tabular-nums"
                style={{ color: theme.primary, fontFamily: theme.fontBody }}
              >
                {questionDoneRevenueTeaser(formatCalculatorMoney(result.netCents!))}
              </p>
            ) : null}
            <p
              className="mt-3 hidden text-[12px] leading-relaxed min-[761px]:block"
              style={{ color: theme.muted, fontFamily: theme.fontBody }}
            >
              {QUESTION_DONE_DESKTOP_HINT}
            </p>
            <button
              type="button"
              data-planner-focus=""
              onClick={onViewResults}
              className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-[13px] font-bold min-[761px]:hidden ${plannerFocusClass}`}
              style={{
                backgroundColor: theme.primary,
                color: "#fff",
                fontFamily: theme.fontBody,
              }}
            >
              {VIEW_RESULTS_BUTTON}
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
      <div className="mt-5">
        <BreakdownDisclosure
          theme={theme}
          scenario={scenario}
          result={result}
          open={breakdownOpen}
          onToggle={onToggleBreakdown}
        />
      </div>
    </div>
  );
}

function BreakdownDisclosure({
  theme,
  scenario,
  result,
  open,
  onToggle,
}: {
  theme: ParentThemeTokens;
  scenario: Scenario;
  result: ScenarioComputation;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border" style={{ borderColor: theme.line, backgroundColor: "#FCFDFB" }}>
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className={`flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-[12px] font-bold ${plannerFocusClass}`}
        style={{ color: theme.ink, fontFamily: theme.fontBody }}
      >
        How this estimate adds up
        <ChevronDown
          className={`h-4 w-4 shrink-0 motion-safe:transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      {open ? (
        <div className="px-4 pb-4" style={{ fontFamily: theme.fontBody }}>
          {result.valid ? (
            <dl>
              {scenario.groups.map((group, index) => (
                <BreakdownRow
                  key={group.id}
                  theme={theme}
                  label={
                    scenario.groups.length > 1
                      ? `${group.label} · ${formatCalculatorMoney(group.monthlyTuitionCents)} × ${group.enrollment} × ${group.billingMonths}`
                      : `${formatCalculatorMoney(group.monthlyTuitionCents)} × ${group.enrollment} students × ${group.billingMonths} months`
                  }
                  cents={result.groups[index]?.grossCents ?? null}
                />
              ))}
              <BreakdownRow theme={theme} label="Sibling discounts" cents={result.annualSiblingDiscountCents} reduction />
              <BreakdownRow theme={theme} label="Scholarships" cents={result.annualScholarshipCents} reduction />
              <BreakdownRow theme={theme} label="Estimated annual tuition revenue" cents={result.netCents} strong />
            </dl>
          ) : (
            <p className="text-[12px] leading-relaxed" style={{ color: theme.muted }}>
              The breakdown appears once the highlighted assumptions are valid.
            </p>
          )}
          <p className="mt-3 text-[11px] leading-relaxed" style={{ color: theme.muted }}>
            {BREAKDOWN_ORDER}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function BreakdownRow({
  theme,
  label,
  cents,
  reduction = false,
  strong = false,
}: {
  theme: ParentThemeTokens;
  label: string;
  cents: number | null;
  reduction?: boolean;
  strong?: boolean;
}) {
  const amount =
    cents === null ? "—" : reduction && cents > 0 ? `−${formatCalculatorMoney(cents)}` : formatCalculatorMoney(cents);
  return (
    <div
      className={`flex items-baseline justify-between gap-4 py-2 text-[11px] ${strong ? "mt-1 border-t pt-2.5" : ""}`}
      style={{ borderColor: theme.line, color: strong ? theme.ink : theme.muted }}
    >
      <dt className={strong ? "font-bold" : "font-normal"} style={{ color: strong ? theme.ink : theme.muted }}>
        {label}
      </dt>
      <dd className={`tabular-nums ${strong ? "font-bold" : "font-semibold"}`} style={{ color: theme.ink }}>
        {amount}
      </dd>
    </div>
  );
}

function formatPercentHundredths(hundredths: number): string {
  const value = hundredths / 100;
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(2).replace(/0$/, "");
}

function sanitizePercentDraft(value: string): string {
  const cleaned = value.replace(/[^\d.]/g, "");
  const [whole = "", ...rest] = cleaned.split(".");
  const hasDot = rest.length > 0 || cleaned.endsWith(".");
  const fraction = rest.join("").slice(0, 2);
  const body = hasDot ? `${whole}.${fraction}` : whole;
  const parsed = Number.parseFloat(body);
  if (Number.isFinite(parsed) && parsed > 100) return "100";
  return body;
}

function parsePercentDraft(draft: string): number | null {
  if (!draft || draft === ".") return 0;
  if (draft.endsWith(".")) return null;
  const parsed = Number.parseFloat(draft);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return clampPercentHundredths(Math.round(parsed * 100));
}
