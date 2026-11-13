"use client";

import { CircleAlert } from "lucide-react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type ParentNeedsScheduleBadgeProps = {
  /** Kept for call-site compatibility; the badge now uses Garden tokens. */
  C?: AdminThemeTokens;
  label: string;
  size?: "sm" | "md";
};

/** "Schedule needed" warning chip (Garden butter). Renders inside ParentGardenFrame. */
export default function ParentNeedsScheduleBadge({
  label,
  size = "md",
}: ParentNeedsScheduleBadgeProps) {
  const isSmall = size === "sm";

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--sf-butter)] font-extrabold text-[#6b4f00] ${
        isSmall ? "px-1.5 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs"
      }`}
      data-testid="parent-billing-needs-schedule-badge"
    >
      <CircleAlert className={isSmall ? "h-3 w-3" : "h-3.5 w-3.5"} aria-hidden />
      {label}
    </span>
  );
}
