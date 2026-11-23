export {
  PRAXIS_ELITE_SPORTS_ACADEMY_LOGO as PRAXIS_ELITE_SPORTS_ACADEMY_TEACHER_LOGO,
} from "./praxis-elite-sports-academy-admin-demo";

export const PRAXIS_ELITE_SPORTS_ACADEMY_TEACHER_OFFICE = "Praxis Elite Office";
export const PRAXIS_ELITE_SPORTS_ACADEMY_TEACHER_ACCENT = "#161616";
export const PRAXIS_ELITE_SPORTS_ACADEMY_TEACHER_ACCENT_HOVER = "#333333";

export const PRAXIS_ELITE_SPORTS_ACADEMY_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  middle: "Grades 6–8",
  eightPlus: "8th+ year",
};

export const PRAXIS_ELITE_SPORTS_ACADEMY_TEACHER_PROGRAM_ORDER = ["middle", "eightPlus"] as const;

import { PRAXIS_ELITE_SPORTS_ACADEMY_ADMIN_LOGO } from "./praxis-elite-sports-academy-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const praxisEliteSportsAcademyTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "praxis-elite-sports-academy",
  logo: PRAXIS_ELITE_SPORTS_ACADEMY_ADMIN_LOGO,
  accent: PRAXIS_ELITE_SPORTS_ACADEMY_TEACHER_ACCENT,
  accentHover: PRAXIS_ELITE_SPORTS_ACADEMY_TEACHER_ACCENT_HOVER,
  programLabels: PRAXIS_ELITE_SPORTS_ACADEMY_TEACHER_PROGRAM_LABELS,
  programOrder: PRAXIS_ELITE_SPORTS_ACADEMY_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: PRAXIS_ELITE_SPORTS_ACADEMY_TEACHER_OFFICE,
  },
};
