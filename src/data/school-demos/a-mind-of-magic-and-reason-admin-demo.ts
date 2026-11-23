/** Shared AMOMAR logo — used everywhere branding appears in the demo. */
export const A_MIND_OF_MAGIC_AND_REASON_LOGO = {
  src: "/images/demo/amindofmagicandreason/logo.png",
  alt: "A Mind of Magic and Reason Learning Center logo",
  width: 90,
  height: 56,
} as const;

export const A_MIND_OF_MAGIC_AND_REASON_ADMIN_LOGO = A_MIND_OF_MAGIC_AND_REASON_LOGO;

export const A_MIND_OF_MAGIC_AND_REASON_ADMIN_COMPACT_ROWS = 5;

export const A_MIND_OF_MAGIC_AND_REASON_ADMIN_COLORS = {
  bg: "#f4f7fc",
  border: "#D3DEF0",
  borderStrong: "#0A4596",
  accent: "#0A4596",
  accentBright: "#1A58B0",
  accentLight: "rgba(10, 69, 150, 0.10)",
  secondaryBtnBorder: "rgba(10, 69, 150, 0.22)",
  accentGlow: "rgba(10, 69, 150, 0.12)",
  accentMid: "#0A4596",
  accentDark: "#072F68",
  clay: "#F5CF3A",
  clayBg: "rgba(245, 207, 58, 0.18)",
  clayBorder: "rgba(245, 207, 58, 0.45)",
  textPrimary: "#15212E",
  textSecondary: "#556170",
} as const;

import { adminContentOverrides as aMindOfMagicAndReasonAdminContentOverrides } from "./admin-content/a-mind-of-magic-and-reason";
import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const aMindOfMagicAndReasonAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "a-mind-of-magic-and-reason",
  logo: A_MIND_OF_MAGIC_AND_REASON_ADMIN_LOGO,
  colors: A_MIND_OF_MAGIC_AND_REASON_ADMIN_COLORS,
  compactRows: A_MIND_OF_MAGIC_AND_REASON_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "A Mind of Magic and Reason",
    schoolShortName: "AMOMAR",
    officeName: "AMOMAR Office",
    locationSubtitle: "Tucson, Arizona · Secular microschool, K–8",
  },
  contentOverrides: aMindOfMagicAndReasonAdminContentOverrides,
};
