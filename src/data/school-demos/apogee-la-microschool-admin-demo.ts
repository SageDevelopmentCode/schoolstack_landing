/** Shared Apogee LA logo — used everywhere branding appears in the demo. */
export const APOGEE_LA_MICROSCHOOL_LOGO = {
  src: "/images/demo/apogeelamicroschool/logo.png",
  alt: "Apogee LA shield",
  width: 54,
  height: 56,
} as const;

export const APOGEE_LA_MICROSCHOOL_ADMIN_LOGO = APOGEE_LA_MICROSCHOOL_LOGO;

export const APOGEE_LA_MICROSCHOOL_ADMIN_COMPACT_ROWS = 5;

export const APOGEE_LA_MICROSCHOOL_ADMIN_COLORS = {
  bg: "#f7f6f2",
  border: "#DEDACF",
  borderStrong: "#131B32",
  accent: "#131B32",
  accentBright: "#24305A",
  accentLight: "rgba(19, 27, 50, 0.10)",
  secondaryBtnBorder: "rgba(19, 27, 50, 0.22)",
  accentGlow: "rgba(19, 27, 50, 0.12)",
  accentMid: "#131B32",
  accentDark: "#0A1022",
  clay: "#BB8E37",
  clayBg: "rgba(187, 142, 55, 0.16)",
  clayBorder: "rgba(187, 142, 55, 0.40)",
  textPrimary: "#15212E",
  textSecondary: "#556170",
} as const;

import { adminContentOverrides as apogeeLaMicroschoolAdminContentOverrides } from "./admin-content/apogee-la-microschool";
import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const apogeeLaMicroschoolAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "apogee-la-microschool",
  logo: APOGEE_LA_MICROSCHOOL_ADMIN_LOGO,
  colors: APOGEE_LA_MICROSCHOOL_ADMIN_COLORS,
  compactRows: APOGEE_LA_MICROSCHOOL_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "Apogee LA",
    schoolShortName: "Apogee",
    officeName: "Apogee LA Office",
    locationSubtitle: "Chatsworth, Los Angeles · Faith-based learning center, K–12",
  },
  contentOverrides: apogeeLaMicroschoolAdminContentOverrides,
};
