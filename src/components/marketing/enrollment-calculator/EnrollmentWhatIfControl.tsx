"use client";

import { useId, useState } from "react";
import { FlaskConical } from "lucide-react";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import { calculatorFocusClass } from "@/components/marketing/enrollment-calculator/CalculatorFields";
import CalculatorInfoTip from "@/components/marketing/enrollment-calculator/CalculatorInfoTip";
import {
  availableForPayCents,
  CALCULATOR_COPY,
  payGoalCoverage,
  scenarioDescription,
  scenarioKicker,
} from "@/components/marketing/enrollment-calculator/enrollment-copy";
import {
  formatCalculatorMoney,
  formatStudentCount,
  MAX_CALCULATOR_ENROLLMENT,
  monthlyBreakdown,
} from "@/lib/marketing/enrollment-calculator";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type EnrollmentWhatIfControlProps = {
  theme: ParentThemeTokens;
  value: number;
  max: number;
  currentEnrollment: number;
  operatingBreakEven: number | null;
  compensationTarget: number | null;
  onChange: (value: number) => void;
  tuitionCents: number;
  fixedExpensesCents: number;
  variableCostPerStudentCents: number;
  ownerCompensationCents: number;
};

export default function EnrollmentWhatIfControl({
  theme,
  value,
  max,
  currentEnrollment,
  operatingBreakEven,
  compensationTarget,
  onChange,
  tuitionCents,
  fixedExpensesCents,
  variableCostPerStudentCents,
  ownerCompensationCents,
}: EnrollmentWhatIfControlProps) {
  const inputId = useId();
  const sliderId = useId();
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const shownDraft = focused ? draft : String(value);
  const clampedSlider = Math.min(value, max);

  const breakdown = monthlyBreakdown(
    {
      tuitionCents,
      fixedExpensesCents,
      variableCostPerStudentCents,
      ownerCompensationCents,
      currentEnrollment,
    },
    value,
  );
  const availableCents = availableForPayCents(breakdown);
  const shortfall = availableCents < 0;
  const coverage = payGoalCoverage(availableCents, ownerCompensationCents);
  const description = scenarioDescription(availableCents, ownerCompensationCents);

  const picks: { id: string; label: string; next: number | null }[] = [
    { id: "today", label: `Today · ${currentEnrollment.toLocaleString("en-US")}`, next: currentEnrollment },
    {
      id: "costs",
      label: `Cover costs · ${operatingBreakEven === null ? "—" : operatingBreakEven.toLocaleString("en-US")}`,
      next: operatingBreakEven,
    },
    {
      id: "goal",
      label: `Pay goal · ${compensationTarget === null ? "—" : compensationTarget.toLocaleString("en-US")}`,
      next: compensationTarget,
    },
    {
      id: "plus",
      label: `Today + 5 · ${(currentEnrollment + 5).toLocaleString("en-US")}`,
      next: currentEnrollment + 5,
    },
  ];

  const setScenario = (next: number) => {
    onChange(Math.min(MAX_CALCULATOR_ENROLLMENT, Math.max(0, Math.floor(next))));
  };

  return (
    <ParentCard theme={theme} className="mt-6" data-testid="enrollment-scenario" style={{ overflow: "visible" }}>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <ParentSectionKicker theme={theme}>{CALCULATOR_COPY.scenarioKicker}</ParentSectionKicker>
          <div className="flex items-center gap-1.5">
            <h2
              className="font-heading text-[1.55rem] font-semibold leading-tight tracking-[-0.03em]"
              style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
            >
              {CALCULATOR_COPY.scenarioTitle}
            </h2>
            <CalculatorInfoTip
              theme={theme}
              label={CALCULATOR_COPY.scenarioTitle}
              content={CALCULATOR_COPY.scenarioBody}
              align="start"
            />
          </div>
        </div>
        <span
          className="inline-flex w-fit items-center gap-1.5 rounded-lg px-2.5 py-2 text-[11px] font-bold whitespace-nowrap"
          style={{ color: theme.primary, backgroundColor: theme.primarySoft, fontFamily: theme.fontBody }}
        >
          <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
          {CALCULATOR_COPY.scenarioBadge}
        </span>
      </div>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
        <div
          className="border-b pb-6 lg:border-r lg:border-b-0 lg:pr-8 lg:pb-0"
          style={{ borderColor: theme.line }}
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <label
              htmlFor={inputId}
              className="text-[13px] font-bold"
              style={{ color: theme.ink, fontFamily: theme.fontBody }}
            >
              {CALCULATOR_COPY.scenarioLabel}
            </label>
            <div
              className="flex shrink-0 overflow-hidden border bg-white"
              style={{ borderColor: theme.line, borderRadius: theme.radiusButton }}
            >
              <button
                type="button"
                aria-label="Decrease scenario students"
                disabled={value === 0}
                onClick={() => setScenario(value - 1)}
                className={`h-11 w-9 text-[19px] disabled:opacity-40 ${calculatorFocusClass}`}
                style={{ color: theme.primary, backgroundColor: "#F4F7F5" }}
              >
                −
              </button>
              <input
                id={inputId}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={shownDraft}
                onFocus={() => {
                  setFocused(true);
                  setDraft(value === 0 ? "" : String(value));
                }}
                onChange={(event) => {
                  const digits = event.target.value.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
                  if (!digits) {
                    setDraft("");
                    onChange(0);
                    return;
                  }
                  const parsed = Math.min(MAX_CALCULATOR_ENROLLMENT, Number.parseInt(digits, 10));
                  setDraft(String(parsed));
                  onChange(parsed);
                }}
                onBlur={() => setFocused(false)}
                className={`w-14 border-0 bg-transparent text-center text-[19px] font-bold tabular-nums outline-none ${calculatorFocusClass}`}
                style={{ color: theme.ink, fontFamily: theme.fontBody }}
              />
              <button
                type="button"
                aria-label="Increase scenario students"
                onClick={() => setScenario(value + 1)}
                className={`h-11 w-9 text-[19px] ${calculatorFocusClass}`}
                style={{ color: theme.primary, backgroundColor: "#F4F7F5" }}
              >
                +
              </button>
            </div>
          </div>
          <label htmlFor={sliderId} className="sr-only">
            Scenario students
          </label>
          <input
            id={sliderId}
            type="range"
            min={0}
            max={max}
            step={1}
            value={clampedSlider}
            aria-valuemin={0}
            aria-valuemax={max}
            aria-valuenow={value}
            aria-valuetext={formatStudentCount(value)}
            onChange={(event) => setScenario(Number.parseInt(event.target.value, 10))}
            className={`print:hidden h-8 w-full cursor-pointer accent-[#2E4A3C] ${calculatorFocusClass}`}
          />
          <div
            className="print:hidden mt-1 flex justify-between text-[11px] tabular-nums"
            style={{ color: theme.muted, fontFamily: theme.fontBody }}
          >
            <span>0 students</span>
            <span>{max.toLocaleString("en-US")} students</span>
          </div>
          <div className="print:hidden mt-4 flex flex-wrap gap-1.5">
            {picks.map((pick) => {
              const active = pick.next !== null && value === pick.next;
              return (
                <button
                  key={pick.id}
                  type="button"
                  disabled={pick.next === null}
                  onClick={() => {
                    if (pick.next !== null) setScenario(pick.next);
                  }}
                  className={`rounded-lg border px-2.5 py-2 text-[11px] disabled:opacity-50 ${calculatorFocusClass}`}
                  style={{
                    fontFamily: theme.fontBody,
                    borderColor: active ? "#BCD4C1" : theme.line,
                    backgroundColor: active ? "#E9F2EA" : theme.white,
                    color: active ? theme.primary : theme.muted,
                    fontWeight: active ? 700 : 500,
                  }}
                >
                  {pick.label}
                </button>
              );
            })}
          </div>
        </div>

        <div aria-live="polite" aria-atomic="true">
          <ParentSectionKicker theme={theme} className="!mb-2">
            {scenarioKicker(availableCents, value)}
          </ParentSectionKicker>
          <p className="leading-none">
            <span
              className="font-heading text-[clamp(2rem,4vw,2.6rem)] font-semibold tracking-[-0.04em] tabular-nums"
              style={{ color: shortfall ? theme.alert : theme.ink, fontFamily: theme.fontDisplay }}
            >
              {formatCalculatorMoney(Math.abs(availableCents))}
            </span>
            <span className="ml-1 text-[12px]" style={{ color: theme.muted, fontFamily: theme.fontBody }}>
              / month
            </span>
          </p>
          <p className="mt-2.5 text-[13px] leading-relaxed" style={{ color: theme.muted, fontFamily: theme.fontBody }}>
            {description}
          </p>
          <div
            className="mt-4 grid grid-cols-2 gap-3.5 border-t pt-4"
            style={{ borderColor: theme.line }}
          >
            <Detail theme={theme} label={CALCULATOR_COPY.scenarioTuition} value={formatCalculatorMoney(breakdown.revenueCents)} />
            <Detail
              theme={theme}
              label={CALCULATOR_COPY.scenarioCosts}
              value={formatCalculatorMoney(breakdown.fixedExpensesCents + breakdown.variableCostsCents)}
            />
          </div>
          <div className="mt-4">
            <div
              className="h-1.5 overflow-hidden rounded-lg"
              style={{ backgroundColor: "#EDF0E8" }}
              role="progressbar"
              aria-label="Monthly pay goal covered"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={coverage.percent}
            >
              <div
                className="h-full rounded-lg motion-reduce:transition-none"
                style={{
                  width: `${coverage.percent}%`,
                  backgroundColor: theme.primary,
                  transition: "width 200ms cubic-bezier(.16,1,.3,1)",
                }}
              />
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed" style={{ color: theme.muted, fontFamily: theme.fontBody }}>
              {coverage.note}
            </p>
          </div>
        </div>
      </div>
    </ParentCard>
  );
}

function Detail({
  theme,
  label,
  value,
}: {
  theme: ParentThemeTokens;
  label: string;
  value: string;
}) {
  return (
    <div>
      <span className="block text-[11px] leading-relaxed" style={{ color: theme.muted, fontFamily: theme.fontBody }}>
        {label}
      </span>
      <strong className="mt-1 block text-[14px]" style={{ color: theme.ink, fontFamily: theme.fontBody }}>
        {value}
      </strong>
    </div>
  );
}
