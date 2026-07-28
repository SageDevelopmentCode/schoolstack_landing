"use client";

import { Check, Plus } from "lucide-react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

function inputStyle(C: AdminThemeTokens): React.CSSProperties {
  return {
    backgroundColor: C.input,
    border: `1px solid ${C.inputBorder}`,
    color: C.textPrimary,
    borderRadius: C.r.md,
    fontSize: "14px",
    padding: "10px 12px",
    width: "100%",
    boxSizing: "border-box",
    outline: "none",
  };
}

export function ScheduleCardShell({
  C,
  selected,
  children,
}: {
  C: AdminThemeTokens;
  selected: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-lg p-4"
      style={{
        border: `1px solid ${selected ? C.accent : C.border}`,
        backgroundColor: selected ? C.accentLight : C.surface,
      }}
    >
      {children}
    </div>
  );
}

export function AddScheduleCard({
  C,
  expanded,
  customCount,
  customInputMax,
  maxInstallments,
  onExpand,
  onCollapse,
  onCustomCountChange,
  onAdd,
}: {
  C: AdminThemeTokens;
  expanded: boolean;
  customCount: string;
  customInputMax: number;
  maxInstallments: number | null;
  onExpand: () => void;
  onCollapse: () => void;
  onCustomCountChange: (value: string) => void;
  onAdd: () => void;
}) {
  if (!expanded) {
    return (
      <button
        type="button"
        onClick={onExpand}
        className="rounded-lg p-4 flex flex-col items-center justify-center gap-2 min-h-[108px] w-full transition-colors"
        style={{
          border: `1px dashed ${C.borderStrong}`,
          backgroundColor: C.surface,
          color: C.textTertiary,
        }}
      >
        <Plus className="h-5 w-5" />
        <span className="text-sm font-medium">Add a custom payment schedule</span>
      </button>
    );
  }

  return (
    <div
      className="rounded-lg p-4 flex flex-col gap-3 min-h-[108px]"
      style={{
        border: `1px dashed ${C.borderStrong}`,
        backgroundColor: C.surface,
      }}
    >
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium" style={{ color: C.textPrimary }}>
          How many payments should this schedule have?
        </span>
        <span className="text-xs" style={{ color: C.textTertiary }}>
          e.g. 6 for six equal installments across the school year
        </span>
        <input
          style={inputStyle(C)}
          type="number"
          min={1}
          max={customInputMax}
          placeholder="e.g. 6"
          value={customCount}
          autoFocus
          onChange={(e) => onCustomCountChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAdd();
            }
            if (e.key === "Escape") {
              e.preventDefault();
              onCollapse();
            }
          }}
        />
      </label>
      {maxInstallments != null ? (
        <p className="text-xs" style={{ color: C.textTertiary }}>
          Up to {maxInstallments} installments for your school year
        </p>
      ) : null}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md font-medium"
          style={{
            backgroundColor: C.accentLight,
            color: C.accent,
            border: `1px solid ${C.accent}`,
          }}
        >
          Add
        </button>
        <button
          type="button"
          onClick={onCollapse}
          className="text-sm px-3 py-1.5 rounded-md"
          style={{ color: C.textSecondary }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export function ScheduleSelectionToggle({
  C,
  selected,
  onToggle,
  ariaLabel,
}: {
  C: AdminThemeTokens;
  selected: boolean;
  onToggle: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      aria-label={ariaLabel}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onToggle();
      }}
      className="shrink-0 flex items-center justify-center rounded-md p-2 -m-2 min-h-[44px] min-w-[44px]"
    >
      <span
        className="flex h-[22px] w-[22px] items-center justify-center rounded-md transition-colors"
        style={{
          border: `2px solid ${selected ? C.accent : C.borderStrong}`,
          backgroundColor: selected ? C.accent : C.surface,
        }}
      >
        {selected ? <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} /> : null}
      </span>
    </button>
  );
}

export function AdminScheduleCard({
  C,
  selected,
  label,
  cadence,
  perPayment,
  annualTotal,
  onToggle,
  compact = false,
  isDefault = false,
  showDefaultControl = false,
  onSetDefault,
}: {
  C: AdminThemeTokens;
  selected: boolean;
  label: string;
  cadence: string;
  perPayment: string;
  annualTotal: string;
  onToggle: () => void;
  compact?: boolean;
  isDefault?: boolean;
  showDefaultControl?: boolean;
  onSetDefault?: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-3 ${compact ? "flex-1 min-w-0" : ""}`}
    >
      <ScheduleSelectionToggle
        C={C}
        selected={selected}
        onToggle={onToggle}
        ariaLabel={`${selected ? "Deselect" : "Select"} ${label}`}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
          {label}
        </p>
        <p className="text-xs mt-0.5" style={{ color: C.textTertiary }}>
          {cadence}
        </p>
        <p className="text-xs mt-1.5" style={{ color: C.textSecondary }}>
          {perPayment} per payment · {annualTotal}/yr
        </p>
        {isDefault ? (
          <span
            className="inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-2"
            style={{ backgroundColor: C.accentLight, color: C.accent }}
          >
            Default
          </span>
        ) : showDefaultControl ? (
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onSetDefault?.();
            }}
            className="text-xs font-medium mt-2 underline-offset-2 hover:underline"
            style={{ color: C.accent }}
          >
            Set as default
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function PaymentScheduleSelectionCard({
  C,
  selected,
  label,
  cadence,
  perPayment,
  annualTotal,
  onSelect,
}: {
  C: AdminThemeTokens;
  selected: boolean;
  label: string;
  cadence: string;
  perPayment: string;
  annualTotal: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full text-left rounded-lg p-4 transition-colors"
      style={{
        border: `1px solid ${selected ? C.accent : C.border}`,
        backgroundColor: selected ? C.accentLight : C.surface,
      }}
    >
      <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
        {label}
      </p>
      <p className="text-xs mt-0.5" style={{ color: C.textTertiary }}>
        {cadence}
      </p>
      <p className="text-xs mt-1.5" style={{ color: C.textSecondary }}>
        {perPayment} per payment · {annualTotal}/yr
      </p>
    </button>
  );
}

export function TierSelectionCard({
  C,
  selected,
  label,
  amountLabel,
  onSelect,
  isDefault = false,
}: {
  C: AdminThemeTokens;
  selected: boolean;
  label: string;
  amountLabel: string;
  onSelect: () => void;
  isDefault?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full text-left rounded-lg p-4 transition-colors"
      style={{
        border: `1px solid ${selected ? C.accent : C.border}`,
        backgroundColor: selected ? C.accentLight : C.surface,
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
          {label}
        </p>
        <span className="text-sm tabular-nums shrink-0" style={{ color: C.textSecondary }}>
          {amountLabel}
        </span>
      </div>
      {isDefault ? (
        <span
          className="inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-2"
          style={{ backgroundColor: C.accentLight, color: C.accent }}
        >
          Default rate
        </span>
      ) : null}
    </button>
  );
}
