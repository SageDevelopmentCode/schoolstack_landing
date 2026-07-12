import type { CSSProperties } from "react";
import type { AdminThemeTokens } from "./theme";

export type AdminButtonVariant =
  | "primary"
  | "secondary"
  | "neutral"
  | "danger"
  | "success"
  | "info"
  | "accentMid"
  | "warning";

/** Full-saturation fill, softened slightly with white so toolbar colors stay solid but less harsh. */
function softenedSolid(color: string, vividPercent = 84): string {
  return `color-mix(in srgb, ${color} ${vividPercent}%, white)`;
}

function solidSoftButton(color: string, vividPercent = 84): CSSProperties {
  const backgroundColor = softenedSolid(color, vividPercent);
  return {
    backgroundColor,
    color: "#FFFFFF",
    border: `1px solid ${backgroundColor}`,
  };
}

export function getAdminButtonStyle(
  C: AdminThemeTokens,
  variant: AdminButtonVariant,
): CSSProperties {
  switch (variant) {
    case "primary":
      return solidSoftButton(C.accent, 88);
    case "secondary":
      return {
        backgroundColor: C.accentLight,
        color: C.accent,
        border: `1px solid ${C.secondaryBtnBorder}`,
      };
    case "neutral":
      return {
        backgroundColor: C.elevated,
        color: C.textPrimary,
        border: `1px solid ${C.borderStrong}`,
      };
    case "danger":
      return solidSoftButton(C.error);
    case "success":
      return solidSoftButton(C.success);
    case "info":
      return solidSoftButton(C.info);
    case "accentMid":
      return solidSoftButton(C.accentMid, 92);
    case "warning":
      return solidSoftButton(C.warning);
    default:
      return {
        backgroundColor: C.accentLight,
        color: C.accent,
        border: `1px solid ${C.secondaryBtnBorder}`,
      };
  }
}
