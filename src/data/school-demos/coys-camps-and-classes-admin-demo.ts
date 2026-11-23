/** Shared Coy's Camps And Classes logo — used everywhere branding appears in the demo. */
export const COYS_CAMPS_AND_CLASSES_LOGO = {
  src: "/images/demo/coyscampsandclasses/logo.png",
  alt: "Coy's Camps And Classes",
  width: 90,
  height: 56,
} as const;

export const COYS_CAMPS_AND_CLASSES_ADMIN_LOGO = COYS_CAMPS_AND_CLASSES_LOGO;

export const COYS_CAMPS_AND_CLASSES_ADMIN_COMPACT_ROWS = 5;

export const COYS_CAMPS_AND_CLASSES_ADMIN_COLORS = {
  bg: "#f6f8fb",
  border: "#E2E7EE",
  borderStrong: "#2A3466",
  accent: "#2A3466",
  accentBright: "#3B4785",
  accentLight: "rgba(42, 52, 102, 0.10)",
  secondaryBtnBorder: "rgba(42, 52, 102, 0.22)",
  accentGlow: "rgba(42, 52, 102, 0.12)",
  accentMid: "#2A3466",
  accentDark: "#1C2347",
  clay: "#F4B23E",
  clayBg: "rgba(244, 178, 62, 0.14)",
  clayBorder: "rgba(244, 178, 62, 0.38)",
  textPrimary: "#15212E",
  textSecondary: "#556170",
} as const;

import { adminContentOverrides as coysCampsAndClassesAdminContentOverrides } from "./admin-content/coys-camps-and-classes";
import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const coysCampsAndClassesAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "coys-camps-and-classes",
  logo: COYS_CAMPS_AND_CLASSES_ADMIN_LOGO,
  colors: COYS_CAMPS_AND_CLASSES_ADMIN_COLORS,
  compactRows: COYS_CAMPS_AND_CLASSES_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "Coy's Camps And Classes",
    schoolShortName: "Coy's",
    officeName: "Coy's Camps And Classes Office",
    locationSubtitle: "Tucson, Arizona · K–8 microschool, chess and STEAM",
  },
  contentOverrides: coysCampsAndClassesAdminContentOverrides,
};
