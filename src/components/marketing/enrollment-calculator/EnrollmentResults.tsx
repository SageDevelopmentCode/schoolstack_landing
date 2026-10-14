"use client";

import type { ReactNode } from "react";
import { Check, Flag } from "lucide-react";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentChip from "@/components/school-parent/ui/ParentChip";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import CalculatorInfoTip from "@/components/marketing/enrollment-calculator/CalculatorInfoTip";
import {
  availableForPayCents,
  CALCULATOR_COPY,
  heroExplain,
  payGapNote,
  todayChip,
  unreachableExplanation,
} from "@/components/marketing/enrollment-calculator/enrollment-copy";
import {
  formatCalculatorMoney,
  type EnrollmentEstimate,
  type MonthlyBreakdown,
} from "@/lib/marketing/enrollment-calculator";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type EnrollmentResultsProps = {
  theme: ParentThemeTokens;
  estimate: EnrollmentEstimate;
  todayBreakdown: MonthlyBreakdown;
  blank: boolean;
};

export default function EnrollmentResults({
  theme,
  estimate,
  todayBreakdown,
  blank,
}: EnrollmentResultsProps) {
  return (
    <div className="grid gap-[18px]" aria-label="Your results">
      <GoalHero theme={theme} estimate={estimate} blank={blank} />
      <TodaySnapshot theme={theme} estimate={estimate} todayBreakdown={todayBreakdown} blank={blank} />
    </div>
  );
}

function GoalHero({
  theme,
  estimate,
  blank,
}: {
  theme: ParentThemeTokens;
  estimate: EnrollmentEstimate;
  blank: boolean;
}) {
  const viable = !blank && estimate.viable && estimate.compensationTarget !== null;
  const target = viable ? estimate.compensationTarget : null;

  return (
    <ParentCard theme={theme} variant="primary" className="calculator-hero" data-testid="enrollment-goal">
      <ParentSectionKicker theme={theme} light className="!mb-2">
        {CALCULATOR_COPY.goalKicker}
      </ParentSectionKicker>
      <p className="mt-2 text-[13px] leading-relaxed" style={{ color: "#D8E6DB" }}>
        {CALCULATOR_COPY.goalQuestion}
      </p>
      <p className="mt-1 flex items-baseline gap-3">
        <strong
          data-testid="compensation-target"
          className="font-heading text-[clamp(4rem,8vw,4.75rem)] font-semibold leading-none tracking-[-0.06em] tabular-nums"
          style={{ fontFamily: theme.fontDisplay }}
        >
          {target === null ? "—" : target.toLocaleString("en-US")}
        </strong>
        <span className="text-[18px] font-medium" style={{ color: "#E5F0E7" }}>
          {target === 1 ? "student" : "students"}
        </span>
      </p>
      <p className="mt-2 max-w-[390px] text-[13px] leading-relaxed" style={{ color: "#D8E6DB" }}>
        {blank ? CALCULATOR_COPY.blankAnswer : heroExplain(estimate)}
      </p>
      <div
        className="mt-5 flex flex-wrap gap-2 border-t pt-4"
        style={{ borderColor: "rgba(255,255,255,0.16)" }}
      >
        <HeroStat>
          {formatCalculatorMoney(estimate.fixedExpensesCents)} school costs
        </HeroStat>
        <HeroStat>{formatCalculatorMoney(estimate.ownerCompensationCents)} your pay</HeroStat>
      </div>
    </ParentCard>
  );
}

function HeroStat({ children }: { children: ReactNode }) {
  return (
    <span
      className="rounded-md px-2 py-1.5 text-[11px]"
      style={{ color: "#E5F0E7", backgroundColor: "rgba(255,255,255,0.08)" }}
    >
      {children}
    </span>
  );
}

function TodaySnapshot({
  theme,
  estimate,
  todayBreakdown,
  blank,
}: {
  theme: ParentThemeTokens;
  estimate: EnrollmentEstimate;
  todayBreakdown: MonthlyBreakdown;
  blank: boolean;
}) {
  const availableCents = availableForPayCents(todayBreakdown);
  const chip = todayChip(estimate);
  const gap = payGapNote(estimate.ownerCompensationCents, availableCents);
  const showWarning = !blank && !estimate.viable;
  const studentLabel = estimate.currentEnrollment === 1 ? "student" : "students";

  return (
    <ParentCard theme={theme} data-testid="enrollment-results" style={{ overflow: "visible" }}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <h2
          className="font-heading text-[1.25rem] font-semibold leading-tight tracking-[-0.03em]"
          style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
        >
          {CALCULATOR_COPY.snapshotTitle}
        </h2>
        {blank ? null : (
          <ParentChip theme={theme} tone={chip.tone} className="!normal-case !tracking-normal">
            {chip.label}
          </ParentChip>
        )}
      </div>
      <p className="mb-4 text-[13px] leading-relaxed" style={{ color: theme.muted, fontFamily: theme.fontBody }}>
        With{" "}
        <strong style={{ color: theme.ink }}>
          {estimate.currentEnrollment.toLocaleString("en-US")} {studentLabel}
        </strong>
        , here&apos;s your monthly picture.
      </p>
      <MoneyRow theme={theme} label={CALCULATOR_COPY.rows.tuition} cents={todayBreakdown.revenueCents} />
      <MoneyRow
        theme={theme}
        label={CALCULATOR_COPY.rows.studentCosts}
        cents={todayBreakdown.variableCostsCents}
        deducted
      />
      <MoneyRow
        theme={theme}
        label={CALCULATOR_COPY.rows.operating}
        cents={todayBreakdown.fixedExpensesCents}
        deducted
      />
      <div
        className="mt-2 flex items-baseline justify-between gap-4 border-t pt-3 text-[13px] font-bold"
        style={{ borderColor: theme.line, color: theme.ink, fontFamily: theme.fontBody }}
      >
        <span>{CALCULATOR_COPY.rows.available}</span>
        <span
          className="font-heading text-[1.2rem] font-semibold tabular-nums"
          style={{ fontFamily: theme.fontDisplay }}
        >
          {formatCalculatorMoney(availableCents)}
        </span>
      </div>
      {blank ? null : <GapNote theme={theme} text={gap.text} tone={gap.tone} />}
      <div className="mt-4 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
        <Milestone
          theme={theme}
          label={CALCULATOR_COPY.milestoneCosts}
          help={CALCULATOR_COPY.milestoneCostsHelp}
          count={estimate.operatingBreakEven}
          dot={theme.sky}
          testId="operating-break-even"
        />
        <Milestone
          theme={theme}
          label={CALCULATOR_COPY.milestonePay}
          help={CALCULATOR_COPY.milestonePayHelp}
          count={estimate.compensationTarget}
          dot={theme.sun}
        />
      </div>
      {showWarning ? (
        <p
          className="mt-4 rounded-xl px-3.5 py-3 text-[13px] leading-relaxed"
          style={{
            color: theme.alert,
            backgroundColor: theme.alertBg,
            border: `1px solid ${theme.alert}`,
            fontFamily: theme.fontBody,
          }}
          role="status"
        >
          {unreachableExplanation(estimate)}
        </p>
      ) : null}
    </ParentCard>
  );
}

function MoneyRow({
  theme,
  label,
  cents,
  deducted = false,
}: {
  theme: ParentThemeTokens;
  label: string;
  cents: number;
  deducted?: boolean;
}) {
  const shown = deducted && cents > 0 ? formatCalculatorMoney(-cents) : formatCalculatorMoney(cents);
  return (
    <div
      className="flex items-center justify-between gap-4 py-2 text-[13px]"
      style={{ color: theme.muted, fontFamily: theme.fontBody }}
    >
      <span>{label}</span>
      <span className="font-semibold tabular-nums" style={{ color: theme.ink }}>
        {shown}
      </span>
    </div>
  );
}

function GapNote({
  theme,
  text,
  tone,
}: {
  theme: ParentThemeTokens;
  text: string;
  tone: "success" | "warning" | "alert";
}) {
  const palette =
    tone === "success"
      ? { bg: theme.successBg, color: theme.success, border: theme.success }
      : tone === "alert"
        ? { bg: theme.alertBg, color: theme.alert, border: theme.alert }
        : { bg: theme.warningBg, color: theme.warning, border: theme.warning };

  return (
    <div
      className="mt-4 flex items-start gap-2 rounded-[11px] px-3 py-3 text-[12px] leading-relaxed"
      style={{
        backgroundColor: palette.bg,
        color: palette.color,
        border: `1px solid ${palette.border}`,
        fontFamily: theme.fontBody,
      }}
    >
      {tone === "success" ? (
        <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      ) : (
        <Flag className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      )}
      <span>{text}</span>
    </div>
  );
}

function Milestone({
  theme,
  label,
  help,
  count,
  dot,
  testId,
}: {
  theme: ParentThemeTokens;
  label: string;
  help: string;
  count: number | null;
  dot: string;
  testId?: string;
}) {
  return (
    <div
      className="border px-3.5 py-3.5"
      style={{
        borderColor: theme.line,
        borderRadius: "13px",
        backgroundColor: theme.white,
      }}
    >
      <p
        className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold"
        style={{ color: theme.muted, fontFamily: theme.fontBody }}
      >
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dot }} />
        {label}
        <CalculatorInfoTip theme={theme} label={label} content={help} align="start" placement="above" />
      </p>
      <p className="leading-none">
        <strong
          data-testid={testId}
          className="font-heading text-[1.5rem] font-semibold tabular-nums"
          style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
        >
          {count === null ? "—" : count.toLocaleString("en-US")}
        </strong>
        <span className="ml-1 text-[11px]" style={{ color: theme.muted, fontFamily: theme.fontBody }}>
          {count === 1 ? "student" : "students"}
        </span>
      </p>
    </div>
  );
}
