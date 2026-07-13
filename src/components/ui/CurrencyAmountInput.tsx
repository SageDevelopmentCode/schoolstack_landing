"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import {
  formatCentsForInput,
  parseDollarInputToCents,
  sanitizeDollarDraft,
} from "@/lib/admissions/application-form-schema";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type CurrencyAmountInputProps = {
  C: AdminThemeTokens;
  valueCents: number;
  onChangeCents: (cents: number) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  style?: CSSProperties;
};

export default function CurrencyAmountInput({
  C,
  valueCents,
  onChangeCents,
  disabled = false,
  placeholder = "0.00",
  className,
  style,
}: CurrencyAmountInputProps) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState(() => formatCentsForInput(valueCents));

  const borderRadius = style?.borderRadius ?? C.r.sm;
  const fontSize = style?.fontSize ?? "12px";

  return (
    <div
      className={`flex w-full overflow-hidden ${className ?? ""}`}
      style={{
        border: `1px solid ${C.inputBorder}`,
        borderRadius,
        backgroundColor: C.input,
        opacity: disabled ? 0.7 : 1,
        ...style,
      }}
    >
      <span
        className="flex shrink-0 items-center px-2.5 tabular-nums"
        style={{
          color: C.textSecondary,
          fontSize,
          borderRight: `1px solid ${C.inputBorder}`,
          backgroundColor: C.elevated,
        }}
        aria-hidden="true"
      >
        $
      </span>
      <input
        type="text"
        inputMode="decimal"
        autoComplete="off"
        disabled={disabled}
        value={focused ? draft : formatCentsForInput(valueCents)}
        placeholder={placeholder}
        onFocus={() => {
          setFocused(true);
          setDraft(formatCentsForInput(valueCents));
        }}
        onChange={(event) => {
          const nextDraft = sanitizeDollarDraft(event.target.value);
          setDraft(nextDraft);
          const parsed = parseDollarInputToCents(nextDraft);
          if (parsed !== null) {
            onChangeCents(parsed);
          }
        }}
        onBlur={() => {
          const parsed = parseDollarInputToCents(draft);
          const committed = parsed ?? valueCents;
          onChangeCents(committed);
          setDraft(formatCentsForInput(committed));
          setFocused(false);
        }}
        className="min-w-0 flex-1 border-0 bg-transparent px-2.5 py-2 outline-none tabular-nums"
        style={{
          color: C.textPrimary,
          fontSize,
        }}
      />
    </div>
  );
}
