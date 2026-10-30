import type { ReactNode } from "react";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type AdminStoryFilterPillProps = {
  active: boolean;
  label: ReactNode;
  count?: number;
  onClick: () => void;
  theme: ParentThemeTokens;
  className?: string;
  "aria-label"?: string;
  "aria-pressed"?: boolean;
};

export default function AdminStoryFilterPill({
  active,
  label,
  count,
  onClick,
  theme,
  className = "",
  "aria-label": ariaLabel,
  "aria-pressed": ariaPressed,
}: AdminStoryFilterPillProps) {
  const displayLabel =
    count != null && typeof label === "string" ? `${label} · ${count}` : label;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      className={`cursor-pointer rounded-[9px] border px-2.5 py-2 text-[11px] font-medium transition-colors ${className}`.trim()}
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
