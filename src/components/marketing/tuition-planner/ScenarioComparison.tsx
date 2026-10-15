"use client";

import { formatCalculatorMoney } from "@/lib/marketing/enrollment-calculator";
import type { ComparisonDirection, ScenarioComparison as ScenarioComparisonResult } from "@/lib/marketing/tuition-scenario-planner";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { REVENUE_UNAVAILABLE } from "@/components/marketing/tuition-planner/planner-copy";
import { plannerFocusClass } from "@/components/marketing/tuition-planner/planner-theme";

export type ComparisonRow = {
  id: string;
  name: string;
  index: number;
  isBaseline: boolean;
  isSelected: boolean;
  netCents: number | null;
  comparison: ScenarioComparisonResult;
};

type ScenarioComparisonProps = {
  theme: ParentThemeTokens;
  baselineName: string;
  rows: ComparisonRow[];
  onSelect: (id: string) => void;
};

export function directionColor(theme: ParentThemeTokens, direction: ComparisonDirection): string {
  if (direction === "higher") return theme.success;
  if (direction === "lower") return theme.alert;
  if (direction === "baseline") return theme.primary;
  return theme.muted;
}

/** Bar and tab colors follow plan order: forest, sky, gold, then berry. */
export function planAccentColor(index: number): string {
  if (index === 0) return "#315E4F";
  if (index % 3 === 2) return "#EFC56E";
  if (index % 3 === 0) return "#A9667C";
  return "#8EBDCB";
}

function moneyLabel(cents: number | null): string {
  if (cents === null) return REVENUE_UNAVAILABLE;
  return formatCalculatorMoney(cents);
}

export default function ScenarioComparison({ theme, baselineName, rows, onSelect }: ScenarioComparisonProps) {
  const peak = rows.reduce((max, row) => Math.max(max, row.netCents ?? 0), 1);
  const summary = rows
    .map((row) => `${row.name}, ${moneyLabel(row.netCents)}. ${row.comparison.differenceLabel}.`)
    .join(" ");

  return (
    <section
      aria-labelledby="tuition-comparison-heading"
      className="rounded-[18px] border bg-white p-5"
      style={{ borderColor: "#E0E7E0", boxShadow: theme.shadowCard }}
    >
      <h3
        id="tuition-comparison-heading"
        className="text-[20px] font-medium tracking-[-0.035em]"
        style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
      >
        At a glance
      </h3>
      <p className="mt-1.5 text-[11px] leading-relaxed" style={{ color: theme.muted, fontFamily: theme.fontBody }}>
        Estimated annual tuition revenue for each plan.
      </p>
      <p className="sr-only">{summary}</p>
      <div className="mt-5 space-y-5">
        {rows.map((row) => {
          const width = row.netCents !== null && row.netCents > 0 ? Math.max(2, (row.netCents / peak) * 100) : 2;
          const viewing = row.isSelected ? " · viewing" : "";
          const baseline = row.isBaseline ? " · baseline" : "";
          return (
            <div key={row.id}>
              <div className="mb-2 flex items-center justify-between gap-3 text-[11px]">
                <button
                  type="button"
                  onClick={() => onSelect(row.id)}
                  className={`bg-transparent p-0 text-left ${plannerFocusClass}`}
                  style={{
                    color: row.isSelected ? theme.primary : theme.ink,
                    fontFamily: theme.fontBody,
                  }}
                >
                  {row.name}
                  {baseline}
                  {viewing}
                </button>
                <strong className="text-[12px] tabular-nums" style={{ color: theme.ink, fontFamily: theme.fontBody }}>
                  {moneyLabel(row.netCents)}
                </strong>
              </div>
              <div className="h-2 overflow-hidden rounded-full" style={{ backgroundColor: "#F1F5EF" }}>
                <div
                  className="h-full min-w-[2px] rounded-full motion-safe:transition-[width] motion-safe:duration-300"
                  style={{ width: `${width}%`, backgroundColor: planAccentColor(row.index) }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <p
        className="mt-5 border-t pt-3 text-[10px] leading-relaxed"
        style={{ borderColor: theme.line, color: theme.muted, fontFamily: theme.fontBody }}
      >
        {baselineName} is the baseline. Select any plan to explore it.
      </p>
    </section>
  );
}
