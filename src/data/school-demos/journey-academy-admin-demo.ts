/** Shared Journey Academy logo — used everywhere branding appears in the demo. */
export const JOURNEY_ACADEMY_LOGO = {
  src: "/images/demo/journeyacademy/logo.svg",
  alt: "Journey Academy",
  width: 140,
  height: 53,
} as const;

export const JOURNEY_ACADEMY_ADMIN_LOGO = JOURNEY_ACADEMY_LOGO;

export const JOURNEY_ACADEMY_ADMIN_COMPACT_ROWS = 5;

export const JOURNEY_ACADEMY_ADMIN_COLORS = {
  bg: "#f5f8fc",
  border: "#D4DFEC",
  borderStrong: "#1D5A9E",
  accent: "#1D5A9E",
  accentBright: "#297BD3",
  accentLight: "rgba(29, 90, 158, 0.10)",
  secondaryBtnBorder: "rgba(29, 90, 158, 0.22)",
  accentGlow: "rgba(29, 90, 158, 0.12)",
  accentMid: "#1D5A9E",
  accentDark: "#143F70",
  clay: "#F2C14E",
  clayBg: "rgba(242, 193, 78, 0.16)",
  clayBorder: "rgba(242, 193, 78, 0.40)",
  textPrimary: "#15212E",
  textSecondary: "#556170",
} as const;

import { adminContentOverrides as journeyAcademyAdminContentOverrides } from "./admin-content/journey-academy";
import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const journeyAcademyAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "journey-academy",
  logo: JOURNEY_ACADEMY_ADMIN_LOGO,
  colors: JOURNEY_ACADEMY_ADMIN_COLORS,
  compactRows: JOURNEY_ACADEMY_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "Journey Academy",
    schoolShortName: "Journey",
    officeName: "Journey Academy Office",
    locationSubtitle: "Littleton, Colorado · An Acton Academy affiliate",
  },
  contentOverrides: journeyAcademyAdminContentOverrides,
};
