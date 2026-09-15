"use client";

import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type CommitteeStoryFilterPillProps = {
  active: boolean;
  label: string;
  count?: number;
  onClick: () => void;
  theme: ParentThemeTokens;
};

export default function CommitteeStoryFilterPill({
  active,
  label,
  count,
  onClick,
  theme,
}: CommitteeStoryFilterPillProps) {
  const displayLabel = count != null ? `${label} · ${count}` : label;

  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer rounded-[9px] border px-2.5 py-2 text-[11px] font-medium transition-colors"
      style={
        active
          ? {
              backgroundColor: "#E9F2EA",
              color: theme.primary,
              borderColor: "#BCD4C1",
              fontWeight: 700,
            }
          : {
              backgroundColor: theme.white,
              color: "#5D6D73",
              borderColor: "#DCE4DC",
            }
      }
    >
      {displayLabel}
    </button>
  );
}
