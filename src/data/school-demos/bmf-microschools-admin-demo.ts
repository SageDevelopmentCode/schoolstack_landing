/** Shared Purpose Academies logo — used everywhere branding appears in the demo. */
export const BMF_MICROSCHOOLS_LOGO = {
  src: "/images/demo/bmfmicroschools/logo.png",
  alt: "School to Purpose Academies logo",
  width: 63,
  height: 56,
} as const;

export const BMF_MICROSCHOOLS_ADMIN_LOGO = BMF_MICROSCHOOLS_LOGO;

export const BMF_MICROSCHOOLS_ADMIN_COMPACT_ROWS = 5;

export const BMF_MICROSCHOOLS_ADMIN_COLORS = {
  bg: "#f4f7fc",
  border: "#D3DDF2",
  borderStrong: "#1F46B0",
  accent: "#1F46B0",
  accentBright: "#2E5AD0",
  accentLight: "rgba(31, 70, 176, 0.10)",
  secondaryBtnBorder: "rgba(31, 70, 176, 0.22)",
  accentGlow: "rgba(31, 70, 176, 0.12)",
  accentMid: "#1F46B0",
  accentDark: "#16327F",
  clay: "#FFDE59",
  clayBg: "rgba(255, 222, 89, 0.22)",
  clayBorder: "rgba(255, 222, 89, 0.50)",
  textPrimary: "#15212E",
  textSecondary: "#556170",
} as const;

import { adminContentOverrides as bmfMicroschoolsAdminContentOverrides } from "./admin-content/bmf-microschools";
import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const bmfMicroschoolsAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "bmf-microschools",
  logo: BMF_MICROSCHOOLS_ADMIN_LOGO,
  colors: BMF_MICROSCHOOLS_ADMIN_COLORS,
  compactRows: BMF_MICROSCHOOLS_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "School to Purpose Academies",
    schoolShortName: "Purpose Academies",
    officeName: "Purpose Academies Office",
    locationSubtitle: "Phoenix, Arizona · Accredited microschools, Pre-K–12",
  },
  contentOverrides: bmfMicroschoolsAdminContentOverrides,
};
