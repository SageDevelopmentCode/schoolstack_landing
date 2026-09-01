"use client";

import { Check } from "lucide-react";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { ClassroomSignupRole } from "@/lib/classroom-signups/types";

type RoleCardProps = {
  theme: ParentThemeTokens;
  role: ClassroomSignupRole;
  fillCount: number;
  selected?: boolean;
  disabled?: boolean;
  onToggle?: () => void;
  readOnly?: boolean;
};

export default function RoleCard({
  theme,
  role,
  fillCount,
  selected = false,
  disabled = false,
  onToggle,
  readOnly = false,
}: RoleCardProps) {
  const isFull = fillCount >= role.quantityNeeded;
  const interactive = !readOnly && onToggle && (!isFull || selected);

  return (
    <button
      type="button"
      disabled={!interactive || disabled}
      onClick={interactive ? onToggle : undefined}
      className="w-full rounded-[14px] border p-4 text-left transition-colors"
      style={{
        borderColor: selected ? theme.primary : "#DCE4DC",
        backgroundColor: selected ? "#E9F2EA" : theme.white,
        opacity: isFull && !selected ? 0.65 : 1,
        cursor: interactive ? "pointer" : "default",
      }}
    >
      <div className="flex items-start gap-3">
        <span
          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border"
          style={{
            borderColor: selected ? theme.primary : "#DCE4DC",
            backgroundColor: selected ? theme.primary : theme.white,
            color: selected ? theme.white : "transparent",
          }}
        >
          {selected ? <Check className="h-3 w-3" /> : null}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold" style={{ color: theme.ink }}>
              {role.name}
            </p>
            <span className="shrink-0 text-xs font-medium" style={{ color: "#76828A" }}>
              {isFull && !selected ? "Full" : `${fillCount}/${role.quantityNeeded} filled`}
            </span>
          </div>
          {role.description ? (
            <p className="mt-1 text-xs leading-relaxed" style={{ color: "#76828A" }}>
              {role.description}
            </p>
          ) : null}
        </div>
      </div>
    </button>
  );
}
