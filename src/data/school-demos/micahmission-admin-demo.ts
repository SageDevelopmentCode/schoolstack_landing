/** Shared Micah's Mission School logo — use everywhere branding appears in the demo. */
export const MICAH_MISSION_ADMIN_LOGO = {
  src: "/images/demo/micahsmissionschool/Black-logo---no-background.webp",
  alt: "Micah's Mission School, Inc.",
  width: 220,
  height: 58,
  logoOnDarkClassName: "brightness-0 invert",
} as const;

export const MICAH_MISSION_ADMIN_COMPACT_ROWS = 5;

export const MICAH_MISSION_ADMIN_COLORS = {
  bg: "#FFFFFF",
  border: "#F2F2F2",
  borderStrong: "#E5E5E5",
  accent: "#2F5496",
  accentBright: "#3A65A8",
  accentLight: "rgba(47, 84, 150, 0.10)",
  secondaryBtnBorder: "rgba(47, 84, 150, 0.22)",
  accentGlow: "rgba(47, 84, 150, 0.12)",
  accentMid: "#3A65A8",
  accentDark: "#244273",
  clay: "#C28A2E",
  clayBg: "rgba(194, 138, 46, 0.12)",
  clayBorder: "rgba(194, 138, 46, 0.30)",
  textPrimary: "#222222",
  textSecondary: "#333333",
} as const;

import { adminContentOverrides as micahsMissionSchoolAdminContentOverrides } from "./admin-content/micahs-mission-school";

import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const micahsMissionSchoolAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "micahs-mission-school",
  logo: MICAH_MISSION_ADMIN_LOGO,
  colors: MICAH_MISSION_ADMIN_COLORS,
  compactRows: MICAH_MISSION_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "Micah's Mission School, Inc.",
    schoolShortName: "Micah's Mission",
    officeName: "Micah's Mission School, Inc. Office",
    locationSubtitle: "Mud Kitchen School — Spring / Summer 2026",
  },
  contentOverrides: micahsMissionSchoolAdminContentOverrides,
};
