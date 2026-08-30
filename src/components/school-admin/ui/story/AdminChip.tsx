import type { ReactNode } from "react";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

export type AdminChipTone = "success" | "warning" | "alert" | "info" | "purple";

type AdminChipProps = {
  theme: ParentThemeTokens;
  tone: AdminChipTone;
  children: ReactNode;
  className?: string;
};

function chipColors(theme: ParentThemeTokens, tone: AdminChipTone) {
  switch (tone) {
    case "success":
      return { bg: "#EAF7EE", color: "#348457" };
    case "warning":
      return { bg: "#FFF3DF", color: "#A26B22" };
    case "alert":
      return { bg: theme.alertBg, color: theme.alert };
    case "info":
      return { bg: "#E9F4F7", color: "#39788D" };
    case "purple":
      return { bg: "#F0EBF3", color: "#765E89" };
  }
}

export default function AdminChip({
  theme,
  tone,
  children,
  className = "",
}: AdminChipProps) {
  const colors = chipColors(theme, tone);

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-[7px] py-1 text-[10px] font-extrabold ${className}`}
      style={{
        backgroundColor: colors.bg,
        color: colors.color,
      }}
    >
      {children}
    </span>
  );
}
