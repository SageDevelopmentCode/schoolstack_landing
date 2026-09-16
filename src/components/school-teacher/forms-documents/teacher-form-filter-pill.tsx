"use client";

import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type TeacherFormFilterPillProps = {
  active: boolean;
  label: string;
  count?: number;
  onClick: () => void;
  theme: ParentThemeTokens;
};

export default function TeacherFormFilterPill({
  active,
  label,
  count,
  onClick,
  theme,
}: TeacherFormFilterPillProps) {
  const displayLabel = count != null ? `${label} · ${count}` : label;

  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors"
      style={
        active
          ? {
              backgroundColor: theme.primarySoft,
              color: theme.primary,
              borderColor: "#BCD4C1",
            }
          : {
              backgroundColor: theme.white,
              color: theme.muted,
              borderColor: theme.line,
            }
      }
    >
      {displayLabel}
    </button>
  );
}
