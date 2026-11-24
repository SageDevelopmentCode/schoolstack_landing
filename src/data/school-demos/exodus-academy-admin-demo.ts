/** Shared Exodus Academy logo — used everywhere branding appears in the demo. */
export const EXODUS_ACADEMY_LOGO = {
  src: "/images/demo/exodusacademy/logo.png",
  alt: "Exodus Academy logo",
  width: 93,
  height: 56,
} as const;

export const EXODUS_ACADEMY_ADMIN_LOGO = EXODUS_ACADEMY_LOGO;

export const EXODUS_ACADEMY_ADMIN_COMPACT_ROWS = 5;

export const EXODUS_ACADEMY_ADMIN_COLORS = {
  bg: "#f8f6f9",
  border: "#E2D8E8",
  borderStrong: "#4F0A62",
  accent: "#4F0A62",
  accentBright: "#651C7A",
  accentLight: "rgba(79, 10, 98, 0.09)",
  secondaryBtnBorder: "rgba(79, 10, 98, 0.22)",
  accentGlow: "rgba(79, 10, 98, 0.12)",
  accentMid: "#4F0A62",
  accentDark: "#360544",
  clay: "#B8902A",
  clayBg: "rgba(184, 144, 42, 0.16)",
  clayBorder: "rgba(184, 144, 42, 0.40)",
  textPrimary: "#15212E",
  textSecondary: "#556170",
} as const;

import { adminContentOverrides as exodusAcademyAdminContentOverrides } from "./admin-content/exodus-academy";
import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const exodusAcademyAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "exodus-academy",
  logo: EXODUS_ACADEMY_ADMIN_LOGO,
  colors: EXODUS_ACADEMY_ADMIN_COLORS,
  compactRows: EXODUS_ACADEMY_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "Exodus Academy",
    schoolShortName: "Exodus",
    officeName: "Exodus Office",
    locationSubtitle: "Inman, South Carolina · Christian microschool, 2K–12",
  },
  contentOverrides: exodusAcademyAdminContentOverrides,
};
