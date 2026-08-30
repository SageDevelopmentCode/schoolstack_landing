import type { CSSProperties } from "react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type StaffRowStyleOptions = {
  isSelected: boolean;
  isHovered: boolean;
};

export function adminStaffRowStyle(
  C: AdminThemeTokens,
  { isSelected, isHovered }: StaffRowStyleOptions,
): CSSProperties {
  return {
    backgroundColor: isSelected ? "#E9F2EA" : isHovered ? "#FBFCFB" : C.surface,
    borderBottom: `1px solid ${C.border}`,
    borderLeft: `3px solid ${isSelected ? C.accent : "transparent"}`,
  };
}
