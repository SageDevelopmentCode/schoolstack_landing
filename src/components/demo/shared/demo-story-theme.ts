import type { CSSProperties } from "react";
import {
  parentThemeCssVars,
  parentThemeToAdminCompat,
  type ParentThemeTokens,
} from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

export const DEMO_ADMIN_PAPER_BG = "#F7F9F7";
export const DEMO_DRAWER_PAPER_BG = "#F8FAF8";

export type DemoStoryAccentInput = {
  accent: string;
  accentHover: string;
  accentLight?: string;
  accentDark?: string;
};

/** Build School Day Story tokens for demo portals from per-school accent colors. */
export function buildDemoParentThemeTokens({
  accent,
  accentHover,
  accentLight,
  accentDark,
}: DemoStoryAccentInput): ParentThemeTokens {
  const primaryDark = accentDark ?? accentHover;
  const primaryLight =
    accentLight ?? `color-mix(in srgb, ${accent} 12%, white)`;

  return {
    paper: "#F8F8F3",
    ink: "#283943",
    muted: "#65777F",
    line: "#E4E8E1",
    cream: "#FFFDF7",
    white: "#FFFFFF",
    primary: accent,
    primaryDark,
    primaryLight,
    primarySoft: `color-mix(in srgb, ${accent} 12%, transparent)`,
    sage: "#CFE4D6",
    sky: "#8EBDCB",
    sun: "#EFC56E",
    coral: "#DF8A72",
    berry: "#A9667C",
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
    fontBody: "var(--font-dm-sans), system-ui, sans-serif",
  };
}

export function buildDemoAdminCompat(
  theme: ParentThemeTokens,
): AdminThemeTokens {
  return parentThemeToAdminCompat(theme);
}

export function demoStoryShellStyle(
  theme: ParentThemeTokens,
): CSSProperties {
  return {
    ...parentThemeCssVars(theme),
    backgroundColor: theme.paper,
    color: theme.ink,
    fontFamily: theme.fontBody,
  };
}

export function demoAdminShellStyle(
  theme: ParentThemeTokens,
): CSSProperties {
  return {
    ...parentThemeCssVars(theme),
    backgroundColor: DEMO_ADMIN_PAPER_BG,
    color: theme.ink,
    fontFamily: theme.fontBody,
  };
}
