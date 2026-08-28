/** Shared Arizona Gifted Academy logo — use everywhere branding appears in the demo. */
export const ARIZONA_GIFTED_ACADEMY_ADMIN_LOGO = {
  src: "/images/demo/arizonagiftedacademy/Arizona+Gifted+Academy+PNG.webp",
  alt: "Arizona Gifted Academy",
  width: 180,
  height: 52,
} as const;

export const ARIZONA_GIFTED_ACADEMY_ADMIN_COMPACT_ROWS = 5;

export const ARIZONA_GIFTED_ACADEMY_ADMIN_COLORS = {
  bg: "#FEFAF5",
  border: "#E8DFC8",
  borderStrong: "#D9C9A3",
  accent: "#1B3147",
  accentBright: "#008000",
  accentLight: "rgba(27, 49, 71, 0.10)",
  secondaryBtnBorder: "rgba(27, 49, 71, 0.22)",
  accentGlow: "rgba(0, 128, 0, 0.12)",
  accentMid: "#006600",
  accentDark: "#142638",
  clay: "#E5A82E",
  clayBg: "rgba(229, 168, 46, 0.12)",
  clayBorder: "rgba(229, 168, 46, 0.30)",
  textPrimary: "#1B3147",
  textSecondary: "#5A6570",
} as const;

import { adminContentOverrides as arizonaGiftedAcademyAdminContentOverrides } from "./admin-content/arizona-gifted-academy";

import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const arizonaGiftedAcademyAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "arizona-gifted-academy",
  logo: {
  src: "/images/demo/arizonagiftedacademy/Arizona+Gifted+Academy+PNG.webp",
  alt: "Arizona Gifted Academy",
  width: 180,
  height: 52,
},
  colors: {
  bg: "#FEFAF5",
  border: "#E8DFC8",
  borderStrong: "#D9C9A3",
  accent: "#1B3147",
  accentBright: "#008000",
  accentLight: "rgba(27, 49, 71, 0.10)",
  secondaryBtnBorder: "rgba(27, 49, 71, 0.22)",
  accentGlow: "rgba(0, 128, 0, 0.12)",
  accentMid: "#006600",
  accentDark: "#142638",
  clay: "#E5A82E",
  clayBg: "rgba(229, 168, 46, 0.12)",
  clayBorder: "rgba(229, 168, 46, 0.30)",
  textPrimary: "#1B3147",
  textSecondary: "#5A6570",
} as SchoolAdminDemoConfig["colors"],
  compactRows: 5,
  copy: {
    schoolName: "Arizona Gifted Academy",
    schoolShortName: "Arizona Gifted",
    officeName: "Arizona Gifted Academy Office",
    locationSubtitle: "Mud Kitchen School — Spring / Summer 2026",
  },
  contentOverrides: arizonaGiftedAcademyAdminContentOverrides,
};
