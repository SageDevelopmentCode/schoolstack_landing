/** Shared MCP Academy logo — used everywhere branding appears in the demo. */
export const MCP_ACADEMY_LOGO = {
  src: "/images/demo/mcpacademy/logo.jpg",
  alt: "MCP Academy tree logo",
  width: 60,
  height: 50,
} as const;

export const MCP_ACADEMY_ADMIN_LOGO = MCP_ACADEMY_LOGO;

export const MCP_ACADEMY_ADMIN_COMPACT_ROWS = 5;

export const MCP_ACADEMY_ADMIN_COLORS = {
  bg: "#f6f8fb",
  border: "#D5DDE8",
  borderStrong: "#0B2F5B",
  accent: "#0B2F5B",
  accentBright: "#2859B6",
  accentLight: "rgba(11, 47, 91, 0.10)",
  secondaryBtnBorder: "rgba(11, 47, 91, 0.22)",
  accentGlow: "rgba(11, 47, 91, 0.12)",
  accentMid: "#0B2F5B",
  accentDark: "#071F3D",
  clay: "#F2B33D",
  clayBg: "rgba(242, 179, 61, 0.16)",
  clayBorder: "rgba(242, 179, 61, 0.40)",
  textPrimary: "#15212E",
  textSecondary: "#556170",
} as const;

import { adminContentOverrides as mcpAcademyAdminContentOverrides } from "./admin-content/mcp-academy";
import type { SchoolAdminDemoConfig } from "./demo-dashboard-types";

export const mcpAcademyAdminDemoConfig: SchoolAdminDemoConfig = {
  slug: "mcp-academy",
  logo: MCP_ACADEMY_ADMIN_LOGO,
  colors: MCP_ACADEMY_ADMIN_COLORS,
  compactRows: MCP_ACADEMY_ADMIN_COMPACT_ROWS,
  copy: {
    schoolName: "MCP Academy",
    schoolShortName: "MCPA",
    officeName: "MCPA Office",
    locationSubtitle: "Mansfield, Texas · PreK–8 microschool",
  },
  contentOverrides: mcpAcademyAdminContentOverrides,
};
