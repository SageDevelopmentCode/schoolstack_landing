"use client";

import { ArrowDown, ArrowUp, BarChart3, Check, Minus } from "lucide-react";
import ScenarioComparison from "@/components/marketing/tuition-planner/ScenarioComparison";
import { REVENUE_UNAVAILABLE } from "@/components/marketing/tuition-planner/planner-copy";
import { formatCalculatorMoney } from "@/lib/marketing/enrollment-calculator";
import type {
  ProgramGroup,
  Scenario,
  ScenarioComparison as ScenarioComparisonResult,
  ScenarioComputation,
} from "@/lib/marketing/tuition-scenario-planner";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

export type PlannerResultRow = {
  scenario: Scenario;
  result: ScenarioComputation;
  isBaseline: boolean;
  index: number;
  comparison: ScenarioComparisonResult;
  insights: string[];
};

type PlannerResultColumnProps = {
  theme: ParentThemeTokens;
  baselineName: string;
  selectedId: string;
  rows: PlannerResultRow[];
  onSelect: (id: string) => void;
};

function summarizeTuition(groups: ProgramGroup[]): string {
  if (groups.length === 1) {
    const group = groups[0];
    return group ? `${formatCalculatorMoney(group.monthlyTuitionCents)} / student` : "—";
  }
  return groups.map((group) => `${group.label} ${formatCalculatorMoney(group.monthlyTuitionCents)}`).join(" · ");
}

function summarizeEnrollment(groups: ProgramGroup[]): string {
  if (groups.length === 1) {
    const group = groups[0];
    return group ? `${group.enrollment} students` : "—";
  }
  return groups.map((group) => `${group.label} ${group.enrollment}`).join(" · ");
}

function summarizeMonths(groups: ProgramGroup[]): string {
  if (groups.length === 1) {
    const months = groups[0]?.billingMonths ?? 0;
    return `${months} ${months === 1 ? "month" : "months"}`;
  }
  return groups.map((group) => `${group.label} ${group.billingMonths}`).join(" · ");
}

function annualDiscountLabel(result: ScenarioComputation): string {
  if (result.annualSiblingDiscountCents === null || result.annualScholarshipCents === null) return "—";
  return formatCalculatorMoney(result.annualSiblingDiscountCents + result.annualScholarshipCents);
}

function changed(before: string, after: string): string {
  return before === after ? "Unchanged" : `${before} → ${after}`;
}

function assumptionRows(row: PlannerResultRow, baseline: PlannerResultRow | undefined): { label: string; value: string }[] {
  const tuition = summarizeTuition(row.scenario.groups);
  const enrollment = summarizeEnrollment(row.scenario.groups);
  const months = summarizeMonths(row.scenario.groups);
  const discounts = annualDiscountLabel(row.result);
  if (row.isBaseline || !baseline) {
    return [
      { label: "Monthly tuition", value: tuition },
      { label: "Enrollment", value: enrollment },
      { label: "Billing period", value: months },
      { label: "Annual discounts", value: discounts },
    ];
  }
  return [
    { label: "Monthly tuition", value: changed(summarizeTuition(baseline.scenario.groups), tuition) },
    { label: "Enrollment", value: changed(summarizeEnrollment(baseline.scenario.groups), enrollment) },
    { label: "Billing period", value: changed(summarizeMonths(baseline.scenario.groups), months) },
    { label: "Annual discounts", value: changed(annualDiscountLabel(baseline.result), discounts) },
  ];
}

function monthlyRevenueCents(row: PlannerResultRow): number | null {
  if (!row.result.valid || row.result.netCents === null) return null;
  const months = row.scenario.groups.map((group) => group.billingMonths);
  const shared = months.every((month) => month === months[0]);
  if (shared && months[0]) return Math.round(row.result.netCents / months[0]);
  let sum = 0;
  for (let index = 0; index < row.scenario.groups.length; index += 1) {
    const group = row.scenario.groups[index];
    const computed = row.result.groups[index];
    if (!group || !computed || computed.netCents === null || group.billingMonths < 1) return null;
    sum += Math.round(computed.netCents / group.billingMonths);
  }
  return sum;
}

function resultSubtitle(row: PlannerResultRow): string {
  const months = [...new Set(row.scenario.groups.map((group) => group.billingMonths))];
  const monthLabel =
    months.length === 1
      ? `${months[0]} billing ${months[0] === 1 ? "month" : "months"}`
      : "mixed billing months";
  const discount = row.result.hasReduction ? " · after discounts" : "";
  return `${row.result.totalStudents} students · ${monthLabel}${discount}`;
}

function deltaCopy(
  row: PlannerResultRow,
  baselineName: string,
  baselineNet: number | null,
): { main: string; detail: string } {
  const { comparison } = row;
  if (comparison.direction === "baseline") {
    return {
      main: "Your starting point",
      detail: "All proposed plans compare against these numbers.",
    };
  }
  if (comparison.direction === "unavailable") {
    return { main: REVENUE_UNAVAILABLE, detail: comparison.differenceLabel };
  }
  if (comparison.direction === "same") {
    return {
      main: "No revenue change",
      detail: `This plan brings in the same annual tuition revenue as ${baselineName}.`,
    };
  }
  const more = comparison.direction === "higher";
  const percent = comparison.percentageLabel;
  const percentSentence =
    percent && !percent.startsWith("Percentage")
      ? `${percent.replace(/^[+−-]/, "")} ${more ? "more" : "less"} than ${baselineName}.`
      : (percent ?? "");
  const baselineSentence =
    baselineNet === null ? "" : `${baselineName} estimates ${formatCalculatorMoney(baselineNet)} per year.`;
  return {
    main: comparison.differenceLabel,
    detail: [percentSentence, baselineSentence].filter(Boolean).join(" "),
  };
}

export default function PlannerResultColumn({
  theme,
  baselineName,
  selectedId,
  rows,
  onSelect,
}: PlannerResultColumnProps) {
  const selected = rows.find((row) => row.scenario.id === selectedId) ?? rows[0];
  const baseline = rows.find((row) => row.isBaseline);
  if (!selected) return null;

  const monthly = monthlyRevenueCents(selected);
  const delta = deltaCopy(selected, baselineName, baseline?.result.netCents ?? null);
  const changes = assumptionRows(selected, baseline);
  const DeltaIcon =
    selected.comparison.direction === "higher"
      ? ArrowUp
      : selected.comparison.direction === "lower"
        ? ArrowDown
        : selected.comparison.direction === "same"
          ? Minus
          : Check;

  return (
    <aside className="flex flex-col gap-4 min-[761px]:sticky min-[761px]:top-[108px]" aria-label="Live revenue comparison">
      <section
        aria-live="polite"
        aria-atomic="true"
        className="rounded-[22px] p-6 text-white"
        style={{ backgroundColor: theme.primary, boxShadow: theme.shadowCard }}
      >
        <div className="flex items-center justify-between gap-2.5">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.13em]" style={{ color: "#BDDEC4" }}>
            {selected.scenario.name} · annual tuition revenue
          </p>
          <BarChart3 className="h-4 w-4 shrink-0" style={{ color: "#BDDEC4" }} aria-hidden="true" />
        </div>
        <p
          className="mt-4 font-medium leading-none tracking-[-0.05em] tabular-nums"
          data-testid={`scenario-revenue-${selected.scenario.id}`}
          style={{ fontFamily: theme.fontDisplay, fontSize: "43px" }}
        >
          {selected.result.netCents === null ? "—" : formatCalculatorMoney(selected.result.netCents)}
          {selected.result.netCents === null ? <span className="sr-only"> {REVENUE_UNAVAILABLE}</span> : null}
        </p>
        <p className="mt-2 text-[12px] leading-relaxed" style={{ color: "#D8E6DB" }}>
          {selected.result.valid ? resultSubtitle(selected) : "Fix the highlighted assumptions to estimate revenue."}
        </p>
        <div
          className="mt-6 rounded-[13px] border p-4"
          style={{ backgroundColor: "rgba(255,255,255,0.09)", borderColor: "rgba(255,255,255,0.13)" }}
        >
          <div
            className="flex items-center gap-1.5 text-[20px] font-bold tracking-[-0.03em]"
            data-testid={`scenario-difference-${selected.scenario.id}`}
          >
            <DeltaIcon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
            <span>{delta.main}</span>
          </div>
          {delta.detail ? (
            <p className="mt-1.5 text-[11px] leading-relaxed" style={{ color: "#D8E6DB" }}>
              {delta.detail}
            </p>
          ) : null}
        </div>
        <div
          className="mt-5 flex items-center justify-between gap-3 border-t pt-4 text-[11px]"
          style={{ borderColor: "rgba(255,255,255,0.18)", color: "#D8E6DB" }}
        >
          <span>Average per billing month</span>
          <strong className="text-[13px] text-white">{monthly === null ? "—" : formatCalculatorMoney(monthly)}</strong>
        </div>
      </section>

      <ScenarioComparison
        theme={theme}
        baselineName={baselineName}
        onSelect={onSelect}
        rows={rows.map((row) => ({
          id: row.scenario.id,
          name: row.scenario.name,
          index: row.index,
          isBaseline: row.isBaseline,
          isSelected: row.scenario.id === selectedId,
          netCents: row.result.netCents,
          comparison: row.comparison,
        }))}
      />

      <section
        className="rounded-[18px] border p-5"
        style={{ backgroundColor: theme.cream, borderColor: "#E0E7E0" }}
      >
        <h3
          className="text-[19px] font-medium tracking-[-0.035em]"
          style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
        >
          {selected.isBaseline ? "Your baseline" : "What changed?"}
        </h3>
        <div className="mt-1">
          {changes.map((change) => (
            <div
              key={change.label}
              className="flex items-start justify-between gap-3.5 border-b py-2.5 text-[11px] last:border-b-0 last:pb-0"
              style={{ borderColor: theme.line }}
            >
              <span style={{ color: theme.muted, fontFamily: theme.fontBody }}>{change.label}</span>
              <strong className="text-right font-semibold" style={{ color: theme.ink, fontFamily: theme.fontBody }}>
                {change.value}
              </strong>
            </div>
          ))}
        </div>
        {selected.insights.length > 0 ? (
          <div className="mt-3 space-y-1.5 border-t pt-3" style={{ borderColor: theme.line }}>
            {selected.insights.map((line) => (
              <p key={line} className="text-[11px] leading-relaxed" style={{ color: theme.muted, fontFamily: theme.fontBody }}>
                {line}
              </p>
            ))}
          </div>
        ) : null}
      </section>
    </aside>
  );
}
