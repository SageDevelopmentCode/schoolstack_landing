import type { CSSProperties } from "react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type StudentRowStyleOptions = {
  isSelected: boolean;
  isHovered: boolean;
};

export function adminStudentRowStyle(
  C: AdminThemeTokens,
  { isSelected, isHovered }: StudentRowStyleOptions,
): CSSProperties {
  return {
    backgroundColor: isSelected ? "#E9F2EA" : isHovered ? "#FBFCFB" : C.surface,
    borderBottom: `1px solid ${C.border}`,
    borderLeft: `3px solid ${isSelected ? C.accent : "transparent"}`,
  };
}
