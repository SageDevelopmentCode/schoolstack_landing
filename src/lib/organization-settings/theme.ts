import {
  resolveSchoolAdminStructureColors,
  SCHOOL_ADMIN_LIGHT_NEUTRALS,
} from "./school-admin-neutrals";
import type { OrganizationBranding } from "./types";

export type AdminThemeTokens = {
  bg: string;
  surface: string;
  elevated: string;
  input: string;
  inputBorder: string;
  border: string;
  borderStrong: string;
  accent: string;
  accentBright: string;
  accentLight: string;
  secondaryBtnBorder: string;
  accentGlow: string;
  accentMid: string;
  accentDark: string;
  clay: string;
  clayBg: string;
  clayBorder: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textQuaternary: string;
  success: string;
  successBg: string;
  successBorder: string;
  warning: string;
  warningBg: string;
  warningBorder: string;
  error: string;
  errorBg: string;
  errorBorder: string;
  info: string;
  infoBg: string;
  infoBorder: string;
  shadowCard: string;
  shadowMedium: string;
  r: { sm: string; md: string; lg: string; xl: string; full: string };
};

export function buildAdminThemeTokens(
  branding: OrganizationBranding,
): AdminThemeTokens {
  const { colors } = branding;
  const structure = resolveSchoolAdminStructureColors(colors);

  return {
    bg: structure.bg,
    surface: SCHOOL_ADMIN_LIGHT_NEUTRALS.surface,
    elevated: SCHOOL_ADMIN_LIGHT_NEUTRALS.elevated,
    input: SCHOOL_ADMIN_LIGHT_NEUTRALS.input,
    inputBorder: SCHOOL_ADMIN_LIGHT_NEUTRALS.inputBorder,
    border: structure.border,
    borderStrong: structure.borderStrong,
    accent: colors.accent,
    accentBright: colors.accentBright,
    accentLight: colors.accentLight,
    secondaryBtnBorder: colors.secondaryBtnBorder,
    accentGlow: colors.accentGlow,
    accentMid: colors.accentMid,
    accentDark: colors.accentDark,
    clay: colors.clay,
    clayBg: colors.clayBg,
    clayBorder: colors.clayBorder,
    textPrimary: structure.textPrimary,
    textSecondary: structure.textSecondary,
    textTertiary: SCHOOL_ADMIN_LIGHT_NEUTRALS.textTertiary,
    textQuaternary: SCHOOL_ADMIN_LIGHT_NEUTRALS.textQuaternary,
    success: "#16A34A",
    successBg: "rgba(22, 163, 74, 0.08)",
    successBorder: "rgba(22, 163, 74, 0.25)",
    warning: "#D97706",
    warningBg: "rgba(217, 119, 6, 0.08)",
    warningBorder: "rgba(217, 119, 6, 0.25)",
    error: "#DC2626",
    errorBg: "rgba(220, 38, 38, 0.08)",
    errorBorder: "rgba(220, 38, 38, 0.25)",
    info: "#0284C7",
    infoBg: "rgba(2, 132, 199, 0.08)",
    infoBorder: "rgba(2, 132, 199, 0.25)",
    shadowCard: SCHOOL_ADMIN_LIGHT_NEUTRALS.shadowCard,
    shadowMedium: SCHOOL_ADMIN_LIGHT_NEUTRALS.shadowMedium,
    r: { sm: "3px", md: "5px", lg: "6px", xl: "8px", full: "9999px" },
  };
}
