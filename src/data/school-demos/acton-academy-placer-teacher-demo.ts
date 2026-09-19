export {
  ACTON_ACADEMY_PLACER_LOGO as ACTON_ACADEMY_PLACER_TEACHER_LOGO,
} from "./acton-academy-placer-admin-demo";

export const ACTON_ACADEMY_PLACER_TEACHER_OFFICE = "Acton Academy Placer Office";
export const ACTON_ACADEMY_PLACER_TEACHER_ACCENT = "#183E35";
export const ACTON_ACADEMY_PLACER_TEACHER_ACCENT_HOVER = "#102820";

export const ACTON_ACADEMY_PLACER_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  spark_studio: "Spark Studio",
  threshold_studio: "Threshold Studio",
  discovery_studio: "Discovery Studio",
  launchpad_studio: "Launchpad Studio",
};

export const ACTON_ACADEMY_PLACER_TEACHER_PROGRAM_ORDER = [
  "spark_studio",
  "threshold_studio",
  "discovery_studio",
  "launchpad_studio",
] as const;

import { ACTON_ACADEMY_PLACER_ADMIN_LOGO } from "./acton-academy-placer-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const actonAcademyPlacerTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "acton-academy-placer",
  logo: ACTON_ACADEMY_PLACER_ADMIN_LOGO,
  accent: ACTON_ACADEMY_PLACER_TEACHER_ACCENT,
  accentHover: ACTON_ACADEMY_PLACER_TEACHER_ACCENT_HOVER,
  programLabels: ACTON_ACADEMY_PLACER_TEACHER_PROGRAM_LABELS,
  programOrder: ACTON_ACADEMY_PLACER_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: ACTON_ACADEMY_PLACER_TEACHER_OFFICE,
  },
};
