"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Download, RotateCcw, ShieldCheck, SlidersHorizontal } from "lucide-react";
import MondayCheckMudKitchenCallout from "@/components/marketing/monday-check/MondayCheckMudKitchenCallout";
import {
  CalculatorCountField,
  CalculatorMoneyField,
  calculatorFocusClass,
} from "@/components/marketing/enrollment-calculator/CalculatorFields";
import CalculatorDialog from "@/components/marketing/enrollment-calculator/CalculatorDialog";
import CalculatorInfoTip from "@/components/marketing/enrollment-calculator/CalculatorInfoTip";
import EnrollmentCalculatorShell from "@/components/marketing/enrollment-calculator/EnrollmentCalculatorShell";
import EnrollmentResults from "@/components/marketing/enrollment-calculator/EnrollmentResults";
import EnrollmentWhatIfControl from "@/components/marketing/enrollment-calculator/EnrollmentWhatIfControl";
import ExpenseEstimator, {
  expenseCategoryTotal,
  STARTER_EXPENSE_CATEGORIES,
  type ExpenseCategory,
} from "@/components/marketing/enrollment-calculator/ExpenseEstimator";
import {
  availableForPayCents,
  CALCULATOR_COPY,
  enrollmentLiveSummary,
  formulaContribution,
  formulaStudents,
} from "@/components/marketing/enrollment-calculator/enrollment-copy";
import {
  computeEnrollmentEstimate,
  enrollmentExploreMax,
  formatCalculatorMoney,
  monthlyBreakdown,
} from "@/lib/marketing/enrollment-calculator";
import { MUDKITCHEN_MARKETING_STORY_THEME } from "@/lib/marketing/mudkitchen-story-theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import ParentButton from "@/components/school-parent/ui/ParentButton";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import ParentTextLink from "@/components/school-parent/ui/ParentTextLink";

const EXAMPLE = {
  tuitionCents: 80_000,
  manualFixedCents: 800_000,
  variableCents: 5_000,
  ownerCents: 400_000,
  currentEnrollment: 12,
};

function starterCategories(): ExpenseCategory[] {
  return STARTER_EXPENSE_CATEGORIES.map((category) => ({ ...category }));
}

function calculatorTheme(): ParentThemeTokens {
  return {
    ...MUDKITCHEN_MARKETING_STORY_THEME,
    fontDisplay: "var(--font-fraunces), Georgia, serif",
    fontBody: "var(--font-dm-sans), system-ui, sans-serif",
  };
}

export default function EnrollmentCalculatorExperience() {
  const theme = calculatorTheme();
  const [tuitionCents, setTuitionCents] = useState(EXAMPLE.tuitionCents);
  const [manualFixedCents, setManualFixedCents] = useState(EXAMPLE.manualFixedCents);
  const [variableCents, setVariableCents] = useState(EXAMPLE.variableCents);
  const [ownerCents, setOwnerCents] = useState(EXAMPLE.ownerCents);
  const [currentEnrollment, setCurrentEnrollment] = useState(EXAMPLE.currentEnrollment);
  const [scenarioEnrollment, setScenarioEnrollment] = useState(EXAMPLE.currentEnrollment);
  const [expenseMode, setExpenseMode] = useState<"manual" | "estimated">("manual");
  const [estimatorOpen, setEstimatorOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [categories, setCategories] = useState(starterCategories);

  const categoryTotal = expenseCategoryTotal(categories);
  const fixedExpensesCents = expenseMode === "estimated" ? categoryTotal : manualFixedCents;

  const input = useMemo(
    () => ({
      tuitionCents,
      fixedExpensesCents,
      variableCostPerStudentCents: variableCents,
      ownerCompensationCents: ownerCents,
      currentEnrollment,
    }),
    [tuitionCents, fixedExpensesCents, variableCents, ownerCents, currentEnrollment],
  );

  const estimate = useMemo(() => computeEnrollmentEstimate(input), [input]);
  const todayBreakdown = useMemo(
    () => monthlyBreakdown(input, currentEnrollment),
    [input, currentEnrollment],
  );
  const scenarioBreakdown = useMemo(
    () => monthlyBreakdown(input, scenarioEnrollment),
    [input, scenarioEnrollment],
  );

  const blank =
    estimate.tuitionCents === 0 &&
    estimate.fixedExpensesCents === 0 &&
    estimate.variableCostPerStudentCents === 0 &&
    estimate.ownerCompensationCents === 0 &&
    estimate.currentEnrollment === 0 &&
    scenarioEnrollment === 0;

  const currentSliderMax = enrollmentExploreMax(
    estimate.currentEnrollment,
    estimate.operatingBreakEven,
    estimate.compensationTarget,
    estimate.currentEnrollment,
  );
  const exploreMax = enrollmentExploreMax(
    estimate.currentEnrollment,
    estimate.operatingBreakEven,
    estimate.compensationTarget,
    scenarioEnrollment,
  );

  const showMarginWarning = tuitionCents > 0 && variableCents >= tuitionCents;

  const restoreExample = () => {
    setTuitionCents(EXAMPLE.tuitionCents);
    setManualFixedCents(EXAMPLE.manualFixedCents);
    setVariableCents(EXAMPLE.variableCents);
    setOwnerCents(EXAMPLE.ownerCents);
    setCurrentEnrollment(EXAMPLE.currentEnrollment);
    setScenarioEnrollment(EXAMPLE.currentEnrollment);
    setExpenseMode("manual");
    setCategories(starterCategories());
    setResetOpen(false);
  };

  return (
    <EnrollmentCalculatorShell>
      <p className="sr-only" aria-live="polite">
        {enrollmentLiveSummary({
          blank,
          estimate,
          todayAvailableCents: availableForPayCents(todayBreakdown),
          scenarioEnrollment,
          scenarioAvailableCents: availableForPayCents(scenarioBreakdown),
        })}
      </p>

      <header className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-[40rem]">
          <ParentSectionKicker theme={theme}>{CALCULATOR_COPY.kicker}</ParentSectionKicker>
          <ParentDisplayHeading theme={theme} as="h1" className="!text-[clamp(1.875rem,4vw,2.7rem)]">
            {CALCULATOR_COPY.title}
          </ParentDisplayHeading>
          <p
            className="mt-3 text-[14px] leading-relaxed"
            style={{ color: theme.muted, fontFamily: theme.fontBody }}
          >
            {CALCULATOR_COPY.subtitle}
          </p>
        </div>
        <div className="calculator-print-hide flex shrink-0 items-center gap-4">
          <button
            type="button"
            onClick={() => setResetOpen(true)}
            className={`inline-flex items-center gap-1.5 text-[13px] font-bold ${calculatorFocusClass}`}
            style={{ color: theme.muted, fontFamily: theme.fontBody, borderRadius: theme.radiusButton }}
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            {CALCULATOR_COPY.startFresh}
          </button>
          <ParentButton theme={theme} variant="outline" onClick={() => window.print()}>
            <span className="inline-flex items-center gap-1.5">
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              {CALCULATOR_COPY.savePrint}
            </span>
          </ParentButton>
        </div>
      </header>

      <nav
        aria-label="Calculator steps"
        className="calculator-print-hide mb-7 flex items-center gap-2.5 border-b pb-5 sm:gap-5"
        style={{ borderColor: theme.line }}
      >
        {CALCULATOR_COPY.journey.map((label, index) => (
          <div key={label} className="contents">
            {index > 0 ? (
              <span
                aria-hidden="true"
                className="h-px max-w-8 flex-1 sm:max-w-[70px]"
                style={{ backgroundColor: "#DCE4DC" }}
              />
            ) : null}
            <div
              className="flex items-center gap-1.5 text-[10px] font-bold sm:gap-2 sm:text-[11px]"
              style={{
                color: index === 0 ? theme.primary : theme.muted,
                fontFamily: theme.fontBody,
              }}
            >
              <span
                className="grid h-[22px] w-[22px] place-items-center rounded-lg text-[10px] sm:h-6 sm:w-6"
                style={{ backgroundColor: "#EAF2EB", color: theme.primary }}
              >
                {index + 1}
              </span>
              {label}
            </div>
          </div>
        ))}
      </nav>

      <div className="grid items-start gap-6 lg:grid-cols-2 lg:gap-[25px]">
        <ParentCard theme={theme} style={{ overflow: "visible" }}>
          <div className="mb-6 flex items-start gap-3">
            <span
              className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-[11px]"
              style={{ backgroundColor: "#EAF2EB", color: theme.primary }}
              aria-hidden="true"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <h2
                  className="font-heading text-[1.4rem] font-semibold leading-tight tracking-[-0.03em]"
                  style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
                >
                  {CALCULATOR_COPY.inputsTitle}
                </h2>
                <CalculatorInfoTip
                  theme={theme}
                  label={CALCULATOR_COPY.inputsTitle}
                  content={CALCULATOR_COPY.inputsSubtitle}
                  align="start"
                />
              </div>
            </div>
          </div>

          <GroupLabel theme={theme}>{CALCULATOR_COPY.groups.tuition}</GroupLabel>
          <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2">
            <CalculatorMoneyField
              theme={theme}
              dense
              id="tuition"
              label={CALCULATOR_COPY.inputs.tuition}
              suffix={CALCULATOR_COPY.monthSuffix}
              valueCents={tuitionCents}
              onChangeCents={setTuitionCents}
            />
            <CalculatorMoneyField
              theme={theme}
              dense
              id="variable-cost"
              label={CALCULATOR_COPY.inputs.variableCost}
              description={CALCULATOR_COPY.help.studentCosts}
              suffix={CALCULATOR_COPY.monthSuffix}
              valueCents={variableCents}
              onChangeCents={setVariableCents}
            />
          </div>
          {showMarginWarning ? (
            <p
              className="mt-2 text-[13px] leading-relaxed"
              style={{ color: theme.alert, fontFamily: theme.fontBody }}
              role="status"
            >
              {CALCULATOR_COPY.tuitionTooLow}
            </p>
          ) : null}

          <div className="mt-6">
            <GroupLabel theme={theme}>{CALCULATOR_COPY.groups.operating}</GroupLabel>
            {expenseMode === "estimated" ? (
              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-1">
                    <p className="text-[13px] font-bold" style={{ color: theme.ink, fontFamily: theme.fontBody }}>
                      {CALCULATOR_COPY.inputs.fixedExpenses}
                    </p>
                    <CalculatorInfoTip
                      theme={theme}
                      label={CALCULATOR_COPY.inputs.fixedExpenses}
                      content={CALCULATOR_COPY.help.operating}
                      align="start"
                    />
                  </div>
                  <span className="text-[11px]" style={{ color: theme.muted, fontFamily: theme.fontBody }}>
                    {CALCULATOR_COPY.perMonth}
                  </span>
                </div>
                <p
                  className="font-heading text-[2rem] leading-none font-semibold tabular-nums"
                  style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
                  data-testid="fixed-expense-total"
                >
                  {formatCalculatorMoney(categoryTotal)}
                </p>
                <p className="mt-2 text-[12px]" style={{ color: theme.muted, fontFamily: theme.fontBody }}>
                  {CALCULATOR_COPY.help.fromList}
                </p>
              </div>
            ) : (
              <CalculatorMoneyField
                theme={theme}
                dense
                id="fixed-expenses"
                label={CALCULATOR_COPY.inputs.fixedExpenses}
                description={CALCULATOR_COPY.help.operating}
                unit={CALCULATOR_COPY.perMonth}
                valueCents={manualFixedCents}
                onChangeCents={setManualFixedCents}
              />
            )}
            <ExpenseEstimator
              theme={theme}
              open={estimatorOpen}
              onOpenChange={setEstimatorOpen}
              mode={expenseMode}
              onModeChange={setExpenseMode}
              categories={categories}
              onCategoriesChange={setCategories}
            />
          </div>

          <div className="mt-6">
            <GroupLabel theme={theme}>{CALCULATOR_COPY.groups.pay}</GroupLabel>
            <div
              className="rounded-[14px] border p-4"
              style={{ backgroundColor: "#F3F7F0", borderColor: "#DFE8DA" }}
            >
              <CalculatorMoneyField
                theme={theme}
                dense
                id="owner-compensation"
                label={CALCULATOR_COPY.inputs.ownerPay}
                description={CALCULATOR_COPY.help.pay}
                unit={CALCULATOR_COPY.perMonth}
                valueCents={ownerCents}
                onChangeCents={setOwnerCents}
              />
            </div>
          </div>

          <div className="mt-6">
            <GroupLabel theme={theme}>{CALCULATOR_COPY.groups.today}</GroupLabel>
            <CalculatorCountField
              theme={theme}
              dense
              rangeNoun="students"
              id="current-enrollment"
              label={CALCULATOR_COPY.inputs.currentEnrollment}
              description={CALCULATOR_COPY.help.current}
              value={currentEnrollment}
              max={currentSliderMax}
              onChange={setCurrentEnrollment}
            />
          </div>

          <p
            className="mt-6 flex items-start gap-2 border-t pt-4 text-[11px] leading-relaxed"
            style={{ borderColor: theme.line, color: theme.muted, fontFamily: theme.fontBody }}
          >
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {CALCULATOR_COPY.privacy}
          </p>
        </ParentCard>

        <EnrollmentResults
          theme={theme}
          estimate={estimate}
          todayBreakdown={todayBreakdown}
          blank={blank}
        />
      </div>

      <EnrollmentWhatIfControl
        theme={theme}
        value={scenarioEnrollment}
        max={exploreMax}
        currentEnrollment={estimate.currentEnrollment}
        operatingBreakEven={estimate.operatingBreakEven}
        compensationTarget={estimate.compensationTarget}
        onChange={setScenarioEnrollment}
        tuitionCents={estimate.tuitionCents}
        fixedExpensesCents={estimate.fixedExpensesCents}
        variableCostPerStudentCents={estimate.variableCostPerStudentCents}
        ownerCompensationCents={estimate.ownerCompensationCents}
      />

      <details
        className="group mt-6 border px-5"
        style={{
          borderColor: theme.line,
          borderRadius: "16px",
          backgroundColor: "rgba(255, 253, 249, 0.6)",
        }}
      >
        <summary
          className={`flex cursor-pointer list-none items-center justify-between py-4 text-[13px] font-bold [&::-webkit-details-marker]:hidden ${calculatorFocusClass}`}
          style={{ color: theme.ink, fontFamily: theme.fontBody, borderRadius: theme.radiusButton }}
        >
          {CALCULATOR_COPY.mathTitle}
          <ChevronDown
            aria-hidden="true"
            className="h-4 w-4 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
          />
        </summary>
        <div className="grid gap-5 pb-2 md:grid-cols-3">
          <MathStep
            theme={theme}
            kicker={CALCULATOR_COPY.mathSteps.contribution}
            detail={CALCULATOR_COPY.mathSteps.contributionDetail}
            result={formulaContribution(estimate)}
          />
          <MathStep
            theme={theme}
            kicker={CALCULATOR_COPY.mathSteps.costs}
            detail={CALCULATOR_COPY.mathSteps.costsDetail}
            result={formulaStudents(
              estimate.fixedExpensesCents,
              estimate.contributionCents,
              estimate.operatingBreakEven,
            )}
          />
          <MathStep
            theme={theme}
            kicker={CALCULATOR_COPY.mathSteps.pay}
            detail={CALCULATOR_COPY.mathSteps.payDetail}
            result={formulaStudents(
              estimate.fixedExpensesCents + estimate.ownerCompensationCents,
              estimate.contributionCents,
              estimate.compensationTarget,
            )}
          />
        </div>
        <p
          className="max-w-[940px] pb-5 text-[12px] leading-relaxed"
          style={{ color: theme.muted, fontFamily: theme.fontBody }}
        >
          {CALCULATOR_COPY.assumptions}
        </p>
      </details>

      <p
        className="print:hidden mt-8 text-[14px]"
        style={{ color: theme.ink, fontFamily: theme.fontBody }}
      >
        {CALCULATOR_COPY.tuitionPlannerLead}{" "}
        <ParentTextLink theme={theme} href="/tuition-planner" className="!text-[14px]">
          {CALCULATOR_COPY.tuitionPlannerLink}
        </ParentTextLink>
      </p>
      <div className="print:hidden mt-6">
        <MondayCheckMudKitchenCallout theme={theme}>
          <>
            Track the tuition behind this number in MudKitchen.{" "}
            <ParentTextLink theme={theme} href="/get-started" className="!text-[14px]">
              Book a demo
            </ParentTextLink>
          </>
        </MondayCheckMudKitchenCallout>
      </div>

      {resetOpen ? (
        <CalculatorDialog
          theme={theme}
          kicker={CALCULATOR_COPY.resetKicker}
          title={CALCULATOR_COPY.resetTitle}
          onClose={() => setResetOpen(false)}
          actions={
            <>
              <ParentButton theme={theme} variant="outline" onClick={() => setResetOpen(false)}>
                {CALCULATOR_COPY.keepNumbers}
              </ParentButton>
              <ParentButton theme={theme} onClick={restoreExample}>
                {CALCULATOR_COPY.resetConfirm}
              </ParentButton>
            </>
          }
        >
          <p className="text-[13px] leading-relaxed" style={{ color: theme.muted, fontFamily: theme.fontBody }}>
            {CALCULATOR_COPY.resetBody}
          </p>
        </CalculatorDialog>
      ) : null}
    </EnrollmentCalculatorShell>
  );
}

function GroupLabel({ theme, children }: { theme: ParentThemeTokens; children: string }) {
  return (
    <div
      className="mb-4 flex items-center gap-2 text-[10px] font-extrabold tracking-[0.1em] uppercase"
      style={{ color: "#759077", fontFamily: theme.fontBody }}
    >
      <span>{children}</span>
      <span aria-hidden="true" className="h-px flex-1" style={{ backgroundColor: theme.line }} />
    </div>
  );
}

function MathStep({
  theme,
  kicker,
  detail,
  result,
}: {
  theme: ParentThemeTokens;
  kicker: string;
  detail: string;
  result: string;
}) {
  return (
    <div>
      <ParentSectionKicker theme={theme} className="!mb-2">
        {kicker}
      </ParentSectionKicker>
      <p className="text-[12px] leading-relaxed" style={{ color: theme.muted, fontFamily: theme.fontBody }}>
        {detail}
        <br />
        <strong className="font-semibold" style={{ color: theme.ink }}>
          {result}
        </strong>
      </p>
    </div>
  );
}
