export {
  BLUE_HORIZON_STUDIO_LOGO as BLUE_HORIZON_STUDIO_TEACHER_LOGO,
} from "./blue-horizon-studio-admin-demo";

export const BLUE_HORIZON_STUDIO_TEACHER_OFFICE = "Blue Horizon Studio";
export const BLUE_HORIZON_STUDIO_TEACHER_ACCENT = "#122954";
export const BLUE_HORIZON_STUDIO_TEACHER_ACCENT_HOVER = "#23407A";

export const BLUE_HORIZON_STUDIO_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  standard: "Standard Horizon",
  extended: "Extended Horizon (Studio Beyond)",
};

export const BLUE_HORIZON_STUDIO_TEACHER_PROGRAM_ORDER = ["standard", "extended"] as const;

import { BLUE_HORIZON_STUDIO_ADMIN_LOGO } from "./blue-horizon-studio-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const blueHorizonStudioTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "blue-horizon-studio",
  logo: BLUE_HORIZON_STUDIO_ADMIN_LOGO,
  accent: BLUE_HORIZON_STUDIO_TEACHER_ACCENT,
  accentHover: BLUE_HORIZON_STUDIO_TEACHER_ACCENT_HOVER,
  programLabels: BLUE_HORIZON_STUDIO_TEACHER_PROGRAM_LABELS,
  programOrder: BLUE_HORIZON_STUDIO_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: BLUE_HORIZON_STUDIO_TEACHER_OFFICE,
  },
};
