import type { CSSProperties } from "react";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

export const BUILDER_CANVAS_BG = "#F7F9F7";
export const OUTLINE_ACTIVE_BG = "#EDF5EE";
export const OUTLINE_ACTIVE_BORDER = "#CDE0D0";

export function outlineRowInteractiveClassName(active: boolean): string {
  const base = "cursor-pointer transition-colors";
  if (active) {
    return base;
  }
  return `${base} hover:border-[#E5EDE6] hover:bg-[#F3F8F4]`;
}

export function outlineActiveRowStyle(
  active: boolean,
  theme?: ParentThemeTokens,
): CSSProperties {
  if (!active) {
    return { backgroundColor: "transparent", borderColor: "transparent" };
  }
  return {
    backgroundColor: theme?.primarySoft ?? OUTLINE_ACTIVE_BG,
    borderColor: theme?.sage ?? OUTLINE_ACTIVE_BORDER,
  };
}

export function outlineItemCardStyle(C: AdminThemeTokens, active: boolean) {
  return {
    border: `1px solid ${active ? OUTLINE_ACTIVE_BORDER : C.border}`,
    backgroundColor: active ? OUTLINE_ACTIVE_BG : C.surface,
  };
}
