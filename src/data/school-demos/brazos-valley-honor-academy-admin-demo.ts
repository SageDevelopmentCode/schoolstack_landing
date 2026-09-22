/** Shared Brazos Valley Honor Academy logo — text wordmark used everywhere branding appears in the demo. */
export const BVHA_LOGO = {
  src: "",
  alt: "Brazos Valley Honor Academy",
  text: "Brazos Valley Honor Academy",
  textClassName:
    "font-heading text-xs sm:text-sm font-semibold leading-tight tracking-tight",
} as const;

export const BVHA_ADMIN_LOGO = BVHA_LOGO;

export const BVHA_ADMIN_COMPACT_ROWS = 5;

export const BVHA_ADMIN_COLORS = {
  bg: "#F7F2E8",
  border: "#DDD3C2",
  borderStrong: "#123B5D",
  accent: "#7B1E2B",
  accentBright: "#5E1520",
  accentLight: "rgba(123, 30, 43, 0.10)",
  secondaryBtnBorder: "rgba(123, 30, 43, 0.22)",
  accentGlow: "rgba(123, 30, 43, 0.12)",
  accentMid: "#123B5D",
  accentDark: "#5E1520",
  clay: "#C9A24A",
  clayBg: "rgba(201, 162, 74, 0.12)",
  clayBorder: "rgba(201, 162, 74, 0.35)",
  textPrimary: "#1C2730",
  textSecondary: "#55616B",
} as const;

import { adminContentOverrides as brazosValleyHonorAcademyAdminContentOverrides } from "./admin-content/brazos-valley-honor-academy";

import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const brazosValleyHonorAcademyAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "brazos-valley-honor-academy",
  logo: BVHA_ADMIN_LOGO,
  colors: BVHA_ADMIN_COLORS,
  compactRows: BVHA_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "Brazos Valley Honor Academy",
    schoolShortName: "BVHA",
    officeName: "Brazos Valley Honor Academy Office",
    locationSubtitle:
      "Brazos Valley Honor Academy — Navasota, TX · Christian K–7 Hybrid",
  },
  contentOverrides: brazosValleyHonorAcademyAdminContentOverrides,
};
