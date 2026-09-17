/** Shared Naples MicroSchools logo — used everywhere branding appears in the demo. */
export const NAPLES_MICROSCHOOLS_LOGO = {
  src: "/images/demo/naplesmicroschool/Naples+MicroSchools+Logo+(6).webp",
  alt: "Naples MicroSchools",
  width: 180,
  height: 48,
} as const;

export const NAPLES_MICROSCHOOLS_ADMIN_LOGO = NAPLES_MICROSCHOOLS_LOGO;

export const NAPLES_MICROSCHOOLS_ADMIN_COMPACT_ROWS = 5;

export const NAPLES_MICROSCHOOLS_ADMIN_COLORS = {
  bg: "#F8F4E9",
  border: "#E9DFC9",
  borderStrong: "#4F7B50",
  accent: "#4F7B50",
  accentBright: "#244D3D",
  accentLight: "rgba(79, 123, 80, 0.10)",
  secondaryBtnBorder: "rgba(79, 123, 80, 0.22)",
  accentGlow: "rgba(79, 123, 80, 0.12)",
  accentMid: "#244D3D",
  accentDark: "#1F2B25",
  clay: "#D99A3D",
  clayBg: "rgba(217, 154, 61, 0.12)",
  clayBorder: "rgba(217, 154, 61, 0.35)",
  textPrimary: "#1F2B25",
  textSecondary: "#5C6B62",
} as const;

import { adminContentOverrides as naplesMicroschoolsAdminContentOverrides } from "./admin-content/naples-microschools";

import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const naplesMicroschoolsAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "naples-microschools",
  logo: NAPLES_MICROSCHOOLS_ADMIN_LOGO,
  colors: NAPLES_MICROSCHOOLS_ADMIN_COLORS,
  compactRows: NAPLES_MICROSCHOOLS_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "Naples MicroSchools",
    schoolShortName: "NMS",
    officeName: "Naples MicroSchools Office",
    locationSubtitle: "Naples MicroSchools — Golden Gate Estates, FL · 2026–27 Enrollment",
  },
  contentOverrides: naplesMicroschoolsAdminContentOverrides,
};
