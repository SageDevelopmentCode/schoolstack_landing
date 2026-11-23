export {
  MCP_ACADEMY_LOGO as MCP_ACADEMY_PARENT_LOGO,
  MCP_ACADEMY_ADMIN_COLORS,
} from "./mcp-academy-admin-demo";

export const MCP_ACADEMY_PARENT_ACCENT = "#0B2F5B";
export const MCP_ACADEMY_PARENT_ACCENT_HOVER = "#2859B6";
export const MCP_ACADEMY_PARENT_SCHOOL_NAME = "MCP Academy";
export const MCP_ACADEMY_PARENT_SCHOOL_SHORT = "MCPA";
export const MCP_ACADEMY_PARENT_OFFICE = "MCPA Office";

import { MCP_ACADEMY_ADMIN_LOGO } from "./mcp-academy-admin-demo";
import type { SchoolParentDemoConfig } from "./demo-dashboard-types";

export const mcpAcademyParentDemoConfig: SchoolParentDemoConfig = {
  slug: "mcp-academy",
  logo: MCP_ACADEMY_ADMIN_LOGO,
  colors: {
    accent: MCP_ACADEMY_PARENT_ACCENT,
    accentHover: MCP_ACADEMY_PARENT_ACCENT_HOVER,
  },
  copy: {
    schoolName: MCP_ACADEMY_PARENT_SCHOOL_NAME,
    schoolShortName: MCP_ACADEMY_PARENT_SCHOOL_SHORT,
    officeName: MCP_ACADEMY_PARENT_OFFICE,
  },
};
