/** Shared Wildcat Microschool logo — used everywhere branding appears in the demo. */
export const WILDCAT_MICROSCHOOL_LOGO = {
  src: "/images/demo/wildcat/logo-original-500.png",
  alt: "Wildcat Microschool",
  width: 56,
  height: 56,
} as const;

export const WILDCAT_MICROSCHOOL_ADMIN_LOGO = WILDCAT_MICROSCHOOL_LOGO;

export const WILDCAT_MICROSCHOOL_ADMIN_COMPACT_ROWS = 5;

export const WILDCAT_MICROSCHOOL_ADMIN_COLORS = {
  bg: "#f7fafc",
  border: "#E4E7EB",
  borderStrong: "#071C37",
  accent: "#071C37",
  accentBright: "#123056",
  accentLight: "rgba(7, 28, 55, 0.10)",
  secondaryBtnBorder: "rgba(7, 28, 55, 0.22)",
  accentGlow: "rgba(7, 28, 55, 0.12)",
  accentMid: "#071C37",
  accentDark: "#041426",
  clay: "#FF020A",
  clayBg: "rgba(255, 2, 10, 0.12)",
  clayBorder: "rgba(255, 2, 10, 0.35)",
  textPrimary: "#071C37",
  textSecondary: "#536174",
} as const;

import { adminContentOverrides as wildcatMicroschoolAdminContentOverrides } from "./admin-content/wildcat-microschool";
import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const wildcatMicroschoolAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "wildcat-microschool",
  logo: WILDCAT_MICROSCHOOL_ADMIN_LOGO,
  colors: WILDCAT_MICROSCHOOL_ADMIN_COLORS,
  compactRows: WILDCAT_MICROSCHOOL_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "Wildcat Microschool",
    schoolShortName: "Wildcat",
    officeName: "Wildcat Microschool Office",
    locationSubtitle: "Haverhill, New Hampshire · Homeschool learning pod",
  },
  contentOverrides: wildcatMicroschoolAdminContentOverrides,
};
