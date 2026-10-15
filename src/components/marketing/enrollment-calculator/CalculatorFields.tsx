"use client";

import { useId, useState } from "react";
import {
  formatCentsForInput,
  parseDollarInputToCents,
  sanitizeDollarDraft,
} from "@/lib/admissions/application-form-schema";
import {
  formatStudentCount,
  MAX_CALCULATOR_ENROLLMENT,
} from "@/lib/marketing/enrollment-calculator";
import CalculatorInfoTip from "@/components/marketing/enrollment-calculator/CalculatorInfoTip";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

export const calculatorFocusClass =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2E4A3C]";

function formatEditableDollars(cents: number): string {
  if (cents % 100 === 0) return String(cents / 100);
  return (cents / 100).toFixed(2);
}

function formatRestingDollars(cents: number): string {
  const hasCents = cents % 100 !== 0;
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  }).format(cents / 100);
}

type CalculatorMoneyFieldProps = {
  theme: ParentThemeTokens;
  id: string;
  label: string;
  description?: string;
  /** Visible help under the field. Replaces the info tip when set. */
  help?: string;
  /** Short unit shown on the right of the label, such as "per month". */
  unit?: string;
  /** Suffix inside the field, such as "/ month". */
  suffix?: string;
  /** Comparison shown on the right of the label, such as "Current: $800". */
  aside?: string;
  /** Shorter, bolder label used by the enrollment calculator. */
  dense?: boolean;
  valueCents: number;
  onChangeCents: (cents: number) => void;
  hideLabel?: boolean;
};

export function CalculatorMoneyField({
  theme,
  id,
  label,
  description,
  help,
  unit,
  suffix,
  aside,
  dense = false,
  valueCents,
  onChangeCents,
  hideLabel = false,
}: CalculatorMoneyFieldProps) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState(() => formatEditableDollars(valueCents));

  return (
    <div className="min-w-0 scroll-mt-40">
      <div className={hideLabel ? "sr-only" : "mb-2 flex items-center justify-between gap-3"}>
        <div className="flex min-w-0 items-start gap-1">
          <label
            htmlFor={id}
            className={`${dense ? "text-[13px] font-bold leading-snug" : "text-[14px] font-semibold leading-snug"} min-w-0`}
            style={{ color: theme.ink, fontFamily: theme.fontBody }}
          >
            {label}
          </label>
          {description && !help && !hideLabel ? (
            <CalculatorInfoTip theme={theme} content={description} label={label} />
          ) : null}
        </div>
        {(unit || aside) && !hideLabel ? (
          <span className="flex shrink-0 items-center gap-2">
            {aside ? (
              <span
                className="text-right text-[10px] font-medium"
                style={{ color: theme.muted, fontFamily: theme.fontBody }}
              >
                {aside}
              </span>
            ) : null}
            {unit ? (
              <span
                className="text-[11px] whitespace-nowrap"
                style={{ color: theme.muted, fontFamily: theme.fontBody }}
              >
                {unit}
              </span>
            ) : null}
          </span>
        ) : null}
      </div>
      <div
        className="flex h-12 w-full overflow-hidden"
        style={{
          border: `1px solid ${focused ? theme.primary : theme.line}`,
          borderRadius: theme.radiusButton,
          backgroundColor: theme.white,
          boxShadow: focused ? `0 0 0 3px ${theme.primarySoft}` : undefined,
        }}
      >
        <span
          className="flex w-11 shrink-0 items-center justify-center text-[15px] tabular-nums"
          style={{
            color: theme.muted,
            borderRight: `1px solid ${theme.line}`,
            backgroundColor: theme.cream,
            fontFamily: theme.fontBody,
          }}
          aria-hidden="true"
        >
          $
        </span>
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={focused ? draft : formatRestingDollars(valueCents)}
          placeholder="0"
          onFocus={() => {
            setFocused(true);
            setDraft(formatCentsForInput(valueCents).replace(/\.00$/, ""));
          }}
          onChange={(event) => {
            const nextDraft = sanitizeDollarDraft(event.target.value);
            setDraft(nextDraft);
            const parsed = parseDollarInputToCents(nextDraft);
            if (parsed !== null) onChangeCents(parsed);
          }}
          onBlur={() => {
            const parsed = parseDollarInputToCents(draft);
            const committed = parsed ?? valueCents;
            onChangeCents(committed);
            setDraft(formatEditableDollars(committed));
            setFocused(false);
          }}
          className={`min-w-0 flex-1 border-0 bg-transparent px-3 text-[16px] tabular-nums outline-none ${calculatorFocusClass}`}
          style={{ color: theme.ink, fontFamily: theme.fontBody }}
        />
        {suffix ? (
          <span
            className="flex shrink-0 items-center pr-3 text-[11px] whitespace-nowrap"
            style={{ color: theme.muted, fontFamily: theme.fontBody }}
          >
            {suffix}
          </span>
        ) : null}
      </div>
      {help ? (
        <p
          className="mt-2 text-[12px] leading-relaxed"
          style={{ color: theme.muted, fontFamily: theme.fontBody }}
        >
          {help}
        </p>
      ) : null}
    </div>
  );
}

type CalculatorCountFieldProps = {
  theme: ParentThemeTokens;
  id: string;
  label: string;
  description: string;
  /** Visible help. Replaces the info tip when set. */
  help?: string;
  /** Narrow input with help beside it. */
  layout?: "stack" | "beside";
  /** Appended to the slider end labels, such as "students". */
  rangeNoun?: string;
  /** Shorter, bolder label used by the enrollment calculator. */
  dense?: boolean;
  /** Comparison shown on the right of the label, such as "Current: 12". */
  aside?: string;
  /** Unit inside the field, such as "students". */
  suffix?: string;
  value: number;
  /** Slider ceiling. The typed value may be higher when `inputMax` is set. */
  max: number;
  /** Highest typed value. Defaults to the calculator's enrollment ceiling. */
  inputMax?: number;
  hideLabel?: boolean;
  onChange: (value: number) => void;
};

export function CalculatorCountField({
  theme,
  id,
  label,
  description,
  help,
  layout = "stack",
  rangeNoun,
  dense = false,
  aside,
  suffix,
  value,
  max,
  inputMax = MAX_CALCULATOR_ENROLLMENT,
  hideLabel = false,
  onChange,
}: CalculatorCountFieldProps) {
  const sliderId = useId();
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState(String(value));

  const commitDraft = (nextDraft: string) => {
    const digits = nextDraft.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
    setDraft(digits);
    if (!digits) {
      onChange(0);
      return;
    }
    const parsed = Number.parseInt(digits, 10);
    if (Number.isFinite(parsed)) {
      onChange(Math.min(inputMax, parsed));
    }
  };

  const input = (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      value={focused ? draft : String(value)}
      onFocus={() => {
        setFocused(true);
        setDraft(value === 0 ? "" : String(value));
      }}
      onChange={(event) => commitDraft(event.target.value)}
      onBlur={() => {
        if (!draft) onChange(0);
        setFocused(false);
      }}
      className={`h-12 px-3 text-[16px] tabular-nums ${
        suffix ? "min-w-0 flex-1 border-0 bg-transparent" : layout === "beside" ? "w-[110px] shrink-0" : "w-full"
      } ${calculatorFocusClass}`}
      style={{
        color: theme.ink,
        fontFamily: theme.fontBody,
        border: suffix ? undefined : `1px solid ${theme.line}`,
        borderRadius: suffix ? undefined : theme.radiusButton,
        backgroundColor: suffix ? "transparent" : theme.white,
      }}
    />
  );

  const control = suffix ? (
    <div
      className="flex h-12 w-full items-center overflow-hidden"
      style={{
        border: `1px solid ${focused ? theme.primary : theme.line}`,
        borderRadius: theme.radiusButton,
        backgroundColor: theme.cream,
        boxShadow: focused ? `0 0 0 3px ${theme.primarySoft}` : undefined,
      }}
    >
      {input}
      <span
        className="pr-3 text-[11px] whitespace-nowrap"
        style={{ color: theme.muted, fontFamily: theme.fontBody }}
      >
        {suffix}
      </span>
    </div>
  ) : (
    input
  );

  const rangeEnd = rangeNoun
    ? `${max.toLocaleString("en-US")} ${rangeNoun}`
    : max.toLocaleString("en-US");

  return (
    <div className="scroll-mt-40">
      <div className={hideLabel ? "sr-only" : "mb-2 flex items-start justify-between gap-2"}>
        <div className="flex min-w-0 items-start gap-1">
          <label
            htmlFor={id}
            className={`${dense ? "text-[13px] font-bold leading-snug" : "text-[14px] font-semibold leading-snug"} min-w-0`}
            style={{ color: theme.ink, fontFamily: theme.fontBody }}
          >
            {label}
          </label>
          {description && !help && !hideLabel ? (
            <CalculatorInfoTip
              theme={theme}
              content={description}
              label={label}
              placement="above"
              align="start"
            />
          ) : null}
        </div>
        {aside && !hideLabel ? (
          <span
            className="shrink-0 text-right text-[10px] font-medium"
            style={{ color: theme.muted, fontFamily: theme.fontBody }}
          >
            {aside}
          </span>
        ) : null}
      </div>
      {layout === "beside" ? (
        <div className="flex flex-wrap items-center gap-4">
          {control}
          {help ? (
            <p
              className="text-[12px] leading-relaxed"
              style={{ color: theme.muted, fontFamily: theme.fontBody }}
            >
              {help}
            </p>
          ) : null}
        </div>
      ) : (
        control
      )}
      <label htmlFor={sliderId} className="sr-only">
        {label} slider
      </label>
      <input
        id={sliderId}
        type="range"
        min={0}
        max={max}
        step={1}
        value={Math.min(value, max)}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={Math.min(value, max)}
        aria-valuetext={formatStudentCount(value)}
        onChange={(event) => onChange(Number.parseInt(event.target.value, 10))}
        className={`print:hidden ${layout === "beside" ? "mt-4" : "mt-3"} h-8 w-full cursor-pointer accent-[#2E4A3C] ${calculatorFocusClass}`}
      />
      <div
        className={`print:hidden mt-1 flex justify-between tabular-nums ${layout === "beside" ? "text-[11px]" : "text-[12px]"}`}
        style={{ color: theme.muted, fontFamily: theme.fontBody }}
      >
        <span>{rangeNoun ? `0 ${rangeNoun}` : "0"}</span>
        <span>{rangeEnd}</span>
      </div>
      {help && layout !== "beside" ? (
        <p className="mt-2 text-[12px] leading-relaxed" style={{ color: theme.muted, fontFamily: theme.fontBody }}>
          {help}
        </p>
      ) : null}
    </div>
  );
}
