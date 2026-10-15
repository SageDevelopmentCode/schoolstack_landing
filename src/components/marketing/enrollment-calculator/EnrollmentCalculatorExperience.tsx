"use client";

import { useCallback, useMemo, useState } from "react";
import { ChevronDown, Download, RotateCcw } from "lucide-react";
import MondayCheckMudKitchenCallout from "@/components/marketing/monday-check/MondayCheckMudKitchenCallout";
import { calculatorFocusClass } from "@/components/marketing/enrollment-calculator/CalculatorFields";
import CalculatorDialog from "@/components/marketing/enrollment-calculator/CalculatorDialog";
import EnrollmentCalculatorShell from "@/components/marketing/enrollment-calculator/EnrollmentCalculatorShell";
import EnrollmentQuestionFlow from "@/components/marketing/enrollment-calculator/EnrollmentQuestionFlow";
import EnrollmentResults from "@/components/marketing/enrollment-calculator/EnrollmentResults";
import {
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
  monthlyBreakdown,
} from "@/lib/marketing/enrollment-calculator";
import {
  addEnrollmentTuitionGroup,
  enrollmentGroupsToCalculatorInput,
  removeEnrollmentTuitionGroup,
  starterEnrollmentGroups,
  totalEnrollmentFromGroups,
  type EnrollmentTuitionGroup,
} from "@/lib/marketing/enrollment-tuition-groups";
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
  const [tuitionGroups, setTuitionGroups] = useState(() =>
    starterEnrollmentGroups(EXAMPLE.tuitionCents, EXAMPLE.currentEnrollment),
  );
  const [wizardStep, setWizardStep] = useState(0);
  const [manualFixedCents, setManualFixedCents] = useState(EXAMPLE.manualFixedCents);
  const [variableCents, setVariableCents] = useState(EXAMPLE.variableCents);
  const [ownerCents, setOwnerCents] = useState(EXAMPLE.ownerCents);
  const [expenseMode, setExpenseMode] = useState<"manual" | "estimated">("manual");
  const [estimatorOpen, setEstimatorOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [categories, setCategories] = useState(starterCategories);

  const categoryTotal = expenseCategoryTotal(categories);
  const fixedExpensesCents = expenseMode === "estimated" ? categoryTotal : manualFixedCents;
  const currentEnrollment = totalEnrollmentFromGroups(tuitionGroups);
  const primaryTuitionCents = tuitionGroups[0]?.tuitionCents ?? 0;

  const input = useMemo(
    () => ({
      tuitionCents: primaryTuitionCents,
      fixedExpensesCents,
      variableCostPerStudentCents: variableCents,
      ownerCompensationCents: ownerCents,
      currentEnrollment,
      tuitionGroups: enrollmentGroupsToCalculatorInput(tuitionGroups),
    }),
    [primaryTuitionCents, fixedExpensesCents, variableCents, ownerCents, currentEnrollment, tuitionGroups],
  );

  const estimate = useMemo(() => computeEnrollmentEstimate(input), [input]);
  const todayBreakdown = useMemo(
    () => monthlyBreakdown(input, currentEnrollment),
    [input, currentEnrollment],
  );
  const blank =
    estimate.tuitionCents === 0 &&
    estimate.fixedExpensesCents === 0 &&
    estimate.variableCostPerStudentCents === 0 &&
    estimate.ownerCompensationCents === 0 &&
    estimate.currentEnrollment === 0;

  const currentSliderMax = enrollmentExploreMax(
    estimate.currentEnrollment,
    estimate.operatingBreakEven,
    estimate.compensationTarget,
    estimate.currentEnrollment,
  );
  const showMarginWarning = tuitionGroups.some(
    (group) => group.tuitionCents > 0 && variableCents >= group.tuitionCents,
  );

  const updateTuitionGroup = (
    groupId: string,
    patch: Partial<Pick<EnrollmentTuitionGroup, "label" | "tuitionCents" | "enrollment">>,
  ) => {
    setTuitionGroups((groups) =>
      groups.map((group) => {
        if (group.id !== groupId) return group;
        return {
          ...group,
          ...(patch.label !== undefined ? { label: patch.label } : {}),
          ...(patch.tuitionCents !== undefined ? { tuitionCents: patch.tuitionCents } : {}),
          ...(patch.enrollment !== undefined ? { enrollment: patch.enrollment } : {}),
        };
      }),
    );
  };

  const scrollToEnrollmentResults = useCallback(() => {
    document.getElementById("enrollment-calculator-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const restoreExample = () => {
    setTuitionGroups(starterEnrollmentGroups(EXAMPLE.tuitionCents, EXAMPLE.currentEnrollment));
    setWizardStep(0);
    setManualFixedCents(EXAMPLE.manualFixedCents);
    setVariableCents(EXAMPLE.variableCents);
    setOwnerCents(EXAMPLE.ownerCents);
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
        })}
      </p>

      <header className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-[40rem]">
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

      <div className="grid items-start gap-6 lg:grid-cols-2 lg:gap-[25px]">
        <ParentCard theme={theme} style={{ overflow: "visible" }}>
          <EnrollmentQuestionFlow
            theme={theme}
            stepIndex={wizardStep}
            onStepIndexChange={setWizardStep}
            tuitionGroups={tuitionGroups}
            onUpdateTuitionGroup={updateTuitionGroup}
            onAddTuitionGroup={() => setTuitionGroups((groups) => addEnrollmentTuitionGroup(groups))}
            onRemoveTuitionGroup={(groupId) =>
              setTuitionGroups((groups) => removeEnrollmentTuitionGroup(groups, groupId))
            }
            variableCents={variableCents}
            onVariableCents={setVariableCents}
            showMarginWarning={showMarginWarning}
            expenseMode={expenseMode}
            onExpenseModeChange={setExpenseMode}
            manualFixedCents={manualFixedCents}
            onManualFixedCents={setManualFixedCents}
            categories={categories}
            onCategoriesChange={setCategories}
            estimatorOpen={estimatorOpen}
            onEstimatorOpenChange={setEstimatorOpen}
            categoryTotal={categoryTotal}
            ownerCents={ownerCents}
            onOwnerCents={setOwnerCents}
            enrollmentSliderMax={currentSliderMax}
            estimate={estimate}
            onViewResults={scrollToEnrollmentResults}
          />
        </ParentCard>

        <aside id="enrollment-calculator-results" className="scroll-mt-24">
          <EnrollmentResults
            theme={theme}
            estimate={estimate}
            todayBreakdown={todayBreakdown}
            blank={blank}
          />
        </aside>
      </div>

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
