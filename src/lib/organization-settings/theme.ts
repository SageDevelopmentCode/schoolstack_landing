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

  return {
    bg: colors.bg,
    surface: "#FFFFFF",
    elevated: "#FDFCFB",
    input: "#FAFAFA",
    inputBorder: "#E4E4E7",
    border: colors.border,
    borderStrong: colors.borderStrong,
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
    textPrimary: colors.textPrimary,
    textSecondary: colors.textSecondary,
    textTertiary: "#8A7B6E",
    textQuaternary: "#B8A898",
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
    shadowCard: "0 1px 3px rgba(43,36,29,0.06), 0 1px 2px rgba(43,36,29,0.04)",
    shadowMedium: "0 4px 16px rgba(43,36,29,0.08)",
    r: { sm: "3px", md: "5px", lg: "6px", xl: "8px", full: "9999px" },
  };
}
