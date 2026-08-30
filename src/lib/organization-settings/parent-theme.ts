import type { CSSProperties } from "react";
import type { AdminThemeTokens } from "./theme";
import type { OrganizationBranding } from "./types";

/** School Day Story design tokens for the parent portal. */
export type ParentThemeTokens = {
  paper: string;
  ink: string;
  muted: string;
  line: string;
  cream: string;
  white: string;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primarySoft: string;
  sage: string;
  sky: string;
  sun: string;
  coral: string;
  berry: string;
  success: string;
  successBg: string;
  warning: string;
  warningBg: string;
  alert: string;
  alertBg: string;
  info: string;
  infoBg: string;
  shadowCard: string;
  shadowPill: string;
  radiusCard: string;
  radiusButton: string;
  fontDisplay: string;
  fontBody: string;
};

const STORY_NEUTRALS = {
  paper: "#F8F8F3",
  ink: "#283943",
  muted: "#65777F",
  line: "#E4E8E1",
  cream: "#FFFDF7",
  white: "#FFFFFF",
} as const;

const STORY_SEMANTIC = {
  sage: "#CFE4D6",
  sky: "#8EBDCB",
  sun: "#EFC56E",
  coral: "#DF8A72",
  berry: "#A9667C",
} as const;

const CHILD_ACCENT_BG = [
  "#DCEBD4",
  "#DCEBF2",
  "#F8E0E7",
  "#F3EAD6",
  "#E8E4F0",
] as const;

const CHILD_ACCENT_ICON = [
  STORY_SEMANTIC.sage,
  STORY_SEMANTIC.sky,
  STORY_SEMANTIC.berry,
  STORY_SEMANTIC.sun,
  "#B8A8C8",
] as const;

export function buildParentThemeTokens(
  branding: OrganizationBranding,
): ParentThemeTokens {
  const { colors, typography } = branding;
  const bodyFont = typography.bodyFont?.trim();

  return {
    ...STORY_NEUTRALS,
    primary: colors.accent,
    primaryDark: colors.accentDark,
    primaryLight: colors.accentLight,
    primarySoft: colors.accentGlow || `${colors.accent}1f`,
    ...STORY_SEMANTIC,
    success: "#34825A",
    successBg: "#EBF8EF",
    warning: "#986F14",
    warningBg: "#FFF4D9",
    alert: "#B5594A",
    alertBg: "#FBEDEB",
    info: "#39788C",
    infoBg: "#E9F4F7",
    shadowCard: "0 3px 10px rgba(50, 72, 61, 0.035)",
    shadowPill: "0 2px 8px rgba(32, 55, 49, 0.05)",
    radiusCard: "22px",
    radiusButton: "12px",
    fontDisplay: "var(--font-fraunces), Georgia, serif",
    fontBody: bodyFont || "var(--font-dm-sans), system-ui, sans-serif",
  };
}

export function childAccentBg(index: number): string {
  return CHILD_ACCENT_BG[index % CHILD_ACCENT_BG.length];
}

export function childAccentColor(index: number): string {
  return CHILD_ACCENT_ICON[index % CHILD_ACCENT_ICON.length];
}

export function parentThemeCssVars(
  theme: ParentThemeTokens,
): CSSProperties {
  return {
    "--parent-paper": theme.paper,
    "--parent-ink": theme.ink,
    "--parent-muted": theme.muted,
    "--parent-line": theme.line,
    "--parent-cream": theme.cream,
    "--parent-white": theme.white,
    "--parent-primary": theme.primary,
    "--parent-primary-dark": theme.primaryDark,
    "--parent-primary-light": theme.primaryLight,
    "--parent-primary-soft": theme.primarySoft,
    "--parent-sage": theme.sage,
    "--parent-sky": theme.sky,
    "--parent-sun": theme.sun,
    "--parent-coral": theme.coral,
    "--parent-berry": theme.berry,
    "--parent-success": theme.success,
    "--parent-success-bg": theme.successBg,
    "--parent-warning": theme.warning,
    "--parent-warning-bg": theme.warningBg,
    "--parent-alert": theme.alert,
    "--parent-alert-bg": theme.alertBg,
    "--parent-info": theme.info,
    "--parent-info-bg": theme.infoBg,
    "--parent-radius-card": theme.radiusCard,
    "--parent-radius-button": theme.radiusButton,
    "--parent-shadow-card": theme.shadowCard,
    "--parent-shadow-pill": theme.shadowPill,
    "--parent-font-display": theme.fontDisplay,
    "--parent-font-body": theme.fontBody,
  } as CSSProperties;
}

/** Bridge for components not yet migrated off AdminThemeTokens. */
export function parentThemeToAdminCompat(
  theme: ParentThemeTokens,
): AdminThemeTokens {
  return {
    bg: theme.paper,
    surface: theme.white,
    elevated: theme.cream,
    input: theme.white,
    inputBorder: theme.line,
    border: theme.line,
    borderStrong: theme.line,
    accent: theme.primary,
    accentBright: theme.primaryDark,
    accentLight: theme.primaryLight,
    secondaryBtnBorder: theme.line,
    accentGlow: theme.primarySoft,
    accentMid: theme.primary,
    accentDark: theme.primaryDark,
    clay: theme.coral,
    clayBg: theme.alertBg,
    clayBorder: theme.coral,
    textPrimary: theme.ink,
    textSecondary: theme.muted,
    textTertiary: theme.muted,
    textQuaternary: theme.muted,
    success: theme.success,
    successBg: theme.successBg,
    successBorder: theme.success,
    warning: theme.warning,
    warningBg: theme.warningBg,
    warningBorder: theme.warning,
    error: theme.alert,
    errorBg: theme.alertBg,
    errorBorder: theme.alert,
    info: theme.info,
    infoBg: theme.infoBg,
    infoBorder: theme.info,
    shadowCard: theme.shadowCard,
    shadowMedium: theme.shadowCard,
    r: {
      sm: "8px",
      md: theme.radiusButton,
      lg: theme.radiusCard,
      xl: theme.radiusCard,
      full: "9999px",
    },
  };
}
