/** Shared Bright Minds logo — used everywhere branding appears in the demo. */
export const BRIGHT_MINDS_FUTURE_LEADERS_LOGO = {
  src: "/images/demo/brightmindsfutureleaders/logo.png",
  alt: "Bright Minds Future Leaders logo",
  width: 56,
  height: 56,
} as const;

export const BRIGHT_MINDS_FUTURE_LEADERS_ADMIN_LOGO = BRIGHT_MINDS_FUTURE_LEADERS_LOGO;

export const BRIGHT_MINDS_FUTURE_LEADERS_ADMIN_COMPACT_ROWS = 5;

export const BRIGHT_MINDS_FUTURE_LEADERS_ADMIN_COLORS = {
  bg: "#f8f5fc",
  border: "#E4D8F2",
  borderStrong: "#7E22CE",
  accent: "#7E22CE",
  accentBright: "#9333EA",
  accentLight: "rgba(126, 34, 206, 0.10)",
  secondaryBtnBorder: "rgba(126, 34, 206, 0.22)",
  accentGlow: "rgba(126, 34, 206, 0.12)",
  accentMid: "#7E22CE",
  accentDark: "#5B1796",
  clay: "#FFCC00",
  clayBg: "rgba(255, 204, 0, 0.20)",
  clayBorder: "rgba(255, 204, 0, 0.45)",
  textPrimary: "#15212E",
  textSecondary: "#556170",
} as const;

import { adminContentOverrides as brightMindsFutureLeadersAdminContentOverrides } from "./admin-content/bright-minds-future-leaders";
import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const brightMindsFutureLeadersAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "bright-minds-future-leaders",
  logo: BRIGHT_MINDS_FUTURE_LEADERS_ADMIN_LOGO,
  colors: BRIGHT_MINDS_FUTURE_LEADERS_ADMIN_COLORS,
  compactRows: BRIGHT_MINDS_FUTURE_LEADERS_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "Bright Minds Future Leaders",
    schoolShortName: "Bright Minds",
    officeName: "Bright Minds Office",
    locationSubtitle: "New Caney, Texas · Private micro school, K–5",
  },
  contentOverrides: brightMindsFutureLeadersAdminContentOverrides,
};
