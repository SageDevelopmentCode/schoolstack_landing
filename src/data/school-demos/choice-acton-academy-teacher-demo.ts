export {
  CHOICE_ACTON_ACADEMY_LOGO as CHOICE_ACTON_ACADEMY_TEACHER_LOGO,
} from "./choice-acton-academy-admin-demo";

export const CHOICE_ACTON_ACADEMY_TEACHER_OFFICE = "CHOICE Office";
export const CHOICE_ACTON_ACADEMY_TEACHER_ACCENT = "#0B2A67";
export const CHOICE_ACTON_ACADEMY_TEACHER_ACCENT_HOVER = "#1A3D85";

export const CHOICE_ACTON_ACADEMY_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  spark: "Spark Studio (4–7)",
  fire: "Fire Studio (7–11)",
  delta: "DELTA Studio (11–14)",
};

export const CHOICE_ACTON_ACADEMY_TEACHER_PROGRAM_ORDER = ["spark", "fire", "delta"] as const;

import { CHOICE_ACTON_ACADEMY_ADMIN_LOGO } from "./choice-acton-academy-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const choiceActonAcademyTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "choice-acton-academy",
  logo: CHOICE_ACTON_ACADEMY_ADMIN_LOGO,
  accent: CHOICE_ACTON_ACADEMY_TEACHER_ACCENT,
  accentHover: CHOICE_ACTON_ACADEMY_TEACHER_ACCENT_HOVER,
  programLabels: CHOICE_ACTON_ACADEMY_TEACHER_PROGRAM_LABELS,
  programOrder: CHOICE_ACTON_ACADEMY_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: CHOICE_ACTON_ACADEMY_TEACHER_OFFICE,
  },
};
