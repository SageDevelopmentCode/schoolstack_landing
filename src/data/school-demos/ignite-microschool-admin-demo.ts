/** Shared Ignite Learning Center logo — used everywhere branding appears in the demo. */
export const IGNITE_MICROSCHOOL_LOGO = {
  src: "/images/demo/ignitemicroschool/logo.png",
  alt: "Ignite Learning Center",
  width: 96,
  height: 52,
} as const;

export const IGNITE_MICROSCHOOL_ADMIN_LOGO = IGNITE_MICROSCHOOL_LOGO;

export const IGNITE_MICROSCHOOL_ADMIN_COMPACT_ROWS = 5;

export const IGNITE_MICROSCHOOL_ADMIN_COLORS = {
  bg: "#f6f8fa",
  border: "#D5DEE8",
  borderStrong: "#16649F",
  accent: "#16649F",
  accentBright: "#1B75BC",
  accentLight: "rgba(22, 100, 159, 0.10)",
  secondaryBtnBorder: "rgba(22, 100, 159, 0.22)",
  accentGlow: "rgba(22, 100, 159, 0.12)",
  accentMid: "#16649F",
  accentDark: "#0F4A77",
  clay: "#F5A623",
  clayBg: "rgba(245, 166, 35, 0.14)",
  clayBorder: "rgba(245, 166, 35, 0.38)",
  textPrimary: "#15212E",
  textSecondary: "#556170",
} as const;

import { adminContentOverrides as igniteMicroschoolAdminContentOverrides } from "./admin-content/ignite-microschool";
import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const igniteMicroschoolAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "ignite-microschool",
  logo: IGNITE_MICROSCHOOL_ADMIN_LOGO,
  colors: IGNITE_MICROSCHOOL_ADMIN_COLORS,
  compactRows: IGNITE_MICROSCHOOL_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "Ignite Microschool",
    schoolShortName: "Ignite",
    officeName: "Ignite Office",
    locationSubtitle: "Greenville, South Carolina · STEAM microschool",
  },
  contentOverrides: igniteMicroschoolAdminContentOverrides,
};
