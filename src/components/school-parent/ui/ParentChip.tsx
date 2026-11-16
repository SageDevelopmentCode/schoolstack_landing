"use client";

import type { ReactNode } from "react";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { useAdminGardenSkin } from "@/components/school-admin/garden/skin";
import { GChip } from "@/components/school-parent/garden/ui";

export type ParentChipTone = "success" | "warning" | "alert" | "info";

type ParentChipProps = {
  theme: ParentThemeTokens;
  tone: ParentChipTone;
  children: ReactNode;
  className?: string;
};

function chipColors(theme: ParentThemeTokens, tone: ParentChipTone) {
  switch (tone) {
    case "success":
      return { bg: theme.successBg, color: theme.success };
    case "warning":
      return { bg: theme.warningBg, color: theme.warning };
    case "alert":
      return { bg: theme.alertBg, color: theme.alert };
    case "info":
      return { bg: theme.infoBg, color: theme.info };
  }
}

export default function ParentChip({
  theme,
  tone,
  children,
  className = "",
}: ParentChipProps) {
  // Shared teacher/parent pieces reused on Garden admin pages take the Garden chip.
  const skin = useAdminGardenSkin();
  if (skin) {
    return (
      <GChip tone={tone} className={className}>
        {children}
      </GChip>
    );
  }
  const colors = chipColors(theme, tone);

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-extrabold uppercase tracking-[0.04em] ${className}`}
      style={{
        backgroundColor: colors.bg,
        color: colors.color,
      }}
    >
      {children}
    </span>
  );
}
