"use client";

import { CircleAlert } from "lucide-react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type ParentNeedsScheduleBadgeProps = {
  C: AdminThemeTokens;
  label: string;
  size?: "sm" | "md";
};

export default function ParentNeedsScheduleBadge({
  C,
  label,
  size = "md",
}: ParentNeedsScheduleBadgeProps) {
  const isSmall = size === "sm";

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full font-medium ${
        isSmall ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-[11px]"
      }`}
      style={{
        backgroundColor: C.warningBg,
        color: C.warning,
        border: `1px solid ${C.warningBorder}`,
      }}
      data-testid="parent-billing-needs-schedule-badge"
    >
      <CircleAlert className={isSmall ? "h-3 w-3" : "h-3.5 w-3.5"} aria-hidden />
      {label}
    </span>
  );
}
