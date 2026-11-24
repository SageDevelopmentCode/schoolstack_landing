export {
  MIRUS_ACADEMY_LOGO as MIRUS_ACADEMY_TEACHER_LOGO,
} from "./mirus-academy-admin-demo";

export const MIRUS_ACADEMY_TEACHER_OFFICE = "Mirus Office";
export const MIRUS_ACADEMY_TEACHER_ACCENT = "#132460";
export const MIRUS_ACADEMY_TEACHER_ACCENT_HOVER = "#24398A";

export const MIRUS_ACADEMY_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  lower: "8th–10th grade",
  upper: "11th–12th grade",
};

export const MIRUS_ACADEMY_TEACHER_PROGRAM_ORDER = ["lower", "upper"] as const;

import { MIRUS_ACADEMY_ADMIN_LOGO } from "./mirus-academy-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const mirusAcademyTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "mirus-academy",
  logo: MIRUS_ACADEMY_ADMIN_LOGO,
  accent: MIRUS_ACADEMY_TEACHER_ACCENT,
  accentHover: MIRUS_ACADEMY_TEACHER_ACCENT_HOVER,
  programLabels: MIRUS_ACADEMY_TEACHER_PROGRAM_LABELS,
  programOrder: MIRUS_ACADEMY_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: MIRUS_ACADEMY_TEACHER_OFFICE,
  },
};
