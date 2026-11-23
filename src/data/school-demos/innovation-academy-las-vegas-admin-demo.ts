/** Shared Innovation Academy logo — used everywhere branding appears in the demo. */
export const INNOVATION_ACADEMY_LAS_VEGAS_LOGO = {
  src: "/images/demo/innovationacademylv/logo.png",
  alt: "Innovation Academy",
  width: 110,
  height: 57,
} as const;

export const INNOVATION_ACADEMY_LAS_VEGAS_ADMIN_LOGO = INNOVATION_ACADEMY_LAS_VEGAS_LOGO;

export const INNOVATION_ACADEMY_LAS_VEGAS_ADMIN_COMPACT_ROWS = 5;

export const INNOVATION_ACADEMY_LAS_VEGAS_ADMIN_COLORS = {
  bg: "#f5f9f8",
  border: "#D3E2E0",
  borderStrong: "#2B6F6A",
  accent: "#2B6F6A",
  accentBright: "#358B84",
  accentLight: "rgba(43, 111, 106, 0.10)",
  secondaryBtnBorder: "rgba(43, 111, 106, 0.22)",
  accentGlow: "rgba(43, 111, 106, 0.12)",
  accentMid: "#2B6F6A",
  accentDark: "#1D4C49",
  clay: "#EE543E",
  clayBg: "rgba(238, 84, 62, 0.12)",
  clayBorder: "rgba(238, 84, 62, 0.35)",
  textPrimary: "#15212E",
  textSecondary: "#556170",
} as const;

import { adminContentOverrides as innovationAcademyLasVegasAdminContentOverrides } from "./admin-content/innovation-academy-las-vegas";
import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const innovationAcademyLasVegasAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "innovation-academy-las-vegas",
  logo: INNOVATION_ACADEMY_LAS_VEGAS_ADMIN_LOGO,
  colors: INNOVATION_ACADEMY_LAS_VEGAS_ADMIN_COLORS,
  compactRows: INNOVATION_ACADEMY_LAS_VEGAS_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "Innovation Academy",
    schoolShortName: "Innovation Academy",
    officeName: "Innovation Academy Office",
    locationSubtitle: "Las Vegas, Nevada · Montessori-based K–8",
  },
  contentOverrides: innovationAcademyLasVegasAdminContentOverrides,
};
