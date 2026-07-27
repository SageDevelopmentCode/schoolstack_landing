import { phaseAccentByNumber } from "@/data/school-demos/rooted-meadows-timeline";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

export const PORTAL_BASE_THEME = {
  pageBg: "#FAF8F4",
  surface: "#FFFFFF",
  border: "#E2E8F0",
  borderStrong: "#CBD5E1",
  textPrimary: "#0F172A",
  textSecondary: "#64748B",
  textFaint: "#94A3B8",
  headerBackdrop: "rgba(250, 248, 244, 0.92)",
  radiusSm: "10px",
  radiusMd: "14px",
  radiusLg: "20px",
} as const;

export type PortalTheme = typeof PORTAL_BASE_THEME & {
  accent: string;
  accentDark: string;
  accentLight: string;
  accentSoft: string;
  secondaryBtnBorder: string;
  clay: string;
  clayBg: string;
  clayBorder: string;
  stepBg: string;
};

export function buildPortalTheme(branding: OrganizationBranding): PortalTheme {
  const { colors } = branding;

  return {
    ...PORTAL_BASE_THEME,
    accent: colors.accent,
    accentDark: colors.accentDark,
    accentLight: colors.accentLight,
    accentSoft: colors.accentLight,
    secondaryBtnBorder: colors.secondaryBtnBorder,
    clay: colors.clay,
    clayBg: colors.clayBg,
    clayBorder: colors.clayBorder,
    stepBg: colors.accentLight,
  };
}

/** @deprecated Use buildPortalTheme(branding) via PortalThemeProvider */
export const MUDKITCHEN_PORTAL_THEME = {
  ...PORTAL_BASE_THEME,
  accent: "#827096",
  accentDark: "#5A4D68",
  accentLight: "rgba(130, 112, 150, 0.10)",
  accentSoft: "rgba(130, 112, 150, 0.10)",
  secondaryBtnBorder: "rgba(130, 112, 150, 0.22)",
  clay: "#b3b462",
  clayBg: "rgba(179, 180, 98, 0.12)",
  clayBorder: "rgba(179, 180, 98, 0.30)",
  stepBg: "rgba(130, 112, 150, 0.10)",
} satisfies PortalTheme;

export const MUDKITCHEN_LOGO_BRAND = {
  terracotta: "#C2694F",
  terracottaBright: "#D37D60",
  terracottaDark: "#A3533D",
  cream: "#F8F4EA",
  sage: "#627E47",
  wood: "#A65D3E",
} as const;

export { phaseAccentByNumber };
