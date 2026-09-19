/** Shared Asheboro Hybrid Academy logo — used everywhere branding appears in the demo. */
export const ASHEBORO_HYBRID_ACADEMY_LOGO = {
  src: "/images/demo/asheboro/Warrior_Full.webp",
  alt: "Asheboro Hybrid Academy",
  width: 140,
  height: 72,
} as const;

export const ASHEBORO_HYBRID_ACADEMY_ADMIN_LOGO = ASHEBORO_HYBRID_ACADEMY_LOGO;

export const ASHEBORO_HYBRID_ACADEMY_ADMIN_COMPACT_ROWS = 5;

export const ASHEBORO_HYBRID_ACADEMY_ADMIN_COLORS = {
  bg: "#F7F3E8",
  border: "#D8D4C7",
  borderStrong: "#0B2545",
  accent: "#0B2545",
  accentBright: "#07192F",
  accentLight: "rgba(11, 37, 69, 0.10)",
  secondaryBtnBorder: "rgba(11, 37, 69, 0.22)",
  accentGlow: "rgba(11, 37, 69, 0.12)",
  accentMid: "#07192F",
  accentDark: "#07192F",
  clay: "#D8A62A",
  clayBg: "rgba(216, 166, 42, 0.12)",
  clayBorder: "rgba(216, 166, 42, 0.35)",
  textPrimary: "#0B2545",
  textSecondary: "#5C6875",
} as const;

import { adminContentOverrides as asheboroHybridAcademyAdminContentOverrides } from "./admin-content/asheboro-hybrid-academy";

import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const asheboroHybridAcademyAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "asheboro-hybrid-academy",
  logo: ASHEBORO_HYBRID_ACADEMY_ADMIN_LOGO,
  colors: ASHEBORO_HYBRID_ACADEMY_ADMIN_COLORS,
  compactRows: ASHEBORO_HYBRID_ACADEMY_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "Asheboro Hybrid Academy",
    schoolShortName: "AHA",
    officeName: "Asheboro Hybrid Academy Office",
    locationSubtitle:
      "Asheboro Hybrid Academy — Asheboro, NC · Christian Hybrid K–12",
  },
  contentOverrides: asheboroHybridAcademyAdminContentOverrides,
};
