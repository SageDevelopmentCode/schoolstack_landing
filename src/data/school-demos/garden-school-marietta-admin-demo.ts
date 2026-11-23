/** Shared The Garden School of Marietta logo — used everywhere branding appears in the demo. */
export const GARDEN_SCHOOL_MARIETTA_LOGO = {
  src: "/images/demo/gardenschoolmarietta/logo.webp",
  alt: "The Garden School",
  width: 200,
  height: 34,
} as const;

export const GARDEN_SCHOOL_MARIETTA_ADMIN_LOGO = GARDEN_SCHOOL_MARIETTA_LOGO;

export const GARDEN_SCHOOL_MARIETTA_ADMIN_COMPACT_ROWS = 5;

export const GARDEN_SCHOOL_MARIETTA_ADMIN_COLORS = {
  bg: "#f8f6ef",
  border: "#DDD8C4",
  borderStrong: "#4B5F00",
  accent: "#4B5F00",
  accentBright: "#5E7510",
  accentLight: "rgba(75, 95, 0, 0.10)",
  secondaryBtnBorder: "rgba(75, 95, 0, 0.22)",
  accentGlow: "rgba(75, 95, 0, 0.12)",
  accentMid: "#4B5F00",
  accentDark: "#364500",
  clay: "#F2A830",
  clayBg: "rgba(242, 168, 48, 0.14)",
  clayBorder: "rgba(242, 168, 48, 0.38)",
  textPrimary: "#15212E",
  textSecondary: "#556170",
} as const;

import { adminContentOverrides as gardenSchoolMariettaAdminContentOverrides } from "./admin-content/garden-school-marietta";
import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const gardenSchoolMariettaAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "garden-school-marietta",
  logo: GARDEN_SCHOOL_MARIETTA_ADMIN_LOGO,
  colors: GARDEN_SCHOOL_MARIETTA_ADMIN_COLORS,
  compactRows: GARDEN_SCHOOL_MARIETTA_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "The Garden School of Marietta",
    schoolShortName: "The Garden School",
    officeName: "Garden School Office",
    locationSubtitle: "Marietta, Georgia · Waldorf-inspired forest school",
  },
  contentOverrides: gardenSchoolMariettaAdminContentOverrides,
};
