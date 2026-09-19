export {
  TAPESTRY_ACADEMY_LOGO as TAPESTRY_ACADEMY_TEACHER_LOGO,
} from "./tapestry-academy-admin-demo";

export const TAPESTRY_ACADEMY_TEACHER_OFFICE = "Tapestry Academy Office";
export const TAPESTRY_ACADEMY_TEACHER_ACCENT = "#2E7D7B";
export const TAPESTRY_ACADEMY_TEACHER_ACCENT_HOVER = "#256A68";

export const TAPESTRY_ACADEMY_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  foundations: "Foundations Cohort (Ages 7–11)",
  middle: "Middle Cohort (Ages 10–14)",
  high_school: "High School Cohort (Ages 14–18)",
};

export const TAPESTRY_ACADEMY_TEACHER_PROGRAM_ORDER = [
  "foundations",
  "middle",
  "high_school",
] as const;

import { TAPESTRY_ACADEMY_ADMIN_LOGO } from "./tapestry-academy-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const tapestryAcademyTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "tapestry-academy",
  logo: TAPESTRY_ACADEMY_ADMIN_LOGO,
  accent: TAPESTRY_ACADEMY_TEACHER_ACCENT,
  accentHover: TAPESTRY_ACADEMY_TEACHER_ACCENT_HOVER,
  programLabels: TAPESTRY_ACADEMY_TEACHER_PROGRAM_LABELS,
  programOrder: TAPESTRY_ACADEMY_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: TAPESTRY_ACADEMY_TEACHER_OFFICE,
  },
};
