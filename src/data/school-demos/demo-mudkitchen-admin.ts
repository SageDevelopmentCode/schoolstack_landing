import { DEFAULT_BRANDING } from "@/lib/organization-settings/catalog";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { MUDKITCHEN_PORTAL_THEME } from "@/lib/mudkitchen-portal/theme";

export const DEMO_MUDKITCHEN_SCHOOL_NAME = "Mud School";
export const DEMO_MUDKITCHEN_SCHOOL_SHORT = "Mud School";

/** MudKitchen product accents + logo; fictional school name is used in newsletter copy. */
export function buildDemoMudKitchenAdminBranding(): OrganizationBranding {
  const t = MUDKITCHEN_PORTAL_THEME;
  return {
    ...DEFAULT_BRANDING,
    colors: {
      ...DEFAULT_BRANDING.colors,
      accent: t.accent,
      accentDark: t.accentDark,
      accentBright: t.accentDark,
      accentLight: t.accentLight,
      accentGlow: t.accentSoft,
      secondaryBtnBorder: t.secondaryBtnBorder,
      clay: t.clay,
      clayBg: t.clayBg,
      clayBorder: t.clayBorder,
      bg: t.pageBg,
      border: t.border,
      borderStrong: t.borderStrong,
      textPrimary: t.textPrimary,
      textSecondary: t.textSecondary,
    },
    logo: {
      src: "/images/Logo.webp",
      alt: "MudKitchen",
      width: 132,
      height: 36,
    },
  };
}
