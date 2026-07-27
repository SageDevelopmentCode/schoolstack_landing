import { ROOTED_MEADOWS_ADMIN_LOGO } from "@/data/school-demos/rootedmeadows-admin-demo";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

export const ROOTED_MEADOWS_PORTAL_BRANDING = {
  colors: {
    accent: "#827096",
    accentBright: "#6E5D7F",
    accentMid: "#6E5D7F",
    accentDark: "#5A4D68",
    accentLight: "rgba(130, 112, 150, 0.10)",
    accentGlow: "rgba(130, 112, 150, 0.12)",
    bg: "#F8FAFC",
    border: "#E2E8F0",
    borderStrong: "#CBD5E1",
    textPrimary: "#0F172A",
    textSecondary: "#64748B",
    clay: "#b3b462",
    clayBg: "rgba(179, 180, 98, 0.12)",
    clayBorder: "rgba(179, 180, 98, 0.30)",
    secondaryBtnBorder: "rgba(130, 112, 150, 0.22)",
  },
  logo: ROOTED_MEADOWS_ADMIN_LOGO,
  typography: {
    headingFont: "Lora",
    bodyFont: "Geist",
  },
} satisfies OrganizationBranding;
