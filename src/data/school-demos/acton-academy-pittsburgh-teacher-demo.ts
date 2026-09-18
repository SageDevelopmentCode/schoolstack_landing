export {
  ACTON_ACADEMY_PITTSBURGH_LOGO as ACTON_ACADEMY_PITTSBURGH_TEACHER_LOGO,
} from "./acton-academy-pittsburgh-admin-demo";

export const ACTON_ACADEMY_PITTSBURGH_TEACHER_OFFICE = "Acton Academy Pittsburgh Office";
export const ACTON_ACADEMY_PITTSBURGH_TEACHER_ACCENT = "#2F5A47";
export const ACTON_ACADEMY_PITTSBURGH_TEACHER_ACCENT_HOVER = "#163C31";

export const ACTON_ACADEMY_PITTSBURGH_TEACHER_PROGRAM_LABELS: Record<string, string> = {
  spark_studio: "Spark Studio",
  elementary_studio: "Elementary Studio",
  middle_school_studio: "Middle School Studio",
  launchpad_studio: "Launchpad Studio",
};

export const ACTON_ACADEMY_PITTSBURGH_TEACHER_PROGRAM_ORDER = [
  "spark_studio",
  "elementary_studio",
  "middle_school_studio",
  "launchpad_studio",
] as const;

import { ACTON_ACADEMY_PITTSBURGH_ADMIN_LOGO } from "./acton-academy-pittsburgh-admin-demo";
import type { SchoolTeacherDemoConfig } from "./demo-dashboard-types";

export const actonAcademyPittsburghTeacherDemoConfig: SchoolTeacherDemoConfig = {
  slug: "acton-academy-pittsburgh",
  logo: ACTON_ACADEMY_PITTSBURGH_ADMIN_LOGO,
  accent: ACTON_ACADEMY_PITTSBURGH_TEACHER_ACCENT,
  accentHover: ACTON_ACADEMY_PITTSBURGH_TEACHER_ACCENT_HOVER,
  programLabels: ACTON_ACADEMY_PITTSBURGH_TEACHER_PROGRAM_LABELS,
  programOrder: ACTON_ACADEMY_PITTSBURGH_TEACHER_PROGRAM_ORDER,
  copy: {
    officeName: ACTON_ACADEMY_PITTSBURGH_TEACHER_OFFICE,
  },
};
