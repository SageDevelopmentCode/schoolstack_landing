/** Shared Gathered Oak Farm logo — used everywhere branding appears in the demo. */
export const GATHERED_OAK_FARM_LOGO = {
  src: "/images/demo/gatheredoakfarm/Gathered_Oak_Logo_all-1_edited_edited_pn.avif",
  alt: "Gathered Oak Farm",
  width: 180,
  height: 48,
} as const;

export const GATHERED_OAK_FARM_ADMIN_LOGO = GATHERED_OAK_FARM_LOGO;

export const GATHERED_OAK_FARM_ADMIN_COMPACT_ROWS = 5;

export const GATHERED_OAK_FARM_ADMIN_COLORS = {
  bg: "#FCF9F2",
  border: "#CDD7C6",
  borderStrong: "#29372B",
  accent: "#29372B",
  accentBright: "#4D6346",
  accentLight: "rgba(41, 55, 43, 0.10)",
  secondaryBtnBorder: "rgba(41, 55, 43, 0.22)",
  accentGlow: "rgba(41, 55, 43, 0.12)",
  accentMid: "#4D6346",
  accentDark: "#29372B",
  clay: "#A95136",
  clayBg: "rgba(169, 81, 54, 0.12)",
  clayBorder: "rgba(169, 81, 54, 0.35)",
  textPrimary: "#29372B",
  textSecondary: "#5F665C",
} as const;

import { adminContentOverrides as gatheredOakFarmAdminContentOverrides } from "./admin-content/gathered-oak-farm";

import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const gatheredOakFarmAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "gathered-oak-farm",
  logo: GATHERED_OAK_FARM_ADMIN_LOGO,
  colors: GATHERED_OAK_FARM_ADMIN_COLORS,
  compactRows: GATHERED_OAK_FARM_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "Gathered Oak Farm",
    schoolShortName: "Gathered Oak",
    officeName: "Gathered Oak Farm Office",
    locationSubtitle: "Gathered Oak Farm — Fallbrook, CA · Farm School K–8",
  },
  contentOverrides: gatheredOakFarmAdminContentOverrides,
};
