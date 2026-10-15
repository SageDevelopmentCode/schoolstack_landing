"use client";

import { useState } from "react";
import {
  CalculatorMoneyField,
  calculatorFocusClass,
} from "@/components/marketing/enrollment-calculator/CalculatorFields";
import { TUITION_HELP } from "@/components/marketing/tuition-planner/planner-copy";
import { plannerFocusClass } from "@/components/marketing/tuition-planner/planner-theme";
import { MAX_PROGRAM_GROUPS } from "@/lib/marketing/tuition-scenario-state";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

export type MarketingTuitionGroup = {
  id: string;
  label: string;
  monthlyTuitionCents: number;
};

export function enrollmentFieldLabel(groupLabel: string): string {
  const trimmed = groupLabel.trim();
  return trimmed ? `${trimmed} students` : "Students";
}

type MarketingTuitionGroupsStepProps = {
  theme: ParentThemeTokens;
  fieldIdPrefix: string;
  groups: MarketingTuitionGroup[];
  onUpdateGroup: (groupId: string, patch: { label?: string; monthlyTuitionCents?: number }) => void;
  onAddGroup: () => void;
  onRemoveGroup: (groupId: string) => void;
  addGroupLabel?: string;
};

export default function MarketingTuitionGroupsStep({
  theme,
  fieldIdPrefix,
  groups,
  onUpdateGroup,
  onAddGroup,
  onRemoveGroup,
  addGroupLabel = "+ Add another age group",
}: MarketingTuitionGroupsStepProps) {
  const multiGroup = groups.length > 1;

  return (
    <div className="space-y-5">
      {groups.map((item) => (
        <div key={item.id} className={multiGroup ? "space-y-3" : undefined}>
          {multiGroup ? (
            <GroupNameInput
              theme={theme}
              id={`${fieldIdPrefix}-${item.id}-label`}
              value={item.label}
              onChange={(label) => onUpdateGroup(item.id, { label })}
            />
          ) : null}
          <CalculatorMoneyField
            theme={theme}
            dense
            hideLabel
            id={`${fieldIdPrefix}-${item.id}-tuition`}
            label="Monthly tuition"
            description={TUITION_HELP}
            valueCents={item.monthlyTuitionCents}
            onChangeCents={(monthlyTuitionCents) => onUpdateGroup(item.id, { monthlyTuitionCents })}
          />
          {multiGroup ? (
            <button
              type="button"
              onClick={() => onRemoveGroup(item.id)}
              className={`text-[12px] font-bold ${plannerFocusClass}`}
              style={{ color: theme.muted, fontFamily: theme.fontBody }}
            >
              Remove group
            </button>
          ) : null}
        </div>
      ))}
      <button
        type="button"
        data-planner-focus=""
        disabled={groups.length >= MAX_PROGRAM_GROUPS}
        onClick={onAddGroup}
        className={`text-[12px] font-bold disabled:opacity-40 ${plannerFocusClass}`}
        style={{ color: theme.primary, fontFamily: theme.fontBody }}
      >
        {addGroupLabel}
      </button>
    </div>
  );
}

function GroupNameInput({
  theme,
  id,
  value,
  onChange,
}: {
  theme: ParentThemeTokens;
  id: string;
  value: string;
  onChange: (label: string) => void;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="sr-only">
        Age group name
      </label>
      <input
        id={id}
        type="text"
        maxLength={40}
        autoComplete="off"
        placeholder="Age group name"
        value={value ?? ""}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(event) => onChange(event.target.value)}
        className={`h-12 w-full border bg-white px-3 text-[15px] outline-none ${calculatorFocusClass}`}
        style={{
          borderColor: focused ? theme.primary : theme.line,
          borderRadius: theme.radiusButton,
          color: theme.ink,
          fontFamily: theme.fontBody,
          boxShadow: focused ? `0 0 0 3px ${theme.primarySoft}` : undefined,
        }}
      />
    </div>
  );
}
