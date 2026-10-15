"use client";

import { BarChart3 } from "lucide-react";
import { REVENUE_UNAVAILABLE } from "@/components/marketing/tuition-planner/planner-copy";
import { formatCalculatorMoney } from "@/lib/marketing/enrollment-calculator";
import type { ProgramGroup, Scenario, ScenarioComputation } from "@/lib/marketing/tuition-scenario-planner";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

export type PlannerResultRow = {
  scenario: Scenario;
  result: ScenarioComputation;
};

type PlannerResultColumnProps = {
  theme: ParentThemeTokens;
  row: PlannerResultRow;
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

function assumptionRows(row: PlannerResultRow): { label: string; value: string }[] {
  const tuition = summarizeTuition(row.scenario.groups);
  const enrollment = summarizeEnrollment(row.scenario.groups);
  const months = summarizeMonths(row.scenario.groups);
  const discounts = annualDiscountLabel(row.result);
  return [
    { label: "Monthly tuition", value: tuition },
    { label: "Enrollment", value: enrollment },
    { label: "Billing period", value: months },
    { label: "Annual discounts", value: discounts },
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

export default function PlannerResultColumn({ theme, row }: PlannerResultColumnProps) {
  const monthly = monthlyRevenueCents(row);
  const changes = assumptionRows(row);

  return (
    <aside
      id="planner-live-results"
      className="flex scroll-mt-24 flex-col gap-4 min-[761px]:sticky min-[761px]:top-[108px]"
      aria-label="Live revenue estimate"
    >
      <section
        aria-live="polite"
        aria-atomic="true"
        className="rounded-[22px] p-6 text-white"
        style={{ backgroundColor: theme.primary, boxShadow: theme.shadowCard }}
      >
        <div className="flex items-center justify-between gap-2.5">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.13em]" style={{ color: "#BDDEC4" }}>
            Annual tuition revenue
          </p>
          <BarChart3 className="h-4 w-4 shrink-0" style={{ color: "#BDDEC4" }} aria-hidden="true" />
        </div>
        <p
          className="mt-4 font-medium leading-none tracking-[-0.05em] tabular-nums"
          data-testid={`scenario-revenue-${row.scenario.id}`}
          style={{ fontFamily: theme.fontDisplay, fontSize: "43px" }}
        >
          {row.result.netCents === null ? "—" : formatCalculatorMoney(row.result.netCents)}
          {row.result.netCents === null ? <span className="sr-only"> {REVENUE_UNAVAILABLE}</span> : null}
        </p>
        <p className="mt-2 text-[12px] leading-relaxed" style={{ color: "#D8E6DB" }}>
          {row.result.valid ? resultSubtitle(row) : "Fix the highlighted assumptions to estimate revenue."}
        </p>
        <div
          className="mt-5 flex items-center justify-between gap-3 border-t pt-4 text-[11px]"
          style={{ borderColor: "rgba(255,255,255,0.18)", color: "#D8E6DB" }}
        >
          <span>Average per billing month</span>
          <strong className="text-[13px] text-white">{monthly === null ? "—" : formatCalculatorMoney(monthly)}</strong>
        </div>
      </section>

      <section
        className="rounded-[18px] border p-5"
        style={{ backgroundColor: theme.cream, borderColor: "#E0E7E0" }}
      >
        <h3
          className="text-[19px] font-medium tracking-[-0.035em]"
          style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
        >
          Your assumptions
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
      </section>
    </aside>
  );
}
