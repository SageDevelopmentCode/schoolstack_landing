import type { CSSProperties } from "react";
import type { DemoTheme } from "@/data/school-demos/types";
import {
  parentThemeCssVars,
  parentThemeToAdminCompat,
  type ParentThemeTokens,
} from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

export const DEMO_ADMIN_PAPER_BG = "#F7F9F7";
export const DEMO_DRAWER_PAPER_BG = "#F8FAF8";
export const DEMO_WEBSITE_PAPER_BG = "#F8F8F3";

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

/** Story CSS vars for config-driven school website demos. */
export function buildDemoWebsiteThemeVars(theme: DemoTheme): CSSProperties {
  const paper = theme.pageBg ?? DEMO_WEBSITE_PAPER_BG;

  return {
    "--demo-paper": paper,
    "--demo-ink": "#283943",
    "--demo-line": theme.lightBorder,
    "--demo-cream": "#FFFDF7",
    "--demo-radius-card": "22px",
    "--demo-radius-button": "12px",
    "--demo-shadow-card": "0 3px 10px rgba(50, 72, 61, 0.035)",
    "--demo-shadow-pill": "0 2px 8px rgba(32, 55, 49, 0.05)",
    "--demo-primary-soft": `color-mix(in srgb, ${theme.primary} 12%, transparent)`,
    "--demo-page-bg": paper,
  } as CSSProperties;
}

export function demoWebsiteShellStyle(theme: DemoTheme): CSSProperties {
  return {
    ...buildDemoWebsiteThemeVars(theme),
    backgroundColor: "var(--demo-paper)",
    color: "var(--demo-ink)",
  };
}
