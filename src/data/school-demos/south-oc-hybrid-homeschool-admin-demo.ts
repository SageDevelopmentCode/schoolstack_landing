/** Shared SOCHH logo — used everywhere branding appears in the demo. */
export const SOUTH_OC_HYBRID_HOMESCHOOL_LOGO = {
  src: "/images/demo/southochybridhomeschool/logo.png",
  alt: "South OC Hybrid Homeschool logo",
  width: 109,
  height: 56,
} as const;

export const SOUTH_OC_HYBRID_HOMESCHOOL_ADMIN_LOGO = SOUTH_OC_HYBRID_HOMESCHOOL_LOGO;

export const SOUTH_OC_HYBRID_HOMESCHOOL_ADMIN_COMPACT_ROWS = 5;

export const SOUTH_OC_HYBRID_HOMESCHOOL_ADMIN_COLORS = {
  bg: "#f5f7fa",
  border: "#D5DCE8",
  borderStrong: "#0A2550",
  accent: "#0A2550",
  accentBright: "#1B3B72",
  accentLight: "rgba(10, 37, 80, 0.10)",
  secondaryBtnBorder: "rgba(10, 37, 80, 0.22)",
  accentGlow: "rgba(10, 37, 80, 0.12)",
  accentMid: "#0A2550",
  accentDark: "#051634",
  clay: "#E2B44F",
  clayBg: "rgba(226, 180, 79, 0.16)",
  clayBorder: "rgba(226, 180, 79, 0.40)",
  textPrimary: "#15212E",
  textSecondary: "#556170",
} as const;

import { adminContentOverrides as southOcHybridHomeschoolAdminContentOverrides } from "./admin-content/south-oc-hybrid-homeschool";
import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const southOcHybridHomeschoolAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "south-oc-hybrid-homeschool",
  logo: SOUTH_OC_HYBRID_HOMESCHOOL_ADMIN_LOGO,
  colors: SOUTH_OC_HYBRID_HOMESCHOOL_ADMIN_COLORS,
  compactRows: SOUTH_OC_HYBRID_HOMESCHOOL_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "South OC Hybrid Homeschool",
    schoolShortName: "SOCHH",
    officeName: "SOCHH Office",
    locationSubtitle: "Mission Viejo, California · Hybrid homeschool, TK–8th",
  },
  contentOverrides: southOcHybridHomeschoolAdminContentOverrides,
};
