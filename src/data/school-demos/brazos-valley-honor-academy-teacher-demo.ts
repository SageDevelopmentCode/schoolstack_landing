export {
  BVHA_LOGO as BVHA_TEACHER_LOGO,
} from "./brazos-valley-honor-academy-admin-demo";

export const BVHA_TEACHER_OFFICE = "Brazos Valley Honor Academy Office";
export const BVHA_TEACHER_ACCENT = "#7B1E2B";
export const BVHA_TEACHER_ACCENT_HOVER = "#5E1520";

export const BVHA_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  grades_k2: "K–2",
  grades_37: "Grades 3–7",
};

export const BVHA_TEACHER_PROGRAM_ORDER = [
  "grades_k2",
  "grades_37",
] as const;

import { BVHA_ADMIN_LOGO } from "./brazos-valley-honor-academy-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const brazosValleyHonorAcademyTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "brazos-valley-honor-academy",
  logo: BVHA_ADMIN_LOGO,
  accent: BVHA_TEACHER_ACCENT,
  accentHover: BVHA_TEACHER_ACCENT_HOVER,
  programLabels: BVHA_TEACHER_PROGRAM_LABELS,
  programOrder: BVHA_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: BVHA_TEACHER_OFFICE,
  },
};
