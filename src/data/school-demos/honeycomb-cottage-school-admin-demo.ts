/** Shared Honeycomb Cottage School logo (the bee-in-hexagon mark) — used everywhere branding appears in the demo. */
export const HONEYCOMB_COTTAGE_SCHOOL_LOGO = {
  src: "/images/demo/honeycombcottageschool/logo-mark.png",
  alt: "Honeycomb Cottage School",
  width: 56,
  height: 43,
} as const;

export const HONEYCOMB_COTTAGE_SCHOOL_ADMIN_LOGO = HONEYCOMB_COTTAGE_SCHOOL_LOGO;

export const HONEYCOMB_COTTAGE_SCHOOL_ADMIN_COMPACT_ROWS = 5;

export const HONEYCOMB_COTTAGE_SCHOOL_ADMIN_COLORS = {
  bg: "#f8f8f4",
  border: "#E6E3D8",
  borderStrong: "#2F5D5B",
  accent: "#2F5D5B",
  accentBright: "#3B7371",
  accentLight: "rgba(47, 93, 91, 0.10)",
  secondaryBtnBorder: "rgba(47, 93, 91, 0.22)",
  accentGlow: "rgba(47, 93, 91, 0.12)",
  accentMid: "#2F5D5B",
  accentDark: "#1F4140",
  clay: "#E0A82E",
  clayBg: "rgba(224, 168, 46, 0.14)",
  clayBorder: "rgba(224, 168, 46, 0.38)",
  textPrimary: "#1F2523",
  textSecondary: "#5B6461",
} as const;

import { adminContentOverrides as honeycombCottageSchoolAdminContentOverrides } from "./admin-content/honeycomb-cottage-school";
import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const honeycombCottageSchoolAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "honeycomb-cottage-school",
  logo: HONEYCOMB_COTTAGE_SCHOOL_ADMIN_LOGO,
  colors: HONEYCOMB_COTTAGE_SCHOOL_ADMIN_COLORS,
  compactRows: HONEYCOMB_COTTAGE_SCHOOL_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "Honeycomb Cottage School",
    schoolShortName: "Honeycomb",
    officeName: "Honeycomb Cottage School",
    locationSubtitle: "Lehi & Traverse Mountain, Utah · Waldorf-inspired hybrid homeschool",
  },
  contentOverrides: honeycombCottageSchoolAdminContentOverrides,
};
