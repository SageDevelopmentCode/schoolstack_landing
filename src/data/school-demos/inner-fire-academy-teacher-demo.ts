export {
  INNER_FIRE_ACADEMY_LOGO as INNER_FIRE_ACADEMY_TEACHER_LOGO,
} from "./inner-fire-academy-admin-demo";

export const INNER_FIRE_ACADEMY_TEACHER_OFFICE = "Inner Fire Office";
export const INNER_FIRE_ACADEMY_TEACHER_ACCENT = "#222222";
export const INNER_FIRE_ACADEMY_TEACHER_ACCENT_HOVER = "#3A3A3A";

export const INNER_FIRE_ACADEMY_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  younger: "K–2 class",
  older: "Upper class (ages 8–12)",
};

export const INNER_FIRE_ACADEMY_TEACHER_PROGRAM_ORDER = ["younger", "older"] as const;

import { INNER_FIRE_ACADEMY_ADMIN_LOGO } from "./inner-fire-academy-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const innerFireAcademyTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "inner-fire-academy",
  logo: INNER_FIRE_ACADEMY_ADMIN_LOGO,
  accent: INNER_FIRE_ACADEMY_TEACHER_ACCENT,
  accentHover: INNER_FIRE_ACADEMY_TEACHER_ACCENT_HOVER,
  programLabels: INNER_FIRE_ACADEMY_TEACHER_PROGRAM_LABELS,
  programOrder: INNER_FIRE_ACADEMY_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: INNER_FIRE_ACADEMY_TEACHER_OFFICE,
  },
};
