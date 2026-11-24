export {
  MCP_ACADEMY_LOGO as MCP_ACADEMY_TEACHER_LOGO,
} from "./mcp-academy-admin-demo";

export const MCP_ACADEMY_TEACHER_OFFICE = "MCPA Office";
export const MCP_ACADEMY_TEACHER_ACCENT = "#0B2F5B";
export const MCP_ACADEMY_TEACHER_ACCENT_HOVER = "#2859B6";

export const MCP_ACADEMY_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  prek: "PK3–PK5",
  k4: "Kinder–4th",
  upper: "5th–8th",
};

export const MCP_ACADEMY_TEACHER_PROGRAM_ORDER = ["prek", "k4", "upper"] as const;

import { MCP_ACADEMY_ADMIN_LOGO } from "./mcp-academy-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const mcpAcademyTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "mcp-academy",
  logo: MCP_ACADEMY_ADMIN_LOGO,
  accent: MCP_ACADEMY_TEACHER_ACCENT,
  accentHover: MCP_ACADEMY_TEACHER_ACCENT_HOVER,
  programLabels: MCP_ACADEMY_TEACHER_PROGRAM_LABELS,
  programOrder: MCP_ACADEMY_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: MCP_ACADEMY_TEACHER_OFFICE,
  },
};
